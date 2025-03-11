-- Update column names in carousel_images table to use snake_case
ALTER TABLE carousel_images CHANGE COLUMN imageName image_name VARCHAR(255) NOT NULL;

-- Update column names in cars table to use snake_case
ALTER TABLE cars CHANGE COLUMN modelYear model_year INT;
ALTER TABLE cars CHANGE COLUMN bodyText body_text TEXT;
ALTER TABLE cars CHANGE COLUMN imageName image_name VARCHAR(255);
