const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const csv = require('csv-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dealership_db'
};

// Function to import CSV data into the database
async function importCarsFromCSV() {
  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database successfully');

    // Read CSV file
    const csvFilePath = path.join(__dirname, 'transformed_car_listings.csv');
    const results = [];
    
    // Parse CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`CSV file parsed successfully. Found ${results.length} records.`);
        
        // Process each row
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < results.length; i++) {
          const car = results[i];
          
          try {
            // Extract make, model, year from title if available
            let make = '';
            let model = '';
            let year = 0;
            let color = 'Unknown';
            
            if (car.Title) {
              const titleParts = car.Title.split(' ');
              if (titleParts.length >= 2) {
                // Try to extract year (usually the first 4-digit number in the title)
                const yearMatch = car.Title.match(/\b(19|20)\d{2}\b/);
                if (yearMatch) {
                  year = parseInt(yearMatch[0], 10);
                  
                  // Assuming make is usually right after the year
                  const yearIndex = titleParts.findIndex(part => part.includes(yearMatch[0]));
                  if (yearIndex !== -1 && yearIndex + 1 < titleParts.length) {
                    make = titleParts[yearIndex + 1];
                    
                    // Model could be the rest of the words after make
                    if (yearIndex + 2 < titleParts.length) {
                      model = titleParts.slice(yearIndex + 2).join(' ');
                    }
                  }
                } else {
                  // If no year found, assume first word is make and rest is model
                  make = titleParts[0];
                  model = titleParts.slice(1).join(' ');
                }
              }
            }
            
            // Extract price
            let price = 0;
            if (car.Price) {
              // Remove non-numeric characters except decimal point
              const priceStr = car.Price.replace(/[^0-9.]/g, '');
              price = parseFloat(priceStr) || 0;
            }
            
            // Extract mileage from summary if available
            let mileage = 0;
            if (car.Summary) {
              const mileageMatch = car.Summary.match(/odometer:\s*([\d,]+)/i);
              if (mileageMatch && mileageMatch[1]) {
                mileage = parseInt(mileageMatch[1].replace(/,/g, ''), 10) || 0;
              }
              
              // Try to extract color
              const colorMatch = car.Summary.match(/paint color:\s*([a-zA-Z]+)/i);
              if (colorMatch && colorMatch[1]) {
                color = colorMatch[1];
              }
            }
            
            // Prepare query
            const query = `
              INSERT INTO cars (
                make, model, year, color, doors, 
                engineDisplacement, horsepower, mileage, 
                price, summary, description, imageUrl
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            // Execute query
            const [result] = await connection.execute(query, [
              make || 'Unknown',
              model || 'Unknown',
              year || 0,
              color,
              4, // Default doors
              'Unknown', // Default engineDisplacement
              0, // Default horsepower
              mileage,
              price,
              car.Summary || '',
              car.Description || '',
              car.ImageURL || ''
            ]);
            
            console.log(`Row ${i + 1}: Imported successfully. ID: ${result.insertId}`);
            successCount++;
          } catch (error) {
            console.error(`Row ${i + 1}: Error importing data`);
            console.error('Error details:', error.message);
            console.log('Row data:', car);
            errorCount++;
          }
        }
        
        console.log(`Import completed. Successfully imported: ${successCount}, Errors: ${errorCount}`);
        await connection.end();
        process.exit(0);
      });
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    process.exit(1);
  }
}

// Run the import function
importCarsFromCSV();
