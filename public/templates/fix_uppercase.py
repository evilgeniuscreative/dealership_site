import csv
import re

input_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_new.csv'
output_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_fixed.csv'

# Words that should be preserved in their exact case
preserve_exact_case = ['VIN','A5', 'Z3', 'Z4', 'WD', 'LE', 'CL', 'GT', 'LI', 'AC', 'CDL', 'SUV', 'H4', 'SE', 'XLT', 'SD', 'DR', 'LX', 'AMD', 'X3', 'X4', 'X6M', 'CR-V', 'GLE', 'EX', 'LTD', 'GLS', 'GT1', 'LR4', 'HSE', '4WD', 'CX-5', '4Runner', 'Q5', 'Q7', 'ES350', 'XC90', 'H2', 'HR-V', 'RX350', 'RX', 'CRV HR-V', 'HS', '250H', 'GX', 'E-PACE', 'RAV4', 'X6M', 'PZEV', '4MATIC']

# Function to convert text to Title Case while preserving special words
def convert_to_title_case(text, preserve_words):
    # Split text into words
    words = text.split()
    new_words = []
    
    for word in words:
        # Check if this word exactly matches any in our preserve list (case-insensitive)
        exact_match = False
        for exact_word in preserve_words:
            if word.upper() == exact_word.upper():
                new_words.append(exact_word)  # Use the exact case from our list
                exact_match = True
                break
        
        # If not an exact match, convert to Title Case
        if not exact_match:
            new_words.append(word.title())
    
    # Join words back together
    return ' '.join(new_words)

# Function to find and convert uppercase words to Title Case
def fix_uppercase_words(text):
    # Find all uppercase words (2 or more characters)
    words = text.split()
    result = []
    
    for word in words:
        # If word is all uppercase and at least 2 characters long, convert to Title Case
        if word.isupper() and len(word) > 1:
            # Check if it's in our preserve list first
            preserve = False
            for exact_word in preserve_exact_case:
                if word.upper() == exact_word.upper():
                    result.append(exact_word)
                    preserve = True
                    break
            
            # If not in preserve list, convert to Title Case
            if not preserve:
                result.append(word.title())
        else:
            result.append(word)
    
    return ' '.join(result)

print("This script will fix uppercase words in the title, model, carAttrs, and bodyText columns.")
print("It will also remove VIN numbers from carAttrs and bodyText columns.")
print("Processing...")

with open(input_file, 'r', newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    # Process each row
    for i, row in enumerate(reader):
        if i == 0:  # Header row
            # Get the indices of columns
            title_index = row.index('title')
            model_index = row.index('model')
            body_text_index = row.index('bodyText')
            car_attrs_index = row.index('carAttrs')
            writer.writerow(row)  # Write header row unchanged
        else:
            # Remove VIN numbers and fix uppercase words in carAttrs column
            if len(row) > car_attrs_index:
                # Pattern to match VIN numbers
                vin_pattern = r"(?i)vin:?\s*[a-zA-Z0-9]{17}\s"
                row[car_attrs_index] = re.sub(vin_pattern, '', row[car_attrs_index])
                # Fix uppercase words
                row[car_attrs_index] = fix_uppercase_words(row[car_attrs_index])
            
            # Remove VIN numbers and fix uppercase words in bodyText column
            if len(row) > body_text_index:
                # Pattern to match VIN numbers
                vin_pattern = r"(?i)vin:?\s*[a-zA-Z0-9]{17}\s"
                row[body_text_index] = re.sub(vin_pattern, '', row[body_text_index])
                # Fix uppercase words
                row[body_text_index] = fix_uppercase_words(row[body_text_index])
            
            # Fix the model field - convert to Title Case while preserving special words
            if len(row) > model_index:
                row[model_index] = convert_to_title_case(row[model_index], preserve_exact_case)
            
            # Fix the title field - convert to Title Case while preserving special words
            if len(row) > title_index:
                row[title_index] = convert_to_title_case(row[title_index], preserve_exact_case)
            
            writer.writerow(row)

print(f"Done! Fixed CSV saved to {output_file}")
