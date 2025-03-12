-- Create the cars_array table to store all car IDs
CREATE TABLE IF NOT EXISTS cars_array (
  id INT AUTO_INCREMENT PRIMARY KEY,
  car_ids JSON NOT NULL COMMENT 'Array of all car IDs'
);

-- Create the visitor_car_orders table to store randomized car orders for each visitor
CREATE TABLE IF NOT EXISTS visitor_car_orders (
  visitor_id VARCHAR(64) PRIMARY KEY COMMENT 'Unique identifier for the visitor (could be a session ID or cookie)',
  car_ids JSON NOT NULL COMMENT 'Array of car IDs in randomized order for this visitor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert an initial empty array into cars_array if it doesn't exist
INSERT INTO cars_array (car_ids)
SELECT JSON_ARRAY()
WHERE NOT EXISTS (SELECT 1 FROM cars_array LIMIT 1);

-- Populate the cars_array table with all existing car IDs
UPDATE cars_array
SET car_ids = (
  SELECT JSON_ARRAYAGG(id) 
  FROM cars
)
WHERE id = 1;
