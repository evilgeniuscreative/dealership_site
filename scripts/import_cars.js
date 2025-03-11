const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const csv = require('csv-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'dealership_db2',
};

async function clearDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connected to database');

  try {
    // Get all tables in the database
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [dbConfig.database]);
    
    // Disable foreign key checks to avoid constraint errors
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Empty all tables
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`Emptying table: ${tableName}`);
      await connection.execute(`TRUNCATE TABLE ${tableName}`);
    }
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('All tables have been emptied successfully');
    
    // Now import car data
    await importCars(connection);
    
  } catch (error) {
    console.error('Error during database clearing:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

async function importCars(connection) {
  console.log('Starting car data import...');
  
  try {
    const results = [];
    
    // Read and parse the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../public/templates/car_listings_formatted.csv'))
        .pipe(csv())
        .on('data', (data) => {
          // Transform data to match the database schema
          const car = {
            make: (data.make || '').substring(0, 75), // Truncate to 75 characters
            model: (data.model || '').substring(0, 50), // Truncate to 50 characters
            model_year: parseInt(data.modelYear) || 2023,
            color: (data.color || '').substring(0, 30), // Truncate to 30 characters
            doors: 4, // Default value
            engine_size: (data.fuel || '2.0L').substring(0, 20), // Truncate to 20 characters
            horsepower: parseInt(data.cylinders) * 25 || 200, // Estimate based on cylinders
            mileage: parseInt(data.odometer) || 0,
            price: parseInt(data.price) || 0,
            title: (data.title || '').substring(0, 300), // Truncate to 300 characters
            body_text: (data.bodyText || '').substring(0, 65535), // Truncate to 65535 characters
            image_name: (data.imageName || '').substring(0, 255), // Truncate to 255 characters
            car_condition: (data.car_condition || 'Good').substring(0, 50), // Truncate to 50 characters
            car_status: (data.car_status || 'Clean').substring(0, 50), // Truncate to 50 characters
            car_transmission: (data.car_transmission || 'Automatic').substring(0, 50), // Truncate to 50 characters
            car_type: (data.car_type || 'Sedan').substring(0, 50), // Truncate to 50 characters
            featured_car: Math.random() < 0.3 ? 1 : 0 // Randomly mark some cars as featured
          };
          results.push(car);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    // Insert the data into the cars table
    console.log(`Importing ${results.length} cars...`);
    
    for (const car of results) {
      await connection.execute(
        `INSERT INTO cars (
          make, model, model_year, color, doors, engine_size, 
          horsepower, mileage, price, title, body_text, image_name,
          car_condition, car_status, car_transmission, car_type, featured_car
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          car.make, car.model, car.model_year, car.color, car.doors, car.engine_size,
          car.horsepower, car.mileage, car.price, car.title, car.body_text, car.image_name,
          car.car_condition, car.car_status, car.car_transmission, car.car_type, car.featured_car
        ]
      );
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
  }
}

clearDatabase();
