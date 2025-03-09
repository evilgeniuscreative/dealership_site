import csv
import re

input_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_new.csv'
output_file = '/Users/iankleinfeld/Documents/WebProjects/Projects/dealership/public/templates/car_listings_processed.csv'

# Regular expressions for extracting specific fields from carAttrs
condition_pattern = r'Condition:\s*([^;]+)'
cylinders_pattern = r'Cylinders:\s*(\d+)'
fuel_pattern = r'Fuel:\s*([^;]+)'
odometer_pattern = r'Odometer:\s*([^;]+)'
color_pattern = r'color:\s*([^;]+)'
status_pattern = r'Status:\s*([^;]+)'
transmission_pattern = r'transmission:\s*([^;]+)'
type_pattern = r'type:\s*([^;]+)'

print("Processing car_listings_new.csv to extract structured data from carAttrs column...")

with open(input_file, 'r', newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    # Read the header row
    header = next(reader)
    
    # Create a new header with the specified order
    # id, year, make, model, price, title, condition, cylinders, fuel, odometer, color, status, transmission, type, bodyText, imageName
    new_header = ["id", "year", "make", "model", "price", "title", 
                 "condition", "cylinders", "fuel", "odometer", "color", "status", "transmission", "type", 
                 "bodyText", "imageName"]
    writer.writerow(new_header)
    
    # Process each row
    for i, row in enumerate(reader, 1):
        if len(row) > 0:
            # Extract data from the original row
            car_id = row[0] if len(row) > 0 else ""
            year = row[1] if len(row) > 1 else ""
            make = row[2] if len(row) > 2 else ""
            model = row[3] if len(row) > 3 else ""
            price = row[4] if len(row) > 4 else ""
            title = row[5] if len(row) > 5 else ""
            car_attrs = row[6] if len(row) > 6 else ""
            body_text = row[7] if len(row) > 7 else ""
            image_name = row[8] if len(row) > 8 else ""
            
            # Extract fields from carAttrs using regex
            condition_match = re.search(condition_pattern, car_attrs, re.IGNORECASE)
            cylinders_match = re.search(cylinders_pattern, car_attrs, re.IGNORECASE)
            fuel_match = re.search(fuel_pattern, car_attrs, re.IGNORECASE)
            odometer_match = re.search(odometer_pattern, car_attrs, re.IGNORECASE)
            color_match = re.search(color_pattern, car_attrs, re.IGNORECASE)
            status_match = re.search(status_pattern, car_attrs, re.IGNORECASE)
            transmission_match = re.search(transmission_pattern, car_attrs, re.IGNORECASE)
            type_match = re.search(type_pattern, car_attrs, re.IGNORECASE)
            
            # Get the extracted values or empty string if not found
            condition = condition_match.group(1).strip() if condition_match else ""
            cylinders = cylinders_match.group(1).strip() if cylinders_match else ""
            fuel = fuel_match.group(1).strip() if fuel_match else ""
            odometer = odometer_match.group(1).strip() if odometer_match else ""
            
            # Clean up color value - remove "Title" if it appears at the end
            color = color_match.group(1).strip() if color_match else ""
            color = re.sub(r'\s*Title.*$', '', color)
            
            status = status_match.group(1).strip() if status_match else ""
            transmission = transmission_match.group(1).strip() if transmission_match else ""
            type_value = type_match.group(1).strip() if type_match else ""
            
            # Also clean up any "Title" text that might appear in the odometer value
            odometer = re.sub(r'\s*Title.*$', '', odometer)
            
            # Create a new row with the specified order
            new_row = [car_id, year, make, model, price, title, 
                      condition, cylinders, fuel, odometer, color, status, transmission, type_value, 
                      body_text, image_name]
            writer.writerow(new_row)
        
        # Print progress every 50 rows
        if i % 50 == 0:
            print(f"Processed {i} rows...")

print(f"Done! Processed CSV saved to {output_file}")
print("The processed file contains the extracted values from carAttrs in the specified column order.")
