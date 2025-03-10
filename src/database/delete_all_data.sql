-- SQL script to delete all data from dealership_db2 database
-- This will truncate all tables but preserve the table structures

USE dealership_db2;

-- Disable foreign key checks temporarily to avoid constraint errors
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables
TRUNCATE TABLE cars;
TRUNCATE TABLE carousel_images;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify that tables are empty
SELECT 'cars' AS table_name, COUNT(*) AS row_count FROM cars
UNION ALL
SELECT 'carousel_images', COUNT(*) FROM carousel_images
UNION ALL
SELECT 'users', COUNT(*) FROM users;
