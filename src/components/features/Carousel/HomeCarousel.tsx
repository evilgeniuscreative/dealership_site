import React, { useState, useEffect } from 'react';
import { CarouselImage } from '../../../types';
import '../../../styles/components/HomeCarousel.scss';

interface HomeCarouselProps {
  images: CarouselImage[];
  default_delay?: number;
}

const HomeCarousel: React.FC<HomeCarouselProps> = ({ 
  images, 
  default_delay = 7000 
}) => {
  console.log('HomeCarousel rendering with images:', images);
  console.log('HomeCarousel props:', { images, default_delay });
  
  const [current_index, setCurrentIndex] = useState(0);
  const [is_transitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    console.log('HomeCarousel useEffect running, images length:', images.length);
    console.log('HomeCarousel useEffect current_index:', current_index);
    if (images.length <= 1) return;

    const delay = images[current_index]?.delay || default_delay;
    console.log('Setting timeout with delay:', delay);
    
    const timer = setTimeout(() => {
      console.log('Timeout triggered, setting is_transitioning to true');
      setIsTransitioning(true);
      console.log('Updating current_index:', current_index);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, delay);

    return () => {
      console.log('Clearing timeout');
      clearTimeout(timer);
    };
  }, [current_index, images, default_delay]);

  const handle_dot_click = (index: number) => {
    console.log('Dot clicked for index:', index);
    console.log('Setting is_transitioning to true');
    setIsTransitioning(true);
    console.log('Updating current_index:', index);
    setCurrentIndex(index);
  };

  const handle_transition_end = () => {
    console.log('Transition ended');
    console.log('Setting is_transitioning to false');
    setIsTransitioning(false);
  };

  // Get image URL with REACT_APP_BASE_URL if it's a relative path
  const getImageUrl = (imagePath: string) => {
    console.log('Getting image URL for path:', imagePath);
    
    if (!imagePath) {
      // Use a fallback image if no image path is provided
      const baseUrl = process.env.REACT_APP_BASE_URL || '';
      console.log('No image path provided, using fallback with baseUrl:', baseUrl);
      return `${baseUrl}/img/placeholder.jpg`;
    }
    
    if (!imagePath.startsWith('http')) {
      // If it's a relative path, prepend REACT_APP_BASE_URL
      const baseUrl = process.env.REACT_APP_BASE_URL || '';
      console.log('Using baseUrl:', baseUrl);
      
      // Get just the file extension from the image path
      const fileExtension = imagePath.split('.').pop() || 'jpg';
      console.log('File extension:', fileExtension);
      
      // If the imagePath is a number, use that number to find a matching image
      if (/^\d+$/.test(imagePath)) {
        // Handle case where REACT_APP_BASE_URL is just '/' or ends with '/'
        if (baseUrl.endsWith('/')) {
          return `${baseUrl}img/car_images/${imagePath}.${fileExtension}`;
        }
        return `${baseUrl}/img/car_images/${imagePath}.${fileExtension}`;
      }
      
      // Handle case where REACT_APP_BASE_URL is just '/' or ends with '/'
      if (baseUrl.endsWith('/')) {
        return `${baseUrl}img/car_images/${imagePath}`;
      }
      return `${baseUrl}/img/car_images/${imagePath}`;
    }
    return imagePath;
  };

  if (!images.length) {
    console.log('HomeCarousel: No images to display');
    return null;
  }

  console.log('HomeCarousel rendering with current_index:', current_index);
  
  return (
    <div className="home-carousel">
      {images.map((image, index) => {
        console.log('Rendering carousel image:', image.id || index);
        return (
          <div
            key={image.id || index}
            className={`home-carousel__slide ${
              index === current_index ? 'home-carousel__slide--active' : ''
            } ${is_transitioning ? 'home-carousel__slide--transitioning' : ''}`}
            style={{ backgroundImage: `url(${getImageUrl(image.image_name)})` }}
            onTransitionEnd={handle_transition_end}
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
        );
      })}
      
      {images.length > 1 && (
        <div className="home-carousel__dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`home-carousel__dot ${
                index === current_index ? 'home-carousel__dot--active' : ''
              }`}
              onClick={() => handle_dot_click(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeCarousel;
