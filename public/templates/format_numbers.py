import csv
import re

input_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_processed.csv'
output_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_formatted.csv'

print("Processing car_listings_processed.csv to format price and odometer values...")

with open(input_file, 'r', newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    # Read the header row
    header = next(reader)
    writer.writerow(header)
    
    # Find the indices of the price and odometer columns
    price_index = header.index('price')
    odometer_index = header.index('odometer')
    bodytext_index = header.index('bodyText')
    
    # Process each row
    for i, row in enumerate(reader, 1):
        if len(row) > 0:
            # Remove commas from price field
            if price_index < len(row) and row[price_index]:
                # Remove any dollar signs if present
                price_value = row[price_index].replace('$', '')
                # Remove commas
                price_value = price_value.replace(',', '')
                # Remove any trailing text (like "/Mo")
                price_value = re.sub(r'[^0-9].*$', '', price_value)
                row[price_index] = price_value
            
            # Remove commas from odometer field
            if odometer_index < len(row) and row[odometer_index]:
                # Remove commas
                odometer_value = row[odometer_index].replace(',', '')
                row[odometer_index] = odometer_value
            
            # Format prices in bodyText
            if bodytext_index < len(row) and row[bodytext_index]:
                body_text = row[bodytext_index]
                
                # Process the bodyText to add dollar signs to prices and format with commas
                
                # 1. First, handle specific price indicators like "Price:" or "Today:"
                body_text = re.sub(r'(Price:|Today:)\s*(\d{4,})(?!\s*[Mm]iles)', 
                                   lambda m: f"{m.group(1)} ${int(m.group(2)):,}", 
                                   body_text)
                
                # 2. Look for standalone numbers that are likely prices (4+ digits, not years or mileage)
                # Avoid matching years (2000-2025) that are likely model years
                # Avoid matching mileage values (typically followed by "miles" or similar)
                def format_price(match):
                    num = match.group(1)
                    # Skip if it looks like a year between 2000-2025
                    if len(num) == 4 and 2000 <= int(num) <= 2025:
                        return match.group(0)
                    return f" ${int(num):,}"
                
                body_text = re.sub(r'(?<!\$)(?<!\d)(?<![Mm]ileage:)(?<![Mm]iles:)\s+(\d{4,})(?!\s*[Mm]iles)(?!\s*[Mm]ileage)', 
                                   format_price, 
                                   body_text)
                
                row[bodytext_index] = body_text
            
            writer.writerow(row)
        
        # Print progress every 50 rows
        if i % 50 == 0:
            print(f"Processed {i} rows...")

print(f"Done! Formatted CSV saved to {output_file}")
print("The formatted file has prices and odometer values without commas, and dollar signs added to prices in bodyText with proper comma formatting.")
