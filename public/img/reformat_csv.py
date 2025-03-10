import pandas as pd
import re
import csv

def reformat_csv():
    print("Reading car_listings.csv...")
    
    try:
        # Read the CSV file with more robust parsing
        df = pd.read_csv('car_listings.csv', quoting=csv.QUOTE_MINIMAL, 
                         on_bad_lines='skip')
        
        # Create a new CSV file with the proper headers
        with open('car_listings_new.csv', 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.writer(outfile)
            
            # Write the new headers in the specified order
            writer.writerow(['ID', 'Year', 'Make', 'Model', 'Price', 'Title', 'URL', 
                            'MapAndAttrs', 'PostingBody', 'ImageFileName'])
            
            # Process each row
            for index, row in df.iterrows():
                title = row['Title']
                
                # Initialize variables
                year = ''
                make = ''
                model = ''
                
                # Check if the first four characters are numbers (year)
                year_match = re.match(r'^(\d{4})\s+(.*)', title)
                if year_match:
                    year = year_match.group(1)
                    rest = year_match.group(2)
                    
                    # Extract make (first word after year)
                    make_match = re.match(r'^(\S+)\s+(.*)', rest)
                    if make_match:
                        make = make_match.group(1)
                        model = make_match.group(2)
                
                # Write the row with the new structure and order
                writer.writerow([
                    row['ID'],
                    year,
                    make,
                    model,
                    row['Price'],
                    title,
                    row['URL'],
                    row['MapAndAttrs'],
                    row['PostingBody'],
                    row['ImageFileName']
                ])
        
        print("Created car_listings_new.csv with new column structure")
        
        # Replace the original file with the new one
        import os
        os.replace('car_listings_new.csv', 'car_listings.csv')
        
        print("Updated car_listings.csv with new headers and column structure")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reformat_csv()
