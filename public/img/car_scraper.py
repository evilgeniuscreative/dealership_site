import os
import re
import csv
import time
import random
import requests
import traceback
import string
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

# Create car_images directory if it doesn't exist
if not os.path.exists('car_images'):
    os.makedirs('car_images')

# CSV file to store listing information
CSV_FILE = 'car_listings.csv'
CSV_HEADERS = ['ID', 'Title', 'Price', 'URL', 'MapAndAttrs', 'PostingBody', 'ImageCount', 'ImageFileName']

# Create CSV file with headers if it doesn't exist
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=CSV_HEADERS)
        writer.writeheader()

def get_headers():
    """Generate random headers to avoid detection"""
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    ]
    
    headers = {
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
    }
    
    return headers

def get_tor_session():
    """Function to create a new requests session"""
    # For simplicity, we'll just use a regular session
    # In a full Tor implementation, you'd connect to the Tor SOCKS proxy
    return requests.Session()

def renew_tor_ip():
    """Function to get a new Tor IP address"""
    # In a real implementation, this would connect to Tor control port
    # and send a NEWNYM signal
    print("Renewing IP address...")
    time.sleep(2)  # Simulate the delay of getting a new IP
    
def random_delay(min_seconds=1, max_seconds=5):
    """Add a random delay to avoid rate limiting"""
    delay = random.uniform(min_seconds, max_seconds)
    print(f"Waiting for {delay:.2f} seconds...")
    time.sleep(delay)

def number_to_alpha(n):
    """Convert a number to alphabetical equivalent (A=1, B=2, ..., Z=26, AA=27, etc.)"""
    result = ""
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        result = chr(65 + remainder) + result
    return result if result else "A"  # Return "A" for n=0 or n=1

def remove_spaces(text):
    """Remove all spaces from text"""
    return text.replace(" ", "")

def get_first_n_chars_no_spaces(text, n=25):
    """
    Get first n characters from text, not counting spaces.
    If the resulting text is shorter than n characters, 
    fill in the rest with the alphabet in reverse order.
    """
    text_no_spaces = remove_spaces(text)
    result = text_no_spaces[:n]
    
    # If the result is shorter than n characters, fill in with reverse alphabet
    if len(result) < n:
        # Create a string of the alphabet in reverse order
        reverse_alphabet = string.ascii_uppercase[::-1]
        # Calculate how many characters we need to add
        chars_needed = n - len(result)
        # Add the reverse alphabet characters (cycling if needed)
        filler = (reverse_alphabet * (chars_needed // 26 + 1))[:chars_needed]
        result += filler
        
    return result

def download_images_from_listing(listing, session_count=0, listing_counter=1):
    try:
        # Create dictionary to hold all listing data for CSV
        listing_data = {
            'ID': str(listing_counter),
            'Title': '',
            'Price': '',
            'URL': '',
            'MapAndAttrs': '',
            'PostingBody': '',
            'ImageCount': 0,
            'ImageFileName': ''
        }
        
        # Extract listing ID from counter (no longer using the original ID)
        listing_id = str(listing_counter)
        
        # Try to extract price information from the listing
        price_span = listing.select_one('span.priceinfo')
        if price_span:
            listing_data['Price'] = price_span.text.strip()
        
        # Extract listing URL
        listing_link = listing.select_one('a.posting-title')
        if not listing_link:
            # Try an alternative selector for the link
            listing_link = listing.select_one('a')
            
        if not listing_link:
            print("No link found in listing")
            return session_count
        
        # Extract href and make sure it's a full URL
        href = listing_link.get('href')
        if not href:
            print("No href attribute in listing link")
            return session_count
            
        full_url = href if href.startswith('http') else urljoin("https://washingtondc.craigslist.org", href)
        print(f"Accessing URL: {full_url}")
        listing_data['URL'] = full_url
        
        # Extract title from the span.label inside the link
        title_span = listing_link.select_one('span.label')
        if title_span:
            title = title_span.text.strip()
            listing_data['Title'] = title
        else:
            # Try other methods to get title
            title_elem = listing.select_one('div.title')
            if not title_elem:
                # Try alt text from image if title not found
                img = listing.select_one('img')
                title = img.get('alt', '') if img else f"car_{listing_id}"
            else:
                title = title_elem.text.strip()
            
            listing_data['Title'] = title
            
        # Clean the title for use as a filename
        title = re.sub(r'[\\/*?:"<>|]', "", title)[:50]
        
        print(f"Processing listing: {title}")
        
        # Get fresh headers
        headers = get_headers()
        
        # Get Tor session
        session = get_tor_session()
        
        # Random delay before accessing the listing page
        random_delay()
        
        # Visit the individual listing page
        try:
            response = session.get(full_url, headers=headers, timeout=30)
            print(f"Status code: {response.status_code}")
            if response.status_code != 200:
                print(f"Failed to access listing page: {full_url}")
                # Still write what we have to CSV
                write_to_csv(listing_data)
                return session_count
        except Exception as e:
            print(f"Error accessing listing page: {e}")
            # Still write what we have to CSV
            write_to_csv(listing_data)
            return session_count
            
        detail_soup = BeautifulSoup(response.text, 'html.parser')
        
        # Debug: Save HTML to analyze
        with open(f"debug_listing_{listing_id}.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        
        # Extract mapAndAttrs data
        map_attrs = detail_soup.select_one('.mapAndAttrs')
        if map_attrs:
            # Get all text from mapAndAttrs and clean it up
            map_attrs_text = map_attrs.get_text(separator=' ', strip=True)
            # Remove excessive whitespace
            map_attrs_text = re.sub(r'\s+', ' ', map_attrs_text)
            listing_data['MapAndAttrs'] = map_attrs_text
            print(f"MapAndAttrs found: {map_attrs_text[:100]}...")
        
        # Extract posting body
        posting_body = detail_soup.select_one('#postingbody')
        if posting_body:
            # Remove any "QR Code Link to This Post" text which is common in Craigslist
            qr_link = posting_body.select_one('.print-qrcode-container')
            if qr_link:
                qr_link.decompose()
                
            body_text = posting_body.get_text(separator=' ', strip=True)
            # Remove excessive whitespace
            body_text = re.sub(r'\s+', ' ', body_text)
            listing_data['PostingBody'] = body_text
            print(f"Posting body found: {body_text[:100]}...")
        
        # Find image URLs on the detail page - try multiple selectors
        selectors_to_try = [
            'picture img',
            'div.swipe-wrap img',
            '.gallery img',
            'img[data-src]',
            'img'  # Last resort
        ]
        
        image_elements = []
        for selector in selectors_to_try:
            image_elements = detail_soup.select(selector)
            if image_elements:
                print(f"Found {len(image_elements)} images with selector: {selector}")
                break
        
        # Only process the first image
        if image_elements:
            img = image_elements[0]  # Take only the first image
            img_url = None
            
            # Try several attributes where the image URL might be found
            for attr in ['src', 'data-src', 'data-url', 'data-hq-url']:
                if attr in img.attrs:
                    img_url = img[attr]
                    if img_url and not img_url.endswith('blank.gif'):
                        break
            
            # Handle full-resolution images if available
            if img_url and '600x450' in img_url:
                # Try to get a higher resolution version
                img_url = img_url.replace('600x450', '1200x900')
                
            print(f"Image URL found: {img_url}")
            
            if img_url and not img_url.endswith(('.gif', 'blank.gif')):
                try:
                    # Random delay before downloading the image
                    random_delay()
                    
                    # Get fresh headers
                    img_headers = get_headers()
                    
                    img_response = session.get(img_url, headers=img_headers, timeout=30)
                    if img_response.status_code == 200:
                        # Create a new filename using the alphabetical equivalent of the listing counter
                        alpha_id = number_to_alpha(listing_counter)
                        
                        # Get the first 25 characters from the title (excluding spaces)
                        title_part = get_first_n_chars_no_spaces(title, 25)
                        
                        # Create the new filename: alpha_id + title_part + listing_id + extension
                        new_filename = f"{alpha_id}{title_part}{listing_id}.jpg"
                        
                        # Remove any remaining spaces from the filename
                        new_filename = remove_spaces(new_filename)
                        
                        # Full path to save the image
                        filename = f"car_images/{new_filename}"
                        
                        with open(filename, 'wb') as f:
                            f.write(img_response.content)
                        print(f"Downloaded: {filename}")
                        
                        # Save image details in listing data
                        listing_data['ImageCount'] = 1
                        listing_data['ImageFileName'] = os.path.basename(filename)
                        
                        # Rotate IP after download
                        session_count += 1
                        if session_count % 5 == 0:  # Change IP after every 5 downloads
                            renew_tor_ip()
                    else:
                        print(f"Failed to download image: {img_url}, status: {img_response.status_code}")
                except Exception as e:
                    print(f"Error downloading image: {e}")
                    # Try to renew IP if we encounter an error
                    renew_tor_ip()
        else:
            print(f"No images found for listing: {title}")
            
        # Write the collected data to CSV
        write_to_csv(listing_data)
                         
        return session_count
    
    except Exception as e:
        print(f"Error processing listing: {e}")
        traceback.print_exc()
        return session_count

def write_to_csv(listing_data):
    """Write listing data to CSV file"""
    try:
        # Check if Title is empty and MapAndAttrs has content
        if (not listing_data['Title'] or listing_data['Title'] == '') and listing_data['MapAndAttrs']:
            # Extract the part before the first colon
            map_attrs_text = listing_data['MapAndAttrs']
            colon_pos = map_attrs_text.find(':')
            if colon_pos > 0:
                listing_data['Title'] = map_attrs_text[:colon_pos].strip()
                print(f"Moved MapAndAttrs section to Title: {listing_data['Title']}")
                
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=CSV_HEADERS)
            writer.writerow(listing_data)
            print(f"Wrote listing {listing_data['ID']} to CSV")
    except Exception as e:
        print(f"Error writing to CSV: {e}")
        traceback.print_exc()

def process_direct_listing(url, session_count=0, listing_counter=1):
    """Process a single listing directly from its URL"""
    try:
        print(f"Directly processing listing URL: {url}")
        
        # Create dictionary to hold listing data for CSV
        listing_data = {
            'ID': str(listing_counter),  # Use counter as ID
            'Title': '',
            'Price': '',
            'URL': url,
            'MapAndAttrs': '',
            'PostingBody': '',
            'ImageCount': 0,
            'ImageFileName': ''
        }
        
        # We no longer extract ID from URL
        
        # Get fresh headers
        headers = get_headers()
        
        # Get Tor session
        session = get_tor_session()
        
        # Random delay before accessing the listing page
        random_delay()
        
        # Visit the listing page
        try:
            response = session.get(url, headers=headers, timeout=30)
            print(f"Status code: {response.status_code}")
            if response.status_code != 200:
                print(f"Failed to access listing page: {url}")
                write_to_csv(listing_data)
                return session_count
        except Exception as e:
            print(f"Error accessing listing page: {e}")
            write_to_csv(listing_data)
            return session_count
            
        detail_soup = BeautifulSoup(response.text, 'html.parser')
        
        # Debug: Save HTML to analyze
        with open(f"debug_listing_{listing_data['ID']}.html", "w", encoding="utf-8") as f:
            f.write(response.text)
            
        # Extract title from the page
        title_elem = detail_soup.select_one('h1.posting-title span.postingtitletext')
        if title_elem:
            title = title_elem.text.strip()
            listing_data['Title'] = title
        else:
            # Try alternate selectors
            title_elem = detail_soup.select_one('span.postingtitletext')
            if title_elem:
                title = title_elem.text.strip()
                listing_data['Title'] = title
            else:
                # Use the page title as a last resort
                title = detail_soup.title.text if detail_soup.title else "Unknown Title"
                listing_data['Title'] = title
                
        # If we still don't have a title, use the URL
        if not listing_data['Title']:
            title_parts = url.split('/')
            if len(title_parts) > 1:
                title = title_parts[-2].replace('-', ' ')
                listing_data['Title'] = title.title()  # Convert to title case
        
        # Extract price
        price_elem = detail_soup.select_one('span.price')
        if price_elem:
            listing_data['Price'] = price_elem.text.strip()
            
        # Clean the title for use as a filename
        title = re.sub(r'[\\/*?:"<>|]', "", listing_data['Title'])[:50]
        
        print(f"Processing listing: {title}")
        
        # Extract mapAndAttrs data
        map_attrs = detail_soup.select_one('.mapAndAttrs')
        if map_attrs:
            # Get all text from mapAndAttrs and clean it up
            map_attrs_text = map_attrs.get_text(separator=' ', strip=True)
            # Remove excessive whitespace
            map_attrs_text = re.sub(r'\s+', ' ', map_attrs_text)
            listing_data['MapAndAttrs'] = map_attrs_text
            print(f"MapAndAttrs found: {map_attrs_text[:100]}...")
        
        # Extract posting body
        posting_body = detail_soup.select_one('#postingbody')
        if posting_body:
            # Remove any "QR Code Link to This Post" text which is common in Craigslist
            qr_link = posting_body.select_one('.print-qrcode-container')
            if qr_link:
                qr_link.decompose()
                
            body_text = posting_body.get_text(separator=' ', strip=True)
            # Remove excessive whitespace
            body_text = re.sub(r'\s+', ' ', body_text)
            listing_data['PostingBody'] = body_text
            print(f"Posting body found: {body_text[:100]}...")
            
        # Find image URLs on the detail page - try multiple selectors
        selectors_to_try = [
            'picture img',
            'div.swipe-wrap img',
            '.gallery img',
            'img[data-src]',
            'img'  # Last resort
        ]
        
        image_elements = []
        for selector in selectors_to_try:
            image_elements = detail_soup.select(selector)
            if image_elements:
                print(f"Found {len(image_elements)} images with selector: {selector}")
                break
        
        # Only process the first image
        if image_elements:
            img = image_elements[0]  # Take only the first image
            img_url = None
            
            # Try several attributes where the image URL might be found
            for attr in ['src', 'data-src', 'data-url', 'data-hq-url']:
                if attr in img.attrs:
                    img_url = img[attr]
                    if img_url and not img_url.endswith('blank.gif'):
                        break
            
            # Handle full-resolution images if available
            if img_url and '600x450' in img_url:
                # Try to get a higher resolution version
                img_url = img_url.replace('600x450', '1200x900')
                
            print(f"Image URL found: {img_url}")
            
            if img_url and not img_url.endswith(('.gif', 'blank.gif')):
                try:
                    # Random delay before downloading the image
                    random_delay()
                    
                    # Get fresh headers
                    img_headers = get_headers()
                    
                    img_response = session.get(img_url, headers=img_headers, timeout=30)
                    if img_response.status_code == 200:
                        # Create a new filename using the alphabetical equivalent of the listing counter
                        alpha_id = number_to_alpha(listing_counter)
                        
                        # Get the first 25 characters from the title (excluding spaces)
                        title_part = get_first_n_chars_no_spaces(title, 25)
                        
                        # Create the new filename: alpha_id + title_part + listing_id + extension
                        new_filename = f"{alpha_id}{title_part}{listing_id}.jpg"
                        
                        # Remove any remaining spaces from the filename
                        new_filename = remove_spaces(new_filename)
                        
                        # Full path to save the image
                        filename = f"car_images/{new_filename}"
                        
                        with open(filename, 'wb') as f:
                            f.write(img_response.content)
                        print(f"Downloaded: {filename}")
                        
                        # Save image details in listing data
                        listing_data['ImageCount'] = 1
                        listing_data['ImageFileName'] = os.path.basename(filename)
                        
                        # Rotate IP after download
                        session_count += 1
                        if session_count % 5 == 0:  # Change IP after every 5 downloads
                            renew_tor_ip()
                    else:
                        print(f"Failed to download image: {img_url}, status: {img_response.status_code}")
                except Exception as e:
                    print(f"Error downloading image: {e}")
                    # Try to renew IP if we encounter an error
                    renew_tor_ip()
        else:
            print(f"No images found for listing: {title}")
            
        # Write the collected data to CSV
        write_to_csv(listing_data)
        
        return session_count
        
    except Exception as e:
        print(f"Error processing direct listing: {e}")
        traceback.print_exc()
        return session_count

def scroll_to_bottom(url, max_scrolls=100):
    """
    Use Selenium to scroll to the bottom of an infinite scrolling page
    and return the HTML content after scrolling
    """
    print(f"Starting Selenium to handle infinite scrolling: {url}")
    
    # Set up Chrome options
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless=new")  # Run in headless mode (new syntax)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")  # Hide automation
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
    
    # Set up Firefox options as a fallback
    firefox_options = FirefoxOptions()
    firefox_options.add_argument("--headless")
    firefox_options.add_argument("--no-sandbox")
    firefox_options.add_argument("--disable-dev-shm-usage")
    firefox_options.add_argument("--window-size=1920,1080")
    firefox_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/119.0 Safari/537.36")
    
    try:
        # Try to initialize Chrome driver
        try:
            driver = webdriver.Chrome(options=chrome_options)
        except WebDriverException:
            # If Chrome fails, try Firefox
            driver = webdriver.Firefox(options=firefox_options)
        
        # Go to the URL
        driver.get(url)
        print("Page loaded in Selenium")
        
        # Give the page time to load initially
        time.sleep(10)
        
        # Try to wait for specific Craigslist elements to load
        wait = WebDriverWait(driver, 15)
        try:
            # Wait for the content div which usually contains listings
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.content")))
            print("Found content div")
        except TimeoutException:
            try:
                # Try alternative selectors
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".gallery-card")))
                print("Found gallery cards")
            except TimeoutException:
                print("Could not find expected elements, continuing anyway")
        
        # Take a screenshot for debugging
        driver.save_screenshot("before_scroll.png")
        print("Saved screenshot of page before scrolling")
        
        # Define a function to count listings using various selectors
        def count_listings():
            selectors = [
                '.gallery-card', 
                'li.cl-static-search-result', 
                'ol.cl-search-result-list > li',
                'ul.rows li.cl-static-search-result',
                'div.content .cl-search-result',
                'div.content li',  # More generic fallback
                'div.gallery li',  # Another gallery view option
                'div.gallery-card',  # Alternative gallery card
                'div[class*="gallery"] li',  # Wildcard selector for gallery
                'div.content div[class*="result"]',  # Wildcard for result items
                'li.result-row',
                'li[data-pid]'  # Items with data-pid are usually listings
            ]
            
            for selector in selectors:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if len(elements) > 0:
                    print(f"Found {len(elements)} listings with selector: {selector}")
                    return len(elements), selector
            
            return 0, None
        
        # Initial count
        listing_count, used_selector = count_listings()
        print(f"Initial listing count: {listing_count} using selector: {used_selector}")
        
        # Scroll down to load more content
        last_height = driver.execute_script("return document.body.scrollHeight")
        scrolls_without_change = 0
        total_scrolls = 0
        prev_listing_count = listing_count
        
        print("Starting to scroll...")
        
        # Craigslist sometimes uses a "next page" button instead of infinite scroll
        # Check if there's a next page button
        try:
            next_buttons = driver.find_elements(By.XPATH, "//a[contains(text(), 'next') or contains(@class, 'next') or contains(@title, 'next')]")
            if next_buttons and len(next_buttons) > 0:
                print("Found next page button - will use pagination instead of infinite scroll")
                use_pagination = True
            else:
                use_pagination = False
        except:
            use_pagination = False
        
        # If using pagination
        if use_pagination:
            page = 1
            all_page_sources = []
            
            while page <= 50:  # Limit to 50 pages max
                print(f"Processing page {page}")
                
                # Add current page to sources
                all_page_sources.append(driver.page_source)
                
                # Find and click next button
                try:
                    next_buttons = driver.find_elements(By.XPATH, "//a[contains(text(), 'next') or contains(@class, 'next') or contains(@title, 'next')]")
                    if next_buttons and len(next_buttons) > 0 and next_buttons[0].is_displayed():
                        next_buttons[0].click()
                        print(f"Clicked next page button, going to page {page + 1}")
                        time.sleep(5)  # Wait for page to load
                        page += 1
                        
                        # Count listings on new page
                        new_count, _ = count_listings()
                        print(f"Found {new_count} listings on page {page}")
                    else:
                        print("No more next buttons found, reached end of pagination")
                        break
                except Exception as e:
                    print(f"Error clicking next page: {e}")
                    break
            
            # Combine all page sources
            combined_html = "\n".join(all_page_sources)
            
            # Take a screenshot after pagination
            driver.save_screenshot("after_pagination.png")
            print(f"Completed pagination through {page} pages")
            
            # Close the driver
            driver.quit()
            
            return combined_html
        
        # If using infinite scroll
        while scrolls_without_change < 5 and total_scrolls < max_scrolls:
            # Scroll down
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            
            # Wait for new content to load
            time.sleep(5)
            
            # Try clicking "load more" buttons if they exist
            try:
                load_more_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'load') or contains(text(), 'more') or contains(@class, 'load')]")
                for button in load_more_buttons:
                    if button.is_displayed():
                        print("Clicking load more button")
                        driver.execute_script("arguments[0].click();", button)  # Use JavaScript to click
                        time.sleep(5)  # Wait for content to load
            except Exception as e:
                print(f"No load more button found or error: {e}")
            
            # Calculate new scroll height
            new_height = driver.execute_script("return document.body.scrollHeight")
            
            # Count listings
            listing_count, used_selector = count_listings()
            
            # Check if we've reached the target number
            if listing_count >= 1200:
                print(f"Reached target number of listings ({listing_count}), stopping scrolling")
                break
                
            # Check if the listing count has increased
            if listing_count > prev_listing_count:
                print(f"Listing count increased: {prev_listing_count} -> {listing_count}")
                scrolls_without_change = 0
                prev_listing_count = listing_count
            else:
                scrolls_without_change += 1
                print(f"No new listings found ({scrolls_without_change}/5)")
            
            # Check if the page height has changed
            if new_height > last_height:
                print(f"Page height increased: {last_height} -> {new_height}")
                scrolls_without_change = 0
            
            last_height = new_height
            total_scrolls += 1
            print(f"Completed scroll {total_scrolls}/{max_scrolls}")
            
            # Execute some JavaScript to force loading more content
            if total_scrolls % 5 == 0:
                try:
                    # Try to trigger lazy loading
                    driver.execute_script("""
                    window.scrollTo(0, 0);
                    setTimeout(() => { window.scrollTo(0, document.body.scrollHeight); }, 500);
                    """)
                    time.sleep(2)
                except:
                    pass
        
        # Take a screenshot after scrolling
        driver.save_screenshot("after_scroll.png")
        print("Saved screenshot of page after scrolling")
        
        # Get the final page source
        page_source = driver.page_source
        
        # Save the HTML for debugging
        with open("debug_scroll_page.html", "w", encoding="utf-8") as f:
            f.write(page_source)
            
        print(f"Scrolling complete. Performed {total_scrolls} scrolls. Found {listing_count} listings.")
        
        # Close the driver
        driver.quit()
        
        return page_source
    
    except Exception as e:
        print(f"Error during Selenium scrolling: {e}")
        traceback.print_exc()
        
        # Make sure to quit the driver in case of exception
        try:
            driver.quit()
        except:
            pass
        
        return None

def main():
    """Main function to scrape Craigslist car listings"""
    try:
        # Delete the existing CSV file to recreate with new headers
        if os.path.exists(CSV_FILE):
            os.remove(CSV_FILE)
            print(f"Removed existing {CSV_FILE}")
            
        # Create CSV file with headers
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=CSV_HEADERS)
            writer.writeheader()
            print(f"Created new {CSV_FILE} with headers")
            
        # Check if we should process a single listing directly
        direct_listing_mode = False
        direct_url = "https://washingtondc.craigslist.org/nva/cto/d/fairfax-2020-ford-150-xl-clean-title-no/7830646511.html"
        
        # If direct URL is provided, process it and exit
        if direct_listing_mode:
            process_direct_listing(direct_url, listing_counter=1)
            print("Direct listing processing completed!")
            return
        
        # Base URL to scrape
        base_url = "https://washingtondc.craigslist.org/search/cta?condition=10&condition=20&condition=30&condition=40&hasPic=1&isTrusted=true&max_auto_miles=150000&min_auto_year=1997&min_price=4500"
        
        # Initialize variables for pagination
        all_listings = []
        page_start = 0
        page_size = 120  # Craigslist typically shows 120 results per page
        max_pages = 15   # Set a reasonable limit to avoid infinite loops
        
        # Process all pages
        for page in range(max_pages):
            # Construct URL with pagination parameter
            if page == 0:
                url = f"{base_url}"
            else:
                url = f"{base_url}&s={page_start}"
                
            print(f"\nScraping page {page+1} starting at item {page_start}")
            print(f"URL: {url}")
            
            # Use Selenium to scroll the page and load all content
            use_selenium = True
            page_source = None
            
            if use_selenium:
                # Get page source after scrolling
                page_source = scroll_to_bottom(url, max_scrolls=100)
                if not page_source:
                    print("Failed to scroll page with Selenium, falling back to regular requests")
                    use_selenium = False
                else:
                    # Parse the scrolled page with BeautifulSoup
                    soup = BeautifulSoup(page_source, 'html.parser')
                    
                    # Save the HTML for debugging
                    with open(f"debug_search_page_{page+1}.html", "w", encoding="utf-8") as f:
                        f.write(page_source)
                    print(f"Saved search page {page+1} HTML for debugging")
            
            # Fallback to regular requests if Selenium fails
            if not use_selenium:
                # Get fresh headers
                headers = get_headers()
                
                # Get Tor session
                session = get_tor_session()
                
                # Visit the listing page
                try:
                    response = session.get(url, headers=headers, timeout=30)
                    if response.status_code != 200:
                        print(f"Failed to access listings page: {url}")
                        continue
                    
                    # Parse the HTML with BeautifulSoup
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Save the HTML for debugging
                    with open(f"debug_search_page_{page+1}.html", "w", encoding="utf-8") as f:
                        f.write(response.text)
                    print(f"Saved search page {page+1} HTML for debugging")
                    
                except Exception as e:
                    print(f"Error accessing listings page: {e}")
                    continue
            
            # Try to find all car listings - using different selectors
            selectors_to_try = [
                '.gallery-card',  # Gallery view - most likely for the provided URL
                'li.cl-static-search-result',
                'ol.cl-search-result-list > li',
                'ul.rows li.cl-static-search-result',
                'div.content .cl-search-result',
                'div.content li',  # More generic fallback
                'div.gallery li',  # Another gallery view option
                'div.gallery-card',  # Alternative gallery card
                'div[class*="gallery"] li',  # Wildcard selector for gallery
                'div.content div[class*="result"]',  # Wildcard for result items
                'li.result-row',
                'li[data-pid]'  # Items with data-pid are usually listings
            ]
            
            page_listings = []
            used_selector = ""
            
            for selector in selectors_to_try:
                page_listings = soup.select(selector)
                if len(page_listings) > 0:
                    used_selector = selector
                    print(f"Found {len(page_listings)} listings on page {page+1} using selector: {selector}")
                    break
            
            if len(page_listings) == 0:
                print(f"Could not find any listings on page {page+1}. Trying more aggressive approach...")
                
                # Try to find listings by looking for common patterns in Craigslist listings
                try:
                    # Look for elements with data-pid attribute (common in Craigslist listings)
                    page_listings = soup.select('[data-pid]')
                    if len(page_listings) > 0:
                        used_selector = '[data-pid]'
                        print(f"Found {len(page_listings)} listings on page {page+1} using data-pid attribute")
                    else:
                        # Look for links that might be listings
                        listing_links = soup.select('a[href*="/d/"]')  # Craigslist detail pages often have /d/ in URL
                        if len(listing_links) > 0:
                            # Convert links to parent elements that might be listings
                            potential_listings = []
                            for link in listing_links:
                                # Try to find a parent that might be a listing container
                                parent = link
                                for _ in range(3):  # Look up to 3 levels up
                                    parent = parent.parent
                                    if parent and parent.name in ['li', 'div'] and not parent in potential_listings:
                                        potential_listings.append(parent)
                                        break
                            
                            if potential_listings:
                                page_listings = potential_listings
                                used_selector = 'a[href*="/d/"] parents'
                                print(f"Found {len(page_listings)} listings on page {page+1} by examining links to detail pages")
                except Exception as e:
                    print(f"Error in aggressive listing detection on page {page+1}: {e}")
            
            # If we found listings, add them to our master list
            if len(page_listings) > 0:
                all_listings.extend(page_listings)
                print(f"Added {len(page_listings)} listings from page {page+1}. Total listings so far: {len(all_listings)}")
                
                # Update start index for next page
                page_start += len(page_listings)
                
                # Add a delay before fetching the next page
                random_delay(3, 8)
            else:
                print(f"No listings found on page {page+1}. This might be the last page.")
                break
                
            # If we've collected enough listings (more than 1202), we can stop
            if len(all_listings) >= 1202:
                print(f"Reached target number of listings ({len(all_listings)} >= 1202). Stopping pagination.")
                break
        
        print(f"\nTotal listings found across all pages: {len(all_listings)}")
        
        # Process all collected listings
        session_count = 0
        listing_counter = 1  # Initialize counter for sequential listing IDs
        
        # Create a progress counter
        total_listings = len(all_listings)
        processed_count = 0
        
        for i, listing in enumerate(all_listings):
            processed_count += 1
            print(f"\nProcessing listing {processed_count}/{total_listings} ({(processed_count/total_listings)*100:.1f}%)")
            session_count = download_images_from_listing(listing, session_count, listing_counter)
            listing_counter += 1  # Increment the counter for the next listing
            
            # Print progress update every 50 listings
            if processed_count % 50 == 0:
                print(f"Progress update: Processed {processed_count}/{total_listings} listings ({(processed_count/total_listings)*100:.1f}%)")
        
        print(f"Scraping completed! Processed {processed_count} out of {total_listings} listings.")
        
    except Exception as e:
        print(f"Error in main: {e}")
        traceback.print_exc()
        
if __name__ == "__main__":
    main()