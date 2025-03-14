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
console.log('car?',car.body_text)
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number | null | undefined) => {
    if (!mileage) return '';
    return new Intl.NumberFormat('en-US').format(car.mileage);
  };

  // Get image URL with REACT_APP_BASE_URL if it's a relative path
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) {
      // Return a data URI for a simple car silhouette as fallback
      return "/img/placeholder-car.jpg";
    }
    
    if (!imagePath.startsWith('http')) {
      // If it's a relative path, prepend the path to the images folder
      return `/img/car_images/${imagePath}`;
    }
    return imagePath;
  };

  // Truncate text to a specified character limit, ending at the last full word
  const truncateText = (text: string, limit: number = 360) => {
    if (!text || text.length <= limit) return text;
    
    // Find the last space within the limit
    const lastSpaceIndex = text.substring(0, limit).lastIndexOf(' ');
    
    // If no space found, just cut at the limit
    if (lastSpaceIndex === -1) return text.substring(0, limit) + '...';
    
    // Otherwise cut at the last space
    return text.substring(0, lastSpaceIndex) + '...';
  };

  // Check if the car has any displayable data
  const hasNoData = !car.make && !car.model && !car.price && !car.mileage && !car.image_name;
  
  return (
    <Link 
      to={`/inventory/${car.id}`} 
      className={`car-card ${isFullWidth ? 'car-card--full' : ''}`}
      style={{ border: '1px solid #e0e0e0', margin: '10px', minHeight: '300px' }}
    >
      <div className="car-card__image-container">
        <img 
          src={getImageUrl(car.image_name)} 
          alt={`${car.model_year || ''} ${car.make || ''} ${car.model || ''}`} 
          className="car-card__image"
          onError={(e) => {
            // Fallback if image fails to load - use inline SVG data URI
            e.currentTarget.src = "/img/placeholder-car.jpg";
          }}
          style={{ backgroundColor: '#f0f0f0' }}
        />
      </div>
      <div className="car-card__content">
        <h3 className="car-card__title">
          {car.model_year ? car.model_year : ''} {car.make ? car.make : ''} {car.model ? car.model : ''}
          {hasNoData && 'Featured Car'}
        </h3>
        <div className="car-card__details">
          {car.price > 0 && <p className="car-card__price">{formatPrice(car.price)}</p>}
          {car.mileage > 0 && <p className="car-card__mileage">{formatMileage(car.mileage)} miles</p>}
          {hasNoData && <p className="car-card__price">Contact for Price</p>}
        </div>
        {car.body_text && (
          <div className="car-card__summary-container">
            <p className="car-card__summary">{truncateText(car.body_text)}</p>
            <Link to={`/inventory/${car.id}`} className="car-card__read-more">Find out more...</Link>
          </div>
        )}
        {hasNoData && <p className="car-card__summary">Contact us for more information about this featured vehicle.</p>}
        {isFullWidth && (
          <div className="car-card__specs">
            {car.color && <p>Color: {car.color}</p>}
            {car.doors > 0 && <p>Doors: {car.doors}</p>}
            {car.engine_size && <p>Engine: {car.engine_size}</p>}
            {car.horsepower > 0 && <p>Horsepower: {car.horsepower} HP</p>}
          </div>
        )}
      </div>
    </Link>
  );
};

export default CarCard;
