-- Database setup script for Dealership application
-- This script will create the database and tables required for the application

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dealership_db;

-- Use the database
USE dealership_db;

-- Create the cars table
CREATE TABLE IF NOT EXISTS `cars` (
  `id` int NOT NULL AUTO_INCREMENT,
  `make` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` int NOT NULL,
  `color` varchar(50) NOT NULL,
  `doors` int NOT NULL,
  `engineDisplacement` varchar(50) NOT NULL,
  `horsepower` int NOT NULL,
  `mileage` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `summary` varchar(15000) NOT NULL,
  `description` text NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add indexes for common search fields
CREATE INDEX idx_cars_make ON cars(make);
CREATE INDEX idx_cars_model ON cars(model);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_mileage ON cars(mileage);

-- Instructions for running this script:
-- 1. Install MySQL on the target computer
-- 2. Run this script using the following command:
--    mysql -u root -p < setup_database.sql
--    (You will be prompted for the MySQL root password)
-- 3. Create a user for the application (optional but recommended):
--    CREATE USER 'dealership_user'@'localhost' IDENTIFIED BY 'your_password';
--    GRANT ALL PRIVILEGES ON dealership_db.* TO 'dealership_user'@'localhost';
--    FLUSH PRIVILEGES;
-- 4. Update the .env file with the database connection details
