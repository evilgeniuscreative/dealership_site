import React, { useState } from 'react';
import { Car } from '../../../types';
import CarCard from '../Cars/CarCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../../../styles/components/FeaturedCarCarousel.scss';

interface FeaturedCarCarouselProps {
  cars: Car[];
  itemsPerSlide?: number;
}

const FeaturedCarCarousel: React.FC<FeaturedCarCarouselProps> = ({ 
  cars, 
  itemsPerSlide = 3
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate the total number of slides needed
  const totalSlides = Math.ceil(cars.length / itemsPerSlide);
  
  // If no cars or only one slide, don't show navigation
  if (cars.length === 0) return null;
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Get current slide's cars
  const getCurrentCars = () => {
    const startIndex = currentIndex * itemsPerSlide;
    return cars.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <div className="featured-car-carousel">
      {/* Large side navigation arrows */}
      {totalSlides > 1 && (
        <>
          <button 
            className="featured-car-carousel__side-nav featured-car-carousel__side-nav--prev"
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <FaChevronLeft />
          </button>
          
          <button 
            className="featured-car-carousel__side-nav featured-car-carousel__side-nav--next"
            onClick={handleNext}
            aria-label="Next slide"
          >
            <FaChevronRight />
          </button>
        </>
      )}

      <div className="featured-car-carousel__container">
        <div className="featured-car-carousel__slide">
          {getCurrentCars().map((car) => (
            <div key={car.id} className="featured-car-carousel__item">
              <CarCard car={car} />
            </div>
          ))}
        </div>
      </div>
      
      {totalSlides > 1 && (
        <div className="featured-car-carousel__controls">
          <div className="featured-car-carousel__indicators">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`featured-car-carousel__indicator ${
                  index === currentIndex ? 'featured-car-carousel__indicator--active' : ''
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedCarCarousel;
