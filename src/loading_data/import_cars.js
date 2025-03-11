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
  database: process.env.DB_NAME || 'dealership_db2'
};

// Function to empty the cars table
async function emptyCarTable() {
  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database successfully for emptying the cars table');

    // Execute TRUNCATE TABLE query
    await connection.execute('TRUNCATE TABLE cars');
    console.log('Cars table emptied successfully');
    
    // Close the connection
    await connection.end();
    return true;
  } catch (error) {
    console.error('Error emptying cars table:', error.message);
    return false;
  }
}

// Function to import CSV data into the database
async function importCarsFromCSV() {
  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database successfully');

    // Read CSV file
    const csvFilePath = path.join(__dirname, 'car_listings_formatted.csv');
    console.log('IMPORT CSV file path:',csvFilePath)
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
            // Extract values directly from CSV columns
            const make = car.make || '';
            const model = car.model || '';
            const year = parseInt(car.model_year, 10) || 0;
            const color = car.color || 'Unknown';
            const car_condition = car.car_condition || 'Unknown';
            const car_transmission = car.car_transmission || 'Unknown';
            const car_type = car.car_type || 'Unknown';
            const car_status = car.car_status || 'Available';
            const doors = parseInt(car.doors, 10) || 4; // Default to 4 if not provided
            const engine_size = car.engine_size || `${car.cylinders || ''}${car.fuel ? '-' + car.fuel : ''}`;
            const horsepower = parseInt(car.horsepower, 10) || 0;
            
            // Extract price
            let price = 0;
            if (car.price) {
              // Remove non-numeric characters except decimal point
              const priceStr = car.price.toString().replace(/[^0-9.]/g, '');
              price = parseFloat(priceStr) || 0;
            }
            
            // Extract mileage
            let mileage = 0;
            if (car.odometer) {
              const mileageStr = car.odometer.toString().replace(/[^0-9.]/g, '');
              mileage = parseInt(mileageStr, 10) || 0;
            }
            
            // Determine if car is featured or on sale
            const featured_car = car.featured_car === '1' ? 1 : 0;
            const on_sale = car.on_sale === '1' ? 1 : 0;
            const pct_off = parseInt(car.pct_off, 10) || 0;
            
            // Prepare query with updated column names
            const query = `
              INSERT INTO cars (
                make, model, model_year, color, doors, 
                engine_size, horsepower, mileage, 
                price, title, body_text, image_name,
                car_condition, car_status, car_transmission, car_type,
                featured_car, on_sale, pct_off
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            // Execute query
            const [result] = await connection.execute(query, [
              make,
              model,
              year,
              color,
              doors,
              engine_size,
              horsepower,
              mileage,
              price,
              car.title || '',
              car.bodyText || car.body_text || '',
              car.image_name || '',
              car_condition,
              car_status,
              car_transmission,
              car_type,
              featured_car,
              on_sale,
              pct_off
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
async function main() {
  await emptyCarTable();
  importCarsFromCSV();
}

main();
