#!/usr/bin/env python3
import csv
import re
import os
from pathlib import Path

# Input and output file paths
input_file = Path(__file__).parent / 'car_listings.csv'
output_file = Path(__file__).parent / 'transformed_car_listings.csv'

# Function to extract year, make, and model from title
def extract_car_info(title):
    # Remove common phrases to ignore
    title = re.sub(r'For Sale', '', title, flags=re.IGNORECASE)
    title = re.sub(r'[-–].*$', '', title)  # Remove anything after dash
    title = re.sub(r'\b\d+[k]\b', '', title, flags=re.IGNORECASE)  # Remove numbers followed by k
    title = re.sub(r'\b\d+,?\d*\s*miles\b', '', title, flags=re.IGNORECASE)  # Remove mileage
    title = re.sub(r'original miles', '', title, flags=re.IGNORECASE)
    title = re.sub(r'1 owner', '', title, flags=re.IGNORECASE)
    
    # Clean up extra spaces
    title = re.sub(r'\s+', ' ', title).strip()
    
    # Try to extract year, make, and model
    year_match = re.search(r'^(\d{4})\s', title)
    
    if year_match:
        year = year_match.group(1)
        remaining = title[year_match.end():].strip()
        
        # Try to extract make and model
        parts = remaining.split(' ', 1)
        if len(parts) > 0:
            make = parts[0]
            model = parts[1] if len(parts) > 1 else ''
            
            return {
                'year': int(year),
                'make': make,
                'model': model
            }
    
    # Return empty values if pattern doesn't match
    return {
        'year': None,
        'make': None,
        'model': None
    }

# Function to clean price
def clean_price(price_str):
    if not price_str:
        return None
    
    # Remove $ and commas
    price_str = price_str.replace('$', '').replace(',', '')
    
    try:
        return float(price_str)
    except ValueError:
        return None

# Function to merge and clean summary
def clean_summary(map_attrs, posting_body):
    combined = f"{map_attrs} {posting_body}"
    
    # Remove addresses and "google map"
    combined = re.sub(r'google map', '', combined, flags=re.IGNORECASE)
    
    # Clean up extra spaces
    combined = re.sub(r'\s+', ' ', combined).strip()
    
    return combined

# Read the input CSV and transform it
transformed_rows = []
with open(input_file, 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    
    # Define new headers
    new_headers = [
        'id', 'make', 'model', 'year', 'color', 'doors', 
        'engineDisplacement', 'horsepower', 'mileage', 'price',
        'summary', 'description', 'imageUrl'
    ]
    
    transformed_rows.append(new_headers)
    
    for i, row in enumerate(reader, 1):
        car_info = extract_car_info(row['Title'])
        
        # Skip rows that don't match the expected pattern
        if not all([car_info['year'], car_info['make'], car_info['model']]):
            continue
        
        # Extract mileage from MapAndAttrs if available
        mileage = None
        mileage_match = re.search(r'odometer:\s*([\d,]+)', row['MapAndAttrs'])
        if mileage_match:
            mileage = int(mileage_match.group(1).replace(',', ''))
        
        # Extract color from MapAndAttrs if available
        color = "Unknown"
        color_match = re.search(r'paint color:\s*(\w+)', row['MapAndAttrs'])
        if color_match:
            color = color_match.group(1)
        
        # Set default values for fields we don't have
        doors = 4  # Default value
        engine_displacement = "Unknown"
        horsepower = 0  # Default value
        
        # Extract engine info if available
        engine_match = re.search(r'cylinders:\s*(\d+)\s*cylinders', row['MapAndAttrs'])
        if engine_match:
            engine_displacement = f"{engine_match.group(1)}-cylinder"
        
        # Create transformed row
        transformed_row = [
            i,  # New sequential ID
            car_info['make'],
            car_info['model'],
            car_info['year'],
            color,
            doors,
            engine_displacement,
            horsepower,
            mileage if mileage else 0,
            clean_price(row['Price']),
            clean_summary(row['MapAndAttrs'], row['PostingBody']),
            "",  # Empty description
            row['ImageFileName'] if 'ImageFileName' in row else ""
        ]
        
        transformed_rows.append(transformed_row)

# Write the transformed data to the output file
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerows(transformed_rows)

print(f"Transformation complete. Transformed data saved to {output_file}")
