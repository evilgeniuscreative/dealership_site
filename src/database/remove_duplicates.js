/**
 * Script to remove duplicate car entries from the dealership_db2 database
 * 
 * This script identifies and removes duplicate car entries based on a combination of:
 * - make
 * - model
 * - modelYear
 * - mileage
 * - title
 * 
 * For each set of duplicates, it keeps the record with the lowest ID (oldest record)
 * and removes the others.
 */

const mysql = require('mysql2/promise');
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

async function removeDuplicateCars() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database successfully');
    
    // Step 1: Find duplicate cars based on make, model, modelYear, mileage, and title
    console.log('Identifying duplicate cars...');
    
    const [duplicates] = await connection.execute(`
      SELECT make, model, modelYear, mileage, title, COUNT(*) as count
      FROM cars
      GROUP BY make, model, modelYear, mileage, title
      HAVING COUNT(*) > 1
    `);
    
    console.log(`Found ${duplicates.length} sets of duplicate cars`);
    
    if (duplicates.length === 0) {
      console.log('No duplicates found. Database is clean.');
      return;
    }
    
    // Step 2: For each set of duplicates, keep the one with the lowest ID and delete the rest
    let totalRemoved = 0;
    
    for (const duplicate of duplicates) {
      const { make, model, modelYear, mileage, title } = duplicate;
      
      // Find all IDs for this duplicate set
      const [rows] = await connection.execute(`
        SELECT id 
        FROM cars 
        WHERE make = ? AND model = ? AND modelYear = ? AND mileage = ? AND title = ?
        ORDER BY id ASC
      `, [make, model, modelYear, mileage, title]);
      
      // Keep the first one (lowest ID) and delete the rest
      const idsToKeep = rows[0].id;
      const idsToDelete = rows.slice(1).map(row => row.id);
      
      if (idsToDelete.length > 0) {
        console.log(`Keeping car ID ${idsToKeep}, removing duplicate IDs: ${idsToDelete.join(', ')}`);
        
        // Delete the duplicates
        const [deleteResult] = await connection.execute(`
          DELETE FROM cars WHERE id IN (${idsToDelete.join(',')})
        `);
        
        totalRemoved += deleteResult.affectedRows;
      }
    }
    
    console.log(`Duplicate removal complete. Removed ${totalRemoved} duplicate car records.`);
    
    // Step 3: Verify the cleanup
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM cars');
    console.log(`Final car count in database: ${finalCount[0].count}`);
    
  } catch (error) {
    console.error('Error removing duplicates:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the duplicate removal function
removeDuplicateCars();
