import React, { useState, useEffect } from 'react';
import { CarouselImage } from '../../../types';
import '../../../styles/components/HomeCarousel.scss';

interface HomeCarouselProps {
  images: CarouselImage[];
  defaultDelay?: number;
}

const HomeCarousel: React.FC<HomeCarouselProps> = ({ 
  images, 
  defaultDelay = 7000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const delay = images[currentIndex].delay || defaultDelay;
    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, images, defaultDelay]);

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  if (!images.length) return null;

  return (
    <div className="home-carousel">
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`home-carousel__slide ${
            index === currentIndex ? 'home-carousel__slide--active' : ''
          } ${isTransitioning ? 'home-carousel__slide--transitioning' : ''}`}
          style={{ backgroundImage: `url(${image.imageUrl})` }}
          onTransitionEnd={handleTransitionEnd}
        >
          <div className="home-carousel__content">
            {image.title && (
              <h2 className="home-carousel__title">{image.title}</h2>
            )}
            {image.subtitle && (
              <p className="home-carousel__subtitle">{image.subtitle}</p>
            )}
          </div>
        </div>
      ))}
      
      {images.length > 1 && (
        <div className="home-carousel__dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`home-carousel__dot ${
                index === currentIndex ? 'home-carousel__dot--active' : ''
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeCarousel;
