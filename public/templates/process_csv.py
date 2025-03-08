import csv
import re
import sys
import termios
import tty
import os
import json

input_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings.csv'
output_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_new.csv'
approved_addresses_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/approved_addresses.json'
rejected_addresses_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/rejected_addresses.json'

# Load previously approved addresses from file
approved_addresses = set()
if os.path.exists(approved_addresses_file):
    try:
        with open(approved_addresses_file, 'r') as f:
            approved_addresses = set(json.load(f))
        print(f"Loaded {len(approved_addresses)} previously approved addresses")
    except Exception as e:
        print(f"Error loading approved addresses: {e}")

# Load previously rejected addresses from file
rejected_addresses = set()
if os.path.exists(rejected_addresses_file):
    try:
        with open(rejected_addresses_file, 'r') as f:
            rejected_addresses = set(json.load(f))
        print(f"Loaded {len(rejected_addresses)} previously rejected addresses")
    except Exception as e:
        print(f"Error loading rejected addresses: {e}")

# Function to save approved addresses to file
def save_approved_addresses():
    try:
        with open(approved_addresses_file, 'w') as f:
            json.dump(list(approved_addresses), f)
        print(f"Saved {len(approved_addresses)} approved addresses for future use")
    except Exception as e:
        print(f"Error saving approved addresses: {e}")

# Function to save rejected addresses to file
def save_rejected_addresses():
    try:
        with open(rejected_addresses_file, 'w') as f:
            json.dump(list(rejected_addresses), f)
        print(f"Saved {len(rejected_addresses)} rejected addresses for future use")
    except Exception as e:
        print(f"Error saving rejected addresses: {e}")

def get_single_key():
    """Get a single keypress from the user without requiring Enter."""
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(sys.stdin.fileno())
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    return ch

def clean_body_text(text, row_id):
    print(f"\nProcessing row ID: {row_id}")
    original_text = text
    
    # 1. Remove phone numbers (various formats)
    phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    if phones:
        print(f"Removing phone numbers: {', '.join(phones)}")
    text = re.sub(phone_pattern, '', text)
    text = re.sub(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', '', text)
    text = re.sub(r'\d{3}[-.\s]?\d{4}', '', text)
    
    # 2. Remove email addresses
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(email_pattern, text)
    if emails:
        print(f"Removing emails: {', '.join(emails)}")
    text = re.sub(email_pattern, '', text)
    
    # 3. Remove URLs
    url_pattern = r'https?://\S+'
    urls = re.findall(url_pattern, text)
    if urls:
        print(f"Removing URLs: {', '.join(urls)}")
    text = re.sub(url_pattern, '', text)
    
    www_pattern = r'www\.\S+'
    www_urls = re.findall(www_pattern, text)
    if www_urls:
        print(f"Removing www URLs: {', '.join(www_urls)}")
    text = re.sub(www_pattern, '', text)
    
    # 3.1 Remove "google map" and the special character after it
    google_map_pattern = r'google map\s*[\u2000-\u206F\u2E00-\u2E7F\\\\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]?'
    if re.search(google_map_pattern, text, re.IGNORECASE):
        print(f"Removing 'google map' and special characters")
    text = re.sub(google_map_pattern, '', text, flags=re.IGNORECASE)
    
    # Also try a more aggressive pattern for "google map" with any trailing characters
    google_map_pattern2 = r'google map\s*.*?(?=\s{2,}|$)'
    if re.search(google_map_pattern2, text, re.IGNORECASE):
        print(f"Removing 'google map' with trailing content")
    text = re.sub(google_map_pattern2, '', text, flags=re.IGNORECASE)
    
    # 3.2 Remove asterisks and more than two hyphens in a row
    text = re.sub(r'\*+', '', text)  # Remove all asterisks
    text = re.sub(r'---+', '--', text)  # Replace three or more hyphens with two
    
    # 3.3 Remove web addresses
    web_address_pattern = r'https?://(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:/[a-zA-Z0-9-._?&=#]*)?|www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:/[a-zA-Z0-9-._?&=#]*)?|[a-zA-Z0-9-]+\.(?:com|org|net|edu|gov|io|co)(?:/[a-zA-Z0-9-._?&=#]*)?'
    web_addresses = re.findall(web_address_pattern, text, re.IGNORECASE)
    if web_addresses:
        print(f"Removing web addresses: {', '.join(web_addresses[:5])}{'...' if len(web_addresses) > 5 else ''}")
    text = re.sub(web_address_pattern, '', text, flags=re.IGNORECASE)
    
    # 3.4 Remove phone numbers
    phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    if phones:
        print(f"Removing phone numbers: {', '.join(phones[:5])}{'...' if len(phones) > 5 else ''}")
    text = re.sub(phone_pattern, '', text)
    
    # 4. Find and ask for approval to remove addresses
    # More inclusive address pattern to catch various formats
    address_pattern = r'\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Road|Rd|Way|Wy|Drive|Dr|Ave|Avenue|Circle|Cir|Lane|Ln|Route|Rt|Boulevard|Blvd|Highway|Hwy|Parkway|Pkwy|Court|Ct|Place|Pl|Terrace|Ter|Trail|Trl)\.?(?:\s*[,\s]\s*[A-Za-z]+(?:\s*[A-Za-z]+)*)?(?:\s*[,\s]\s*[A-Z]{2})?(?:\s*\d{5})?\b'
    
    # Also look for addresses in the format "STREET CITY ZIP" without street type
    alt_address_pattern = r'\b\d+\s+[A-Za-z]+\s+[A-Za-z]+\s+[A-Za-z]+\d{5}\b'
    
    # Street/road name pattern (like "EUCLID AVENUE" or "LIBERIA AVENUE")
    street_name_pattern = r'\b[A-Za-z]+\s+(?:Avenue|Ave|Street|St|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Highway|Hwy|Route|Rt|Circle|Cir|Court|Ct|Place|Pl|Square|Sq|Terrace|Ter|Way|Parkway|Pkwy|Alley|Aly|Bridge|Brg|Trail|Trl)\b'
    
    # Additional pattern for street names in ALL CAPS
    all_caps_street_pattern = r'\b[A-Z]{2,}\s+(?:AVENUE|AVE|STREET|ST|ROAD|RD|LANE|LN|DRIVE|DR|BOULEVARD|BLVD|HIGHWAY|HWY|ROUTE|RT|CIRCLE|CIR|COURT|CT|PLACE|PL|SQUARE|SQ|TERRACE|TER|WAY|PARKWAY|PKWY|ALLEY|ALY|BRIDGE|BRG|TRAIL|TRL)\b'
    
    # Find street/road names
    street_names = list(re.finditer(street_name_pattern, text, re.IGNORECASE))
    all_caps_streets = list(re.finditer(all_caps_street_pattern, text))
    all_street_matches = street_names + all_caps_streets
    
    for match in all_street_matches:
        street = match.group(0)
        print(f"Removing street name: {street}")
        text = text.replace(street, '')
    
    # Function to check if an address should be auto-deleted
    def should_auto_delete(address):
        address_lower = address.lower()
        # Check for exact match
        if address_lower in approved_addresses:
            return True
        
        # Check for partial matches
        for approved in approved_addresses:
            # If the approved address is a significant part of the current address
            if approved in address_lower and len(approved) > 10:
                return True
            
            # Extract the street number and name from both addresses
            approved_parts = approved.split()
            address_parts = address_lower.split()
            
            # If both have at least 2 parts and the first 2 parts match (likely street number and name)
            if len(approved_parts) >= 2 and len(address_parts) >= 2:
                if approved_parts[0] == address_parts[0] and approved_parts[1] == address_parts[1]:
                    return True
        
        return False
    
    # Function to check if an address should be auto-rejected
    def should_auto_reject(address):
        address_lower = address.lower()
        # Check for exact match
        if address_lower in rejected_addresses:
            return True
        
        return False
    
    # Find all potential addresses from both patterns
    addresses_main = list(re.finditer(address_pattern, text, re.IGNORECASE))
    addresses_alt = list(re.finditer(alt_address_pattern, text, re.IGNORECASE))
    all_addresses = addresses_main + addresses_alt
    
    # For each address found, ask for approval to remove
    for match in all_addresses:
        address = match.group(0)
        
        # Check if this address has already been approved for deletion
        if should_auto_delete(address):
            print(f"Auto-removing previously approved address: {address}")
            text = text.replace(address, '')
            continue
            
        # Check if this address has already been rejected
        if should_auto_reject(address):
            print(f"Auto-rejecting previously rejected address: {address}")
            continue
            
        print(f"Found address: {address}")
        print("Remove this address? Y/N ", end='', flush=True)
        approval = get_single_key()
        print(approval)  # Echo the key pressed
        if approval.lower() == 'y':
            # Add to approved addresses for future auto-deletion
            approved_addresses.add(address.lower())
            # Save the updated list of approved addresses
            save_approved_addresses()
            print(f"Removing address: {address}")
            text = text.replace(address, '')
        else:
            # Add to rejected addresses for future auto-rejection
            rejected_addresses.add(address.lower())
            # Save the updated list of rejected addresses
            save_rejected_addresses()
    
    # 5. Remove dates and times
    # Date formats (MM/DD/YYYY, MM-DD-YYYY, etc.)
    date_pattern = r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}'
    dates = re.findall(date_pattern, text)
    if dates:
        print(f"Removing dates: {', '.join(dates)}")
    text = re.sub(date_pattern, '', text)
    
    # Time formats (HH:MM:SS AM/PM, etc.)
    time_pattern = r'\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm]\b'
    times = re.findall(time_pattern, text)
    if times:
        print(f"Removing times: {', '.join(times)}")
    text = re.sub(time_pattern, '', text)
    
    # 6. Remove dollar amounts
    dollar_pattern = r'\$\s*\d+(?:,\d+)*(?:\.\d+)?'
    dollars = re.findall(dollar_pattern, text)
    if dollars:
        print(f"Removing dollar amounts: {', '.join(dollars)}")
    text = re.sub(dollar_pattern, '', text)
    
    dollar_word_pattern = r'\d+(?:,\d+)*(?:\.\d+)?\s*dollars'
    dollar_words = re.findall(dollar_word_pattern, text)
    if dollar_words:
        print(f"Removing dollar words: {', '.join(dollar_words)}")
    text = re.sub(dollar_word_pattern, '', text)
    
    # 7. Remove specific words and phrases (case insensitive)
    words_to_remove = [
        "phone", "phone number", "email", "e-mail", "visit this link", 
        "we are located at", "location", "located at", "located", 
        "Louden Motor Cars", "Louden Used Cars", "\*", "processing fee",
        "fee", "fees", "Best Auto of Manassas, INC.", "Commercial Auto",
        "follow us", "facebook", "youtube.com", "youtube", "you tube",
        # Additional words to remove
        "google", "map", "maps", "click here", "Click link", "click this link", 
        "dealer's", "website", "web site", "view", "view on", 
        "for sale by original owner", "batchid:", "locations"
    ]
    
    pattern = r'\b(?:' + '|'.join(re.escape(word) for word in words_to_remove) + r')\b'
    words_found = []
    for word in words_to_remove:
        if re.search(r'\b' + re.escape(word) + r'\b', text, re.IGNORECASE):
            words_found.append(word)
    
    if words_found:
        print(f"Removing words/phrases: {', '.join(words_found)}")
    text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Remove non-UTF-8 characters
    non_utf8_pattern = r'[^\x00-\x7F]+'
    non_utf8 = re.findall(non_utf8_pattern, text)
    if non_utf8:
        print(f"Removing non-UTF-8 characters: {', '.join(non_utf8)}")
    text = re.sub(non_utf8_pattern, '', text)
    
    # List of car-related acronyms to preserve in ALL CAPS
    preserve_caps = [
        # Car brands and models
        'BMW', 'RAV4', 'AMG', 'CRV', 'CR-V', 'SUV', 'MPV', 'ABS', 'AWD', 'FWD', 'RWD', '4WD', 'VIN', 
        'AC', 'A/C', 'CD', 'DVD', 'GPS', 'LED', 'MPG', 'V6', 'V8', 'XL', 'XLT', 'SE', 'LE', 'LX', 'EX', 'DX',
        # Additional brands and models per user request
        'Hyundai', 'Elantra', 'Ford', 'Chevy', 'Chevrolet', 'Honda', 'Kia', 'Toyota', 'Camry', 'Corolla',
        'F150', 'F250', 'F350', 'Cadillac', 'Mercedes', 'Land Rover', 'Range Rover', 'Audi', 'Acura',
        'Jaguar', 'Mazda', 'Prius', 'GMC', 'Subaru', 'Mercedes-Benz', 'Volvo', 'Z3', 'GX', 'Lexus',
        'E-Class', 'XC', 'Nissan', 'Altima', 'Accord', 'Tacoma', 'Explorer', 'Liberty', 'Silverado',
        'Sienna', 'Sonata', 'Express', 'X3', 'Accent', 'GT', 'Passat', 'Trailblazer', 'PZEV'
    ]
    
    # Create a case-insensitive pattern for the preserved words
    preserve_pattern = '|'.join(re.escape(word) for word in preserve_caps)
    
    # Function to convert ALL CAPS to lowercase except for preserved words
    def convert_case(match):
        word = match.group(0)
        # Check if the word should be preserved in ALL CAPS
        for preserve in preserve_caps:
            if word.upper() == preserve:
                return word
        
        # Otherwise, convert to lowercase if it's 3+ characters and all uppercase
        if len(word) >= 3 and word.isupper():
            print(f"Converting to lowercase: {word}")
            return word.lower()
        return word
    
    # Apply the case conversion with exceptions
    text = re.sub(r'\b[A-Z]{3,}\b', convert_case, text)
    
    # Convert Title Case to Sentence case
    # Split text into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    processed_sentences = []
    
    for sentence in sentences:
        # Skip empty sentences
        if not sentence.strip():
            continue
            
        # Convert Title Case words to lowercase except for the first word of the sentence
        words = sentence.split()
        if not words:
            continue
            
        # Keep the first word as is (might already be capitalized)
        processed_words = [words[0]]
        
        # Process the rest of the words
        for word in words[1:]:
            # Skip preserved words
            if any(word.upper() == preserve for preserve in preserve_caps):
                processed_words.append(word)
                continue
                
            # Check if word is in Title Case (first letter uppercase, rest lowercase)
            if len(word) > 1 and word[0].isupper() and word[1:].islower():
                print(f"Converting Title Case to sentence case: {word}")
                processed_words.append(word.lower())
            else:
                processed_words.append(word)
                
        processed_sentences.append(' '.join(processed_words))
    
    # Join sentences back together
    text = ' '.join(processed_sentences)
    
    # Ensure the first character of the entire text is capitalized
    if text and text[0].isalpha():
        text = text[0].upper() + text[1:]
    
    # Clean up extra whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    # Print summary of changes
    if original_text != text:
        print(f"Text length before: {len(original_text)}, after: {len(text)}")
        print(f"Removed {len(original_text) - len(text)} characters")
    
    # 9. Remove common sales phrases and unwanted content
    phrases_to_remove = [
        r'call|text',
        r'finance|financing|financing available',
        r'warrantee is valid for 5 days or 250 miles',
        r'some restrictions apply',
        r'dealer processing charge',
        r'fee|fees',
        r'certain terms and conditions',
        r'see store for details',
        r'hans',
        r'\|',
        r'\.{3}\s+\.{3}',
        r'walk around video on YouTube link',
        r'BAD CREDIT|NO CREDIT|REPOS|BANKRUPTCY|WE GOT YOU COVERED',
        r'We offer GUARANTEED APPROVAL FOR EVERYONE!!!'
    ]
    
    for phrase in phrases_to_remove:
        text = re.sub(phrase, '', text, flags=re.IGNORECASE)
    
    # 10. Convert ALL CAPS to Title Case (except for preserved words)
    # First, find all words that are in ALL CAPS (3 or more characters)
    all_caps_pattern = r'\b[A-Z]{3,}\b'
    all_caps_words = re.findall(all_caps_pattern, text)
    
    # For each ALL CAPS word, check if it should be preserved or converted
    for word in all_caps_words:
        # Skip preserved words
        if word in preserve_caps or any(word.upper() == p.upper() for p in preserve_caps):
            continue
        
        # Convert to Title Case (first letter capitalized, rest lowercase)
        title_case_word = word.title()
        print(f"Converting ALL CAPS to Title Case: {word} -> {title_case_word}")
        text = text.replace(word, title_case_word)
    
    return text

print("This script will remove the URL column and clean the bodyText field.")
print("For each address found, you will be asked for approval before removing it.")
print("Addresses you approve for deletion will be remembered for future runs.")
print("A running list of what's being deleted will be displayed in the terminal.")
print("Press Enter to continue or Ctrl+C to cancel...")
input()

with open(input_file, 'r', newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    # Process each row
    for i, row in enumerate(reader):
        if i == 0:  # Header row
            # Get the index of the 'url' column
            url_index = row.index('url')
            # Get the index of the 'bodyText' column
            body_text_index = row.index('bodyText')
            # Create a new row without the 'url' column
            new_row = row[:url_index] + row[url_index+1:]
            print(f"Removing URL column (index {url_index})")
        else:
            # For data rows, remove the column at the same index
            new_row = row[:url_index] + row[url_index+1:]
            
            # Clean the bodyText field if it exists
            if len(new_row) > body_text_index - 1:  # Adjust index since we removed url column
                body_text = new_row[body_text_index - 1]
                new_row[body_text_index - 1] = clean_body_text(body_text, row[0])  # Pass row ID for logging
        
        # Write the modified row
        writer.writerow(new_row)

print("\nCSV processing complete. URL column removed and bodyText cleaned.")
print(f"Output saved to: {output_file}")
# Save approved addresses at the end to ensure all are captured
save_approved_addresses()
save_rejected_addresses()
