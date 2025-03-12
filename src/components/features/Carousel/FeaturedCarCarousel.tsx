import React, { useState, useEffect } from 'react';
import { Car } from '../../../types';
import CarCard from '../Cars/CarCard';
import '../../../styles/components/FeaturedCarCarousel.scss';

interface FeaturedCarCarouselProps {
  cars: Car[];
  itemsPerSlide?: number;
}

const FeaturedCarCarousel: React.FC<FeaturedCarCarouselProps> = ({ 
  cars, 
  itemsPerSlide: defaultItemsPerSlide = 3
}) => {
  console.log('FeaturedCarCarousel rendering with cars:', cars);
  console.log('FeaturedCarCarousel cars length:', cars.length);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(defaultItemsPerSlide);

  // Update items per slide based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) { // xl breakpoint
        setItemsPerSlide(6); // 6 cards per row for extra large screens
      } else if (width >= 992) { // lg breakpoint
        setItemsPerSlide(4); // 4 cards per row for large screens
      } else if (width >= 768) { // md breakpoint
        setItemsPerSlide(3); // 3 cards per row for medium screens
      } else if (width >= 576) { // sm breakpoint
        setItemsPerSlide(2); // 2 cards per row for small screens
      } else {
        setItemsPerSlide(1); // 1 card per row for extra small screens
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  


  // Calculate the total number of slides needed
  const totalSlides = Math.ceil(cars.length / itemsPerSlide);
  console.log('FeaturedCarCarousel totalSlides:', totalSlides);
  
  // Log when cars change
  useEffect(() => {
    console.log('FeaturedCarCarousel cars changed:', cars);
  }, [cars]);
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Get current slide's cars
  const getCurrentCars = () => {
    const startIndex = currentIndex * itemsPerSlide;
    const currentCars = cars.slice(startIndex, startIndex + itemsPerSlide);
    console.log('FeaturedCarCarousel getCurrentCars:', currentCars);
    return currentCars;
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
            &lt;
          </button>
          
          <button 
            className="featured-car-carousel__side-nav featured-car-carousel__side-nav--next"
            onClick={handleNext}
            aria-label="Next slide"
          >
            &gt;
          </button>
        </>
      )}
      
      <div className="featured-car-carousel__container">
        <div className="featured-car-carousel__slide" style={{ display: 'flex', gap: '20px' }}>
          {cars.length === 0 ? (
            <div style={{ width: '100%', textAlign: 'center', padding: '2rem' }}>
              <p>No featured cars available at this time.</p>
            </div>
          ) : (
            getCurrentCars().map((car) => {
              console.log('Rendering car in FeaturedCarCarousel:', car.id);
              return (
                <div key={car.id} className="featured-car-carousel__item" style={{ flex: '1', minWidth: '0' }}>
                  <CarCard car={car} />
                </div>
              );
            })
          )}
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
