import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Car } from '../types';
import '../styles/pages/CarDetailPage.scss';

const CarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cars/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch car details: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCar(data);
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  // Format price with currency symbol
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Contact for Price';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format mileage with commas
  const formatMileage = (mileage: number | null | undefined) => {
    if (!mileage) return 'N/A';
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  // Get image URL with proper path
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) {
      return "/img/placeholder-car.jpg";
    }
    
    if (!imagePath.startsWith('http')) {
      return `/img/car_images/${imagePath}`;
    }
    return imagePath;
  };

  if (loading) {
    return (
      <div className="car-detail-page loading">
        <div className="loading-spinner"></div>
        <p>Loading car details...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="car-detail-page error">
        <h2>Error</h2>
        <p>{error || 'Car not found'}</p>
        <Link to="/inventory" className="button button--primary">
          Back to Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="car-detail-page">
      <div className="car-detail-page__header">
        <h1 className="car-detail-page__title">
          {car.model_year} {car.make} {car.model}
        </h1>
        <div className="car-detail-page__price-container">
          <span className="car-detail-page__price">{formatPrice(car.price)}</span>
        </div>
      </div>

      <div className="car-detail-page__content">
        <div className="car-detail-page__image-container">
          <img 
            src={getImageUrl(car.image_name)} 
            alt={`${car.model_year} ${car.make} ${car.model}`}
            className="car-detail-page__image"
            onError={(e) => {
              e.currentTarget.src = "/img/placeholder-car.jpg";
            }}
          />
        </div>

        <div className="car-detail-page__info">
          <div className="car-detail-page__specs">
            <div className="car-detail-page__spec-item">
              <span className="car-detail-page__spec-label">Year:</span>
              <span className="car-detail-page__spec-value">{car.model_year}</span>
            </div>
            <div className="car-detail-page__spec-item">
              <span className="car-detail-page__spec-label">Make:</span>
              <span className="car-detail-page__spec-value">{car.make}</span>
            </div>
            <div className="car-detail-page__spec-item">
              <span className="car-detail-page__spec-label">Model:</span>
              <span className="car-detail-page__spec-value">{car.model}</span>
            </div>
            <div className="car-detail-page__spec-item">
              <span className="car-detail-page__spec-label">Mileage:</span>
              <span className="car-detail-page__spec-value">{formatMileage(car.mileage)} miles</span>
            </div>
            <div className="car-detail-page__spec-item">
              <span className="car-detail-page__spec-label">Color:</span>
              <span className="car-detail-page__spec-value">{car.color || 'N/A'}</span>
            </div>
            <div className="car-detail-page__spec-item">
              <span className="car-detail-page__spec-label">Transmission:</span>
              <span className="car-detail-page__spec-value">{car.car_transmission || 'N/A'}</span>
            </div>
            <div className="car-detail-page__spec-item">
              <span className="car-detail-page__spec-label">Body Type:</span>
              <span className="car-detail-page__spec-value">{car.car_type || 'N/A'}</span>
            </div>
            <div className="car-detail-page__spec-item">
              <span className="car-detail-page__spec-label">Condition:</span>
              <span className="car-detail-page__spec-value">{car.car_condition || 'N/A'}</span>
            </div>
          </div>

          {car.body_text && (
            <div className="car-detail-page__description">
              <h3>Description</h3>
              <p>{car.body_text}</p>
            </div>
          )}

          <div className="car-detail-page__actions">
            <Link to="/contact" className="button button--primary">
              Contact Us About This Vehicle
            </Link>
            <Link to="/financing" className="button button--secondary">
              Apply for Financing
            </Link>
            <Link to="/inventory" className="button button--tertiary">
              Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
