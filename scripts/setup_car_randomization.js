const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupCarRandomization() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dealership_db2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Setting up cars_array table...');
    
    // Drop existing table if it exists to ensure clean setup
    await pool.execute('DROP TABLE IF EXISTS cars_array');
    
    // Create cars_array table with the correct columns
    await pool.execute(`
      CREATE TABLE cars_array (
        id INT AUTO_INCREMENT PRIMARY KEY,
        c_array JSON NOT NULL COMMENT 'Original array of all car IDs (source of truth)',
        visitor_array JSON COMMENT 'JSON object mapping visitor IDs to their randomized car arrays',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Created cars_array table');
    
    // Get all car IDs
    const [carRows] = await pool.execute('SELECT id FROM cars');
    const carIds = carRows.map(row => row.id);
    console.log(`Found ${carIds.length} cars in the database`);
    
    // Insert into cars_array with empty visitor_array
    await pool.execute(
      'INSERT INTO cars_array (c_array, visitor_array) VALUES (?, ?)',
      [JSON.stringify(carIds), JSON.stringify({})]
    );
    
    console.log(`Added ${carIds.length} car IDs to c_array in cars_array table`);
    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Error setting up car randomization:', error);
    // Print more detailed error information
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
      console.error('SQL Query:', error.sql);
    }
  } finally {
    await pool.end();
  }
}

setupCarRandomization();
