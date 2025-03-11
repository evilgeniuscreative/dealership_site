import React, { useState, useEffect } from 'react';
import HomeCarousel from '../components/features/Carousel/HomeCarousel';
import FeaturedCarCarousel from '../components/features/Carousel/FeaturedCarCarousel';
import SearchBar from '../components/features/Search/SearchBar';
import AdvancedSearch from '../components/features/Search/AdvancedSearch';
import CarCard from '../components/features/Cars/CarCard';
import { Car, CarouselImage, SearchFilters } from '../types';
import '../styles/pages/HomePage.scss';

const HomePage: React.FC = () => {
  console.log('HomePage component rendering');
  
  const [cars, setCars] = useState<Car[]>([]);
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    console.log('HomePage useEffect running');
    // Fetch initial cars and carousel images from API
    fetchCars(1);
    fetchFeaturedCars();
    fetchCarouselImages();
  }, []);

  const fetchCars = async (pageNumber: number) => {
    try {
      console.log(`Fetching cars for page ${pageNumber}`);
      const response = await fetch(`/api/cars?page=${pageNumber}`);
      const data = await response.json();
      console.log(`Received ${data.length} cars for page ${pageNumber}`, data);
      
      if (pageNumber === 1) {
        setCars(data);
      } else {
        setCars(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 12); // Assuming 12 is the page limit
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const fetchFeaturedCars = async () => {
    try {
      console.log('Fetching featured cars');
      // Fetch cars marked as featured
      const response = await fetch('/api/cars?featured_car=true');
      const data = await response.json();
      console.log('Received featured cars:', data);
      setFeaturedCars(data);
    } catch (error) {
      console.error('Error fetching featured cars:', error);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      console.log('Fetching carousel images');
      // Fetch carousel images with type 'main'
      const response = await fetch('/api/carousel-images?type=main');
      const data = await response.json();
      console.log('Received carousel images:', data);
      setCarouselImages(data);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Search query:', query);
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    // TODO: Implement advanced search functionality
    console.log('Advanced search filters:', filters);
  };

  const loadMoreCars = () => {
    const nextPage = page + 1;
    console.log(`Loading more cars, page ${nextPage}`);
    setPage(nextPage);
    fetchCars(nextPage);
  };

  console.log('HomePage render - Current state:', { 
    carsCount: cars.length, 
    featuredCarsCount: featuredCars.length,
    carouselImagesCount: carouselImages.length
  });

  // Debug logs before rendering
  console.log('Rendering HomeCarousel with images:', carouselImages);
  console.log('Rendering SearchBar');
  console.log('Rendering AdvancedSearch, isOpen:', isAdvancedSearchOpen);
  console.log('Rendering FeaturedCarCarousel with cars:', featuredCars);
  
  return (
    <div className="home-page">
      <HomeCarousel images={carouselImages} />
      
      <div className="home-page__search-section">
        <SearchBar 
          onSearch={handleSearch}
          onAdvancedSearchClick={() => setIsAdvancedSearchOpen(true)}
        />
        <AdvancedSearch
          isOpen={isAdvancedSearchOpen}
          onClose={() => setIsAdvancedSearchOpen(false)}
          onSearch={handleAdvancedSearch}
        />
      </div>

      <div className="home-page__inventory">
        <h2 className="home-page__section-title">Featured Vehicles</h2>
        
        {/* Replace car grid with featured car carousel */}
        <FeaturedCarCarousel cars={featuredCars} itemsPerSlide={3} />
        
        <h2 className="home-page__section-title mt-5">All Inventory</h2>
        <div className="home-page__car-grid">
          {cars.map(car => {
            console.log('Rendering CarCard for car:', car.id);
            return <CarCard key={car.id} car={car} />;
          })}
        </div>
        {hasMore && (
          <button 
            className="home-page__load-more"
            onClick={loadMoreCars}
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
