import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from '../../../types';
import '../../../styles/components/CarCard.scss';

interface CarCardProps {
  car: Car;
  isFullWidth?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({ car, isFullWidth = false }) => {
  console.log('CarCard rendering with car:', JSON.stringify(car, null, 2));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  // Get image URL with REACT_APP_BASE_URL if it's a relative path
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      // Use a fallback image if no image path is provided
      return "https://via.placeholder.com/300x200?text=Car+Image";
    }
    
    if (!imagePath.startsWith('http')) {
      // If it's a relative path, prepend the path to the images folder
      return `/img/car_images/${imagePath}`;
    }
    return imagePath;
  };

  return (
    <Link 
      to={`/inventory/${car.id}`} 
      className={`car-card ${isFullWidth ? 'car-card--full' : ''}`}
    >
      <div className="car-card__image-container">
        <img 
          src={getImageUrl(car.image_name)} 
          alt={`${car.model_year} ${car.make} ${car.model}`} 
          className="car-card__image"
        />
      </div>
      <div className="car-card__content">
        <h3 className="car-card__title">
          {car.model_year} {car.make} {car.model}
        </h3>
        <div className="car-card__details">
          <p className="car-card__price">{formatPrice(car.price)}</p>
          <p className="car-card__mileage">{formatMileage(car.mileage)} miles</p>
        </div>
        <p className="car-card__summary">{car.body_text}</p>
        {isFullWidth && (
          <div className="car-card__specs">
            <p>Color: {car.color}</p>
            <p>Doors: {car.doors}</p>
            <p>Engine: {car.engine_size}</p>
            <p>Horsepower: {car.horsepower} HP</p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default CarCard;
