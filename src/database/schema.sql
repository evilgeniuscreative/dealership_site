-- Create the database

USE evilgeo2_DealerBase;

-- Create Cars table
CREATE TABLE IF NOT EXISTS cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    modelYear INT NOT NULL,
    color VARCHAR(30),
    doors INT,
    engine_displacement VARCHAR(20),
    horsepower INT,
    mileage INT NOT NULL,
    price INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    bodyText TEXT NOT NULL,
    imageName VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Carousel table
CREATE TABLE IF NOT EXISTS carousel_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    imageName VARCHAR(255) NOT NULL,
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
CREATE INDEX idx_cars_odometer ON cars(odometer);
CREATE INDEX idx_carousel_order ON carousel_images(display_order);

-- Create the user and grant privileges

GRANT ALL PRIVILEGES ON evilgeo2_DealerBase.* TO 'evilgeo2_Dealers'@'localhost';
FLUSH PRIVILEGES;
