-- SQL script to update column names in the cars table
USE dealership_db2;

-- First, check which columns exist
SELECT 
  SUM(CASE WHEN COLUMN_NAME = 'engine_size' THEN 1 ELSE 0 END) AS engine_size_exists,
  SUM(CASE WHEN COLUMN_NAME = 'car_condition' THEN 1 ELSE 0 END) AS car_condition_exists,
  SUM(CASE WHEN COLUMN_NAME = 'car_status' THEN 1 ELSE 0 END) AS car_status_exists,
  SUM(CASE WHEN COLUMN_NAME = 'car_transmission' THEN 1 ELSE 0 END) AS car_transmission_exists,
  SUM(CASE WHEN COLUMN_NAME = 'car_type' THEN 1 ELSE 0 END) AS car_type_exists
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dealership_db2' 
AND TABLE_NAME = 'cars';

-- Add columns one by one with proper error handling
-- We'll use stored procedures to handle the error cases

-- Add engine_size if it doesn't exist
SET @sql = (SELECT IF(engine_size_exists = 0, 
            'ALTER TABLE cars ADD COLUMN engine_size VARCHAR(20) AFTER doors', 
            'SELECT "engine_size already exists"') 
            FROM (SELECT SUM(CASE WHEN COLUMN_NAME = 'engine_size' THEN 1 ELSE 0 END) AS engine_size_exists 
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = 'dealership_db2' AND TABLE_NAME = 'cars') AS t);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add car_condition if it doesn't exist
SET @sql = (SELECT IF(car_condition_exists = 0, 
            'ALTER TABLE cars ADD COLUMN car_condition VARCHAR(50) AFTER imageName', 
            'SELECT "car_condition already exists"') 
            FROM (SELECT SUM(CASE WHEN COLUMN_NAME = 'car_condition' THEN 1 ELSE 0 END) AS car_condition_exists 
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = 'dealership_db2' AND TABLE_NAME = 'cars') AS t);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add car_status if it doesn't exist
SET @sql = (SELECT IF(car_status_exists = 0, 
            'ALTER TABLE cars ADD COLUMN car_status VARCHAR(50) AFTER car_condition', 
            'SELECT "car_status already exists"') 
            FROM (SELECT SUM(CASE WHEN COLUMN_NAME = 'car_status' THEN 1 ELSE 0 END) AS car_status_exists 
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = 'dealership_db2' AND TABLE_NAME = 'cars') AS t);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add car_transmission if it doesn't exist
SET @sql = (SELECT IF(car_transmission_exists = 0, 
            'ALTER TABLE cars ADD COLUMN car_transmission VARCHAR(50) AFTER car_status', 
            'SELECT "car_transmission already exists"') 
            FROM (SELECT SUM(CASE WHEN COLUMN_NAME = 'car_transmission' THEN 1 ELSE 0 END) AS car_transmission_exists 
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = 'dealership_db2' AND TABLE_NAME = 'cars') AS t);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add car_type if it doesn't exist
SET @sql = (SELECT IF(car_type_exists = 0, 
            'ALTER TABLE cars ADD COLUMN car_type VARCHAR(50) AFTER car_transmission', 
            'SELECT "car_type already exists"') 
            FROM (SELECT SUM(CASE WHEN COLUMN_NAME = 'car_type' THEN 1 ELSE 0 END) AS car_type_exists 
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = 'dealership_db2' AND TABLE_NAME = 'cars') AS t);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the changes
DESCRIBE cars;
