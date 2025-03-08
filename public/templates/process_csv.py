import csv
import re
import sys
import termios
import tty
import os
import json

input_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_new.csv'
output_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_processed.csv'
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
    
    # Remove HTML entities and unwanted quote characters
    text = re.sub(r'&[a-zA-Z]+;', '', text)  # Remove HTML entities
    text = re.sub(r'["""]', '', text)  # Remove various quote characters
    
    # Words that should be preserved in their exact case
    preserve_exact_case = ['A5', 'Z3', 'Z4', 'WD', 'LE', 'CL', 'GT', 'LI', 'AC', 'CDL', 'SUV', 'H4', 'SE', 'XLT', 'SD', 'DR', 'LX', 'AMD', 'X3', 'X4', 'X6M', 'CR-V', 'GLE', 'EX', 'LTD', 'GLS', 'GT1', 'LR4', 'HSE', '4WD', 'CX-5', '4Runner', 'Q5', 'Q7', 'ES350', 'XC90', 'H2', 'HR-V', 'RX350', 'RX', 'CRV HR-V', 'HS', '250H', 'GX', 'E-PACE', 'RAV4', 'X6M', 'PZEV', '4MATIC', 'Trailblazer', 'Terrastar', 'Diesel', 'Dump', 'Truck', 'Edge', 'Limited', 'Sienna']
    
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
    
    # 3.1 Remove "google map" and any characters that follow it
    google_map_pattern = r'google map\s*[^\s]*'
    if re.search(google_map_pattern, text, re.IGNORECASE):
        print(f"Removing 'google map' and special characters")
    text = re.sub(google_map_pattern, '', text, flags=re.IGNORECASE)

    # More aggressive pattern to catch any remaining instances of "google map"
    text = re.sub(r'google map\s*', '', text, flags=re.IGNORECASE)

    # Also remove "google maps" variation
    text = re.sub(r'google maps\s*', '', text, flags=re.IGNORECASE)
    
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
    street_name_pattern = r'\b[A-Za-z]+\s+(?:Avenue|Ave|Street|St|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Highway|Hwy|Route|Rt|Circle|Cir|Court|Ct|Place|Pl|Square|Sq|Terrace|Ter|Way|Parkway|Pkwy|Alley|Aly|Bridge|Brg|Trail|Trl|Hill)\b'

    # Additional pattern for street names in ALL CAPS
    all_caps_street_pattern = r'\b[A-Z]{2,}\s+(?:AVENUE|AVE|STREET|ST|ROAD|RD|LANE|LN|DRIVE|DR|BOULEVARD|BLVD|HIGHWAY|HWY|ROUTE|RT|CIRCLE|CIR|COURT|CT|PLACE|PL|SQUARE|SQ|TERRACE|TER|WAY|PARKWAY|PKWY|ALLEY|ALY|BRIDGE|BRG|TRAIL|TRL|HILL)\b'

    # Pattern for "X near Y" street names (like "EUCLID AVENUE near LIBERIA AVENUE")
    near_pattern = r'\b[A-Za-z]+\s+(?:Avenue|Ave|Street|St|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Highway|Hwy|Route|Rt|Circle|Cir|Court|Ct|Place|Pl|Square|Sq|Terrace|Ter|Way|Parkway|Pkwy|Alley|Aly|Bridge|Brg|Trail|Trl|Hill)\s+(?:near|@)\s+[A-Za-z]+\s+(?:Avenue|Ave|Street|St|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Highway|Hwy|Route|Rt|Circle|Cir|Court|Ct|Place|Pl|Square|Sq|Terrace|Ter|Way|Parkway|Pkwy|Alley|Aly|Bridge|Brg|Trail|Trl|Hill)\b'

    # Additional pattern for "X near Y" street names in ALL CAPS
    all_caps_near_pattern = r'\b[A-Z]{2,}\s+(?:AVENUE|AVE|STREET|ST|ROAD|RD|LANE|LN|DRIVE|DR|BOULEVARD|BLVD|HIGHWAY|HWY|ROUTE|RT|CIRCLE|CIR|COURT|CT|PLACE|PL|SQUARE|SQ|TERRACE|TER|WAY|PARKWAY|PKWY|ALLEY|ALY|BRIDGE|BRG|TRAIL|TRL|HILL)\s+(?:NEAR|@)\s+[A-Z]{2,}\s+(?:AVENUE|AVE|STREET|ST|ROAD|RD|LANE|LN|DRIVE|DR|BOULEVARD|BLVD|HIGHWAY|HWY|ROUTE|RT|CIRCLE|CIR|COURT|CT|PLACE|PL|SQUARE|SQ|TERRACE|TER|WAY|PARKWAY|PKWY|ALLEY|ALY|BRIDGE|BRG|TRAIL|TRL|HILL)\b'

    # New pattern for addresses with street numbers but without state/zip
    street_number_pattern = r'\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Road|Rd|Way|Wy|Drive|Dr|Ave|Avenue|Circle|Cir|Lane|Ln|Route|Rt|Boulevard|Blvd|Highway|Hwy|Parkway|Pkwy|Court|Ct|Place|Pl|Terrace|Ter|Trail|Trl|Hill)\.?\b'

    # Simple street number pattern (like "1081 Entry Drive" or "7216 Centerville Road")
    simple_address_pattern = r'\b\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+(?:Drive|Dr|Road|Rd|Street|St|Lane|Ln|Ave|Avenue|Circle|Cir|Way|Wy|Boulevard|Blvd|Highway|Hwy|Parkway|Pkwy|Court|Ct|Place|Pl|Terrace|Ter|Trail|Trl|Hill)\b'

    # Pattern for addresses with directional indicators
    directional_address_pattern = r'\b\d+\s+(?:North|South|East|West|N\.|S\.|E\.|W\.)\s+[A-Za-z0-9\s,]+(?:Street|St|Road|Rd|Way|Wy|Drive|Dr|Ave|Avenue|Circle|Cir|Lane|Ln|Route|Rt|Boulevard|Blvd|Highway|Hwy|Parkway|Pkwy|Court|Ct|Place|Pl|Terrace|Ter|Trail|Trl)\.?\b'
    directional_address_pattern_2 = r'\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Road|Rd|Way|Wy|Drive|Dr|Ave|Avenue|Circle|Cir|Lane|Ln|Route|Rt|Boulevard|Blvd|Highway|Hwy|Parkway|Pkwy|Court|Ct|Place|Pl|Terrace|Ter|Trail|Trl)\s+(?:North|South|East|West|N\.?|S\.?|E\.?|W\.?)\.?\b'

    # Define street types with their possible variations
    street_types = [
        r'Avenue|Ave\.?|AVE\.?',
        r'Street|St\.?|ST\.?',
        r'Road|Rd\.?|RD\.?',
        r'Lane|Ln\.?|LN\.?',
        r'Drive|Dr\.?|DR\.?',
        r'Boulevard|Blvd\.?|BLVD\.?',
        r'Highway|Hwy\.?|HWY\.?',
        r'Route|Rt\.?|RT\.?',
        r'Circle|Cir\.?|CIR\.?',
        r'Court|Ct\.?|CT\.?',
        r'Place|Pl\.?|PL\.?',
        r'Square|Sq\.?|SQ\.?',
        r'Terrace|Ter\.?|TER\.?',
        r'Way|Wy\.?|WY\.?',
        r'Parkway|Pkwy\.?|PKWY\.?',
        r'Alley|Aly\.?|ALY\.?',
        r'Bridge|Brg\.?|BRG\.?',
        r'Trail|Trl\.?|TRL\.?',
        r'Hill|HILL'
    ]
    
    # Join the street types with OR for regex
    street_types_pattern = '|'.join(street_types)
    
    # Street/road name pattern (like "EUCLID AVENUE" or "LIBERIA AVENUE")
    street_name_pattern = r'\b[A-Za-z]+\s+(?:' + street_types_pattern + r')\b'
    
    # Additional pattern for street names in ALL CAPS
    all_caps_street_pattern = r'\b[A-Z]{2,}\s+(?:' + street_types_pattern + r')\b'
    
    # Pattern for "X near Y" street names (like "EUCLID AVENUE near LIBERIA AVENUE")
    near_pattern = r'\b[A-Za-z]+\s+(?:' + street_types_pattern + r')\s+(?:near|@)\s+[A-Za-z]+\s+(?:' + street_types_pattern + r')\b'
    
    # Additional pattern for "X near Y" street names in ALL CAPS
    all_caps_near_pattern = r'\b[A-Z]{2,}\s+(?:' + street_types_pattern + r')\s+(?:NEAR|@)\s+[A-Z]{2,}\s+(?:' + street_types_pattern + r')\b'
    
    # New pattern for addresses with street numbers but without state/zip
    street_number_pattern = r'\b\d+\s+[A-Za-z0-9\s,]+(?:' + street_types_pattern + r')\.?\b'
    
    # Simple street number pattern (like "1081 Entry Drive" or "7216 Centerville Road")
    simple_address_pattern = r'\b\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+(?:' + street_types_pattern + r')\b'
    
    # Pattern for addresses with directional indicators
    directional_address_pattern = r'\b\d+\s+(?:North|South|East|West|N\.?|S\.?|E\.?|W\.?)\s+[A-Za-z0-9\s,]+(?:' + street_types_pattern + r')\.?\b'
    directional_address_pattern_2 = r'\b\d+\s+[A-Za-z0-9\s,]+(?:' + street_types_pattern + r')\s+(?:North|South|East|West|N\.?|S\.?|E\.?|W\.?)\.?\b'

    # Find street/road names
    street_names = list(re.finditer(street_name_pattern, text, re.IGNORECASE))
    all_caps_streets = list(re.finditer(all_caps_street_pattern, text))
    near_streets = list(re.finditer(near_pattern, text, re.IGNORECASE))
    all_caps_near_streets = list(re.finditer(all_caps_near_pattern, text))
    all_street_matches = street_names + all_caps_streets + near_streets + all_caps_near_streets

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
    simple_addresses = list(re.finditer(simple_address_pattern, text, re.IGNORECASE))
    all_addresses = addresses_main + addresses_alt + simple_addresses
    
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
    
    # Convert ALL CAPS to Sentence case
    sentences = re.split(r'([.!?]\s+)', text)
    new_text = ""
    for sentence in sentences:
        if sentence.isupper():
            sentence = sentence.lower()
            if sentence.strip():
                sentence = sentence[0].upper() + sentence[1:]
        elif re.match(r'^[a-z]', sentence.strip()):
            # If sentence starts with lowercase, capitalize it
            if sentence.strip():
                sentence = sentence[0].upper() + sentence[1:]
        new_text += sentence
    
    text = new_text
    
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
        r'We offer GUARANTEED APPROVAL FOR EVERYONE!!!',
        r'Click here to view on dealer\'s website',
        r'To view on dealer\'s website',
        r'Click here to view',
        r'To view',
        r'Please visit our website \([^)]*\)',
        r'Please visit our website',
        r'For more info please copy and paste below link in your browser',
        r'Stock number:[^,]*',
        r'number:[^,]*',
        r'stock #:[^,]*',
        r'W OR:',
        r'Money-Back guarantee is valid for[^.]*',
        r'Honda description',
        r'subject to prior sale\.',
        r'to confirm availability\.',
        r'fuel: :'
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
    
    # Clean up extra whitespace and fix formatting issues
    text = re.sub(r'\s+', ' ', text)
    
    # Remove any leftover parentheses that might be from website removal
    text = re.sub(r'\(\s*\)', '', text)
    text = re.sub(r'our website \(', 'our website', text)
    
    # Fix any double punctuation or spacing issues
    text = re.sub(r'\s+\.', '.', text)
    text = re.sub(r'\s+,', ',', text)
    text = re.sub(r'\s+:', ':', text)
    text = re.sub(r':\s+:', ':', text)  # Fix double colons
    text = re.sub(r'fuel:\s*:', 'fuel:', text)  # Fix "fuel: :" issue
    
    # Remove any incomplete sentences about guarantees
    text = re.sub(r'Money-Back [Gg]uarantee is valid for[^.]*\.?', '', text)
    
    # Remove any leftover references to viewing on websites
    text = re.sub(r'To on', '', text)
    text = re.sub(r'To view', '', text)
    text = re.sub(r'Click here', '', text)
    
    # Remove stock number references that might be causing issues
    text = re.sub(r'[Ss]tock [Nn]umber:?\s*[A-Z0-9]+\s*', '', text)
    text = re.sub(r'[Ss]tock #:?\s*[A-Z0-9]+\s*', '', text)
    
    # Remove Honda references in non-Honda vehicles
    if 'Honda' not in text[:50] and 'Honda' in text:
        text = re.sub(r'Honda description', 'description', text)
        text = re.sub(r'Honda \.', '.', text)
    
    text = text.strip()
    
    # Ensure exact case words are preserved
    for exact_word in preserve_exact_case:
        # Use word boundary markers \b to ensure we only match whole words
        pattern = re.compile(r'\b' + re.escape(exact_word) + r'\b', re.IGNORECASE)
        text = pattern.sub(exact_word, text)
    
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
    
    # Words that should not be converted to lowercase
    do_not_lowercase = ['Trailblazer', 'Cayenne', 'Mercedes','S-Class','Mercedes-Benz','Yukon','GMC','Dodge','Ram','International', 'Terrastar','Toyota','Highlander','BMW', 'Nissan', 'Versa', 'Altima', 'Honda', 'Chevy', 'Ford', 'Chevrolet', 'Tundra', 'Traverse', 'Lexus', 'RX','Mazda','Porsche','Cayenne','Camry','Acura','Accord','Chevy','Altima','Land','Rover','Range','Rover','Sports','Limited','Black','Edition','Special','RAV4','X3','X5','Z3']
    
    # Street/road words that should be capitalized in addresses
    address_words = ['avenue', 'road', 'street', 'way', 'drive', 'boulevard', 'lane', 'circle', 'court', 'place', 'terrace', 'parkway', 'hill']
    
    # Words that should be preserved in their exact case
    preserve_exact_case = ['VIN','A5', 'Z3', 'Z4', 'WD', 'LE', 'CL', 'GT', 'LI', 'AC', 'CDL', 'SUV', 'H4', 'SE', 'XLT', 'SD', 'DR', 'LX', 'AMD', 'X3', 'X4', 'X6M', 'CR-V', 'GLE', 'EX', 'LTD', 'GLS', 'GT1', 'LR4', 'HSE', '4WD', 'CX-5', '4Runner', 'Q5', 'Q7', 'ES350', 'XC90', 'H2', 'HR-V', 'RX350', 'RX', 'CRV HR-V', 'HS', '250H', 'GX', 'E-PACE', 'RAV4', 'X6M', 'PZEV', '4MATIC', 'Trailblazer', 'Terrastar', 'Diesel', 'Dump', 'Truck', 'Edge', 'Limited', 'Sienna']
    
    # Process each row
    for i, row in enumerate(reader):
        if i == 0:  # Header row
            # Get the indices of columns
            # Check if 'url' column exists
            url_index = -1
            try:
                url_index = row.index('url')
            except ValueError:
                print("No 'url' column found, skipping URL removal")
            
            # Get the index of the 'bodyText' column
            body_text_index = row.index('bodyText')
            # Get the index of the 'model' column
            model_index = row.index('model')
            # Get the index of the 'title' column
            title_index = row.index('title')
            # Get the index of the 'make' column
            make_index = row.index('make')
            # Get the index of the 'carAttrs' column
            car_attrs_index = row.index('carAttrs')
            
            # Create a new row without the 'url' column if it exists
            if url_index >= 0:
                new_row = row[:url_index] + row[url_index+1:]
                print(f"Removing URL column (index {url_index})")
            else:
                new_row = row
        else:
            # For data rows, remove the column at the same index if it exists
            if url_index >= 0:
                new_row = row[:url_index] + row[url_index+1:]
            else:
                new_row = row
            
            # Process all columns to remove asterisks
            for j in range(len(new_row)):
                if isinstance(new_row[j], str):
                    new_row[j] = new_row[j].replace('*', '')
            
            # Clean the make field - convert to Title Case while preserving special words
            if len(new_row) > make_index - 1:  # Adjust index since we removed url column
                make_text = new_row[make_index - 1]
                # Convert to Title Case while preserving special words
                make_words = make_text.split()
                new_make_words = []
                
                for word in make_words:
                    # Check if this word exactly matches any in our preserve list (case-insensitive)
                    exact_match = False
                    for exact_word in preserve_exact_case:
                        if word.upper() == exact_word.upper():
                            new_make_words.append(exact_word)  # Use the exact case from our list
                            exact_match = True
                            break
                    
                    # If not an exact match, convert to Title Case
                    if not exact_match:
                        new_make_words.append(word.title())
                
                # Join words back together
                new_row[make_index - 1] = ' '.join(new_make_words)
            
            # Clean the model field - convert to Title Case while preserving special words
            if len(new_row) > model_index - 1:  # Adjust index since we removed url column
                model_text = new_row[model_index - 1]
                
                # Remove "one owner low miles" case-insensitive
                model_text = re.sub(r'(?i)one owner low miles', '', model_text).strip()
                
                # Convert to Title Case while preserving special words
                model_words = model_text.split()
                new_model_words = []
                
                for word in model_words:
                    # Check if this word exactly matches any in our preserve list (case-insensitive)
                    exact_match = False
                    for exact_word in preserve_exact_case:
                        if word.upper() == exact_word.upper():
                            new_model_words.append(exact_word)  # Use the exact case from our list
                            exact_match = True
                            break
                    
                    # If not an exact match, convert to Title Case
                    if not exact_match:
                        new_model_words.append(word.title())
                
                # Join words back together
                new_row[model_index - 1] = ' '.join(new_model_words)
            
            # Clean the title field - convert to Title Case while preserving special words
            if len(new_row) > title_index - 1:  # Adjust index since we removed url column
                title_text = new_row[title_index - 1]
                
                # First convert all words to Title Case
                title_words = title_text.split()
                new_title_words = []
                
                for word in title_words:
                    # Check if this word exactly matches any in our preserve list (case-insensitive)
                    exact_match = False
                    for exact_word in preserve_exact_case:
                        if word.upper() == exact_word.upper():
                            new_title_words.append(exact_word)  # Use the exact case from our list
                            exact_match = True
                            break
                    
                    # If not an exact match, convert to Title Case
                    if not exact_match:
                        # Force all uppercase words to be properly Title Case
                        new_title_words.append(word.title())
                
                # Join words back together
                new_row[title_index - 1] = ' '.join(new_title_words)
            
            # Clean the bodyText field if it exists
            if len(new_row) > body_text_index - 1:  # Adjust index since we removed url column
                body_text = new_row[body_text_index - 1]
                
                # Remove HTML entities and unwanted quote characters
                body_text = re.sub(r'&[a-zA-Z]+;', '', body_text)  # Remove HTML entities
                body_text = re.sub(r'["""]', '', body_text)  # Remove various quote characters
                
                # Clean the body text
                new_row[body_text_index - 1] = clean_body_text(body_text, row[0])
        
            # Clean car attributes text
            if i > 0 and car_attrs_index - 1 < len(new_row):
                value = new_row[car_attrs_index - 1]
                
                # Remove 'google map' and extra spaces
                value = re.sub(r'google map\s*', '', value, flags=re.IGNORECASE)
                
                # Remove HTML entities and other unwanted characters
                value = re.sub(r'&[a-zA-Z]+;', '', value)  # Remove HTML entities
                value = re.sub(r'["""]', '', value)  # Remove various quote characters
                
                # Convert to Title Case while preserving special words
                attr_words = value.split()
                new_attr_words = []
                
                for word in attr_words:
                    # Check if this word exactly matches any in our preserve list (case-insensitive)
                    exact_match = False
                    for exact_word in preserve_exact_case:
                        if word.upper() == exact_word.upper():
                            new_attr_words.append(exact_word)  # Use the exact case from our list
                            exact_match = True
                            break
                    
                    # If not an exact match, convert to Title Case
                    if not exact_match:
                        new_attr_words.append(word.title())
                
                # Join words back together
                new_value = ' '.join(new_attr_words)
                
                # Handle addresses with street/road names and "near" phrases
                # Match patterns like "EUCLID AVENUE near LIBERIA AVENUE"
                for address_word in address_words:
                    # Find all instances of address words in all caps followed by another word
                    pattern = r'\b([A-Z]+\s+' + address_word.upper() + r'(?:\s+(?:near|@)\s+[A-Z]+\s+' + address_word.upper() + r')?)\b'
                    matches = re.findall(pattern, new_value, re.IGNORECASE)
                    
                    for match in matches:
                        # Remove the address
                        new_value = new_value.replace(match, '')
                
                # Handle address with unit numbers (e.g., "25280 PLEASANT VALLEY ROAD UNIT 174")
                unit_pattern = r'\b(\d+\s+[A-Z]+(?:\s+[A-Z]+)*\s+(?:' + '|'.join(address_words).upper() + r')\s+UNIT\s+\d+)\b'
                unit_matches = re.findall(unit_pattern, new_value, re.IGNORECASE)
                
                for match in unit_matches:
                    # Remove the address
                    new_value = new_value.replace(match, '')
                
                # Handle addresses with street numbers
                street_number_pattern = r'\b\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+(?:' + '|'.join(address_words) + r')\b'
                street_number_matches = re.findall(street_number_pattern, new_value, re.IGNORECASE)
                
                for match in street_number_matches:
                    # Remove the address
                    new_value = new_value.replace(match, '')
                
                # Clean up any double spaces
                new_value = re.sub(r'\s+', ' ', new_value).strip()
                
                new_row[car_attrs_index - 1] = new_value
        
        # Write the modified row
        writer.writerow(new_row)

print("\nCSV processing complete. URL column removed and bodyText cleaned.")
print(f"Output saved to: {output_file}")
# Save approved addresses at the end to ensure all are captured
save_approved_addresses()
save_rejected_addresses()
