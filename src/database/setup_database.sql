-- Database setup script for Dealership application
-- This script will create the database and tables required for the application

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dealership_db2;

-- Use the database
USE dealership_db2;

-- Create the cars table
CREATE TABLE IF NOT EXISTS `cars` (
  `id` int NOT NULL AUTO_INCREMENT,
  `make` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `modelYear` int NOT NULL,
  `color` varchar(30),
  `doors` int,
  `engine_size` varchar(20),
  `horsepower` int,
  `mileage` int NOT NULL,
  `price` int NOT NULL,
  `title` varchar(300) NOT NULL,
  `bodyText` text NOT NULL,
  `imageName` varchar(255) NOT NULL,
  `car_condition` varchar(50),
  `car_status` varchar(50),
  `car_transmission` varchar(50),
  `car_type` varchar(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cars_make` (`make`),
  INDEX `idx_cars_model` (`model`),
  INDEX `idx_cars_modelYear` (`modelYear`),
  INDEX `idx_cars_price` (`price`),
  INDEX `idx_cars_mileage` (`mileage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create carousel_images table
CREATE TABLE IF NOT EXISTS `carousel_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imageName` varchar(255) NOT NULL,
  `title` varchar(100),
  `subtitle` varchar(200),
  `delay` int DEFAULT 7000,
  `display_order` int NOT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_carousel_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255),
  `role` enum('user', 'admin', 'sales', 'customer service') NOT NULL DEFAULT 'user',
  `two_factor_enabled` boolean DEFAULT false,
  `google_id` varchar(100),
  `google_profile` json,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Instructions for running this script:
-- 1. Install MySQL on the target computer
-- 2. Run this script using the following command:
--    mysql -u root -p < setup_database.sql
--    (You will be prompted for the MySQL root password)
-- 3. Create a user for the application (optional but recommended):
--    CREATE USER 'dealership_user'@'localhost' IDENTIFIED BY 'your_password';
--    GRANT ALL PRIVILEGES ON dealership_db2.* TO 'dealership_user'@'localhost';
--    FLUSH PRIVILEGES;
