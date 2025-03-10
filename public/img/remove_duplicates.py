import pandas as pd
import csv

def remove_duplicates():
    print("Reading car_listings.csv...")
    
    try:
        # Read the CSV file with more robust parsing
        df = pd.read_csv('car_listings.csv', quoting=csv.QUOTE_MINIMAL, 
                         on_bad_lines='skip')
        
        # Print initial information
        initial_count = len(df)
        print(f"Initial number of rows: {initial_count}")
        
        # Remove commas and quotes from Title column
        if 'Title' in df.columns:
            original_titles = df['Title'].copy()
            # Remove both commas and quote characters
            df['Title'] = df['Title'].str.replace(',', '')
            df['Title'] = df['Title'].str.replace('"', '')
            df['Title'] = df['Title'].str.replace("'", '')
            
            # Count changes
            changed_count = (original_titles != df['Title']).sum()
            print(f"Removed commas and quotes from {changed_count} titles")
        
        # Check for duplicates based on Title and Price
        duplicates = df.duplicated(subset=['Title', 'Price'], keep='first')
        duplicate_count = duplicates.sum()
        print(f"Found {duplicate_count} duplicate rows (same Title and Price)")
        
        if duplicate_count > 0:
            # Remove duplicates, keeping the first occurrence
            df_no_duplicates = df.drop_duplicates(subset=['Title', 'Price'], keep='first')
            
            # Save the cleaned data back to CSV
            df_no_duplicates.to_csv('car_listings.csv', index=False)
            
            # Print final information
            final_count = len(df_no_duplicates)
            print(f"Removed {duplicate_count} duplicate rows")
            print(f"Final number of rows: {final_count}")
        else:
            # Even if no duplicates, save the file with comma-free and quote-free titles
            df.to_csv('car_listings.csv', index=False)
            print("No duplicates found, but saved file with cleaned titles (no commas or quotes).")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_duplicates()
