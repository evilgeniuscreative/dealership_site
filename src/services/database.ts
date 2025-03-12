import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',  // Empty password for root user
  database: process.env.DB_NAME || 'dealership_db2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
