-- Create the database

USE evilgeo2_DealerBase;

-- Create Cars table
CREATE TABLE IF NOT EXISTS cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30) NOT NULL,
    doors INT NOT NULL,
    engine_displacement VARCHAR(20) NOT NULL,
    horsepower INT NOT NULL,
    mileage INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    summary VARCHAR(300) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Carousel table
CREATE TABLE IF NOT EXISTS carousel_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    subtitle VARCHAR(200),
    delay INT DEFAULT 7000,
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for common searches
CREATE INDEX idx_cars_make ON cars(make);
CREATE INDEX idx_cars_model ON cars(model);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_mileage ON cars(mileage);
CREATE INDEX idx_carousel_order ON carousel_images(display_order);

-- Create the user and grant privileges

GRANT ALL PRIVILEGES ON evilgeo2_DealerBase.* TO 'evilgeo2_Dealers'@'localhost';
FLUSH PRIVILEGES;
