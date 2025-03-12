import React, { useState, useEffect, useMemo } from 'react';
import Hero from '../components/common/Hero';
import SearchBar from '../components/features/Search/SearchBar';
import AdvancedSearch from '../components/features/Search/AdvancedSearch';
import CarCard from '../components/features/Cars/CarCard';
import { Car, SearchFilters } from '../types';
import '../styles/pages/InventoryPage.scss';

const InventoryPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cars');
        const data = await response.json();
        console.log('Fetched cars data:', data);
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setError('Failed to load inventory. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    setActiveFilters(prev => ({ ...prev, query }));
    setPage(1);
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    console.log('Advanced search filters:', filters);
    setActiveFilters(filters);
    setPage(1);
  };

  const handleAdvancedSearchToggle = () => {
    setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
  };

  const filteredCars = useMemo(() => {
    console.log('Filtering cars with:', { activeFilters });
    return cars.filter(car => {
      // Basic text search
      if (activeFilters.query) {
        const query = activeFilters.query.toLowerCase();
        const matchesQuery = 
          car.make.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.title.toLowerCase().includes(query) ||
          car.body_text.toLowerCase().includes(query);
        
        if (!matchesQuery) return false;
      }
      
      // Advanced filters
      if (activeFilters.make && car.make.toLowerCase() !== activeFilters.make.toLowerCase()) {
        return false;
      }
      
      if (activeFilters.model && car.model.toLowerCase() !== activeFilters.model.toLowerCase()) {
        return false;
      }
      
      if (activeFilters.minPrice && car.price < activeFilters.minPrice) {
        return false;
      }
      
      if (activeFilters.maxPrice && car.price > activeFilters.maxPrice) {
        return false;
      }
      
      if (activeFilters.maxMileage && car.mileage > activeFilters.maxMileage) {
        return false;
      }
      
      return true;
    });
  }, [cars, activeFilters]);

  const fetchCars = async (pageNumber: number) => {
    try {
      // Convert all filter values to strings and remove undefined values
      const filterParams = Object.entries(activeFilters)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value?.toString() || ''
        }), {});

      const queryParams = new URLSearchParams({
        page: pageNumber.toString(),
        ...filterParams
      });
      
      const response = await fetch(`/api/cars?${queryParams}`);
      const data = await response.json();
      
      if (pageNumber === 1) {
        // Check if data is an array (direct list of cars) or an object with cars property
        if (Array.isArray(data)) {
          setCars(data);
        } else if (data.cars && Array.isArray(data.cars)) {
          setCars(data.cars);
        } else {
          console.error('Unexpected data format:', data);
          setCars([]);
        }
      } else {
        if (Array.isArray(data)) {
          setCars(prev => [...prev, ...data]);
        } else if (data.cars && Array.isArray(data.cars)) {
          setCars(prev => [...prev, ...data.cars]);
        } else {
          console.error('Unexpected data format:', data);
        }
      }
      
      // Check if hasMore is directly in the response or needs to be determined
      if (data.hasMore !== undefined) {
        setHasMore(data.hasMore);
      } else if (Array.isArray(data)) {
        // If we got fewer items than expected, assume no more
        setHasMore(data.length === 12); // Assuming 12 is the page limit
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const loadMoreCars = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCars(nextPage);
  };

  return (
    <div className="inventory-page">
      <Hero 
        title="Our Inventory"
        subtitle="Find your perfect vehicle"
        image_url="/images/inventory-hero.jpg"
        height={350}
      />
      
      <div className="inventory-page__content">
        <div className="inventory-page__search-section">
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

        <div className="inventory-page__results">
          {isLoading ? (
            <div className="inventory-page__loading">
              <div className="loading-spinner"></div>
              <p>Loading inventory...</p>
            </div>
          ) : error ? (
            <div className="inventory-page__error">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="inventory-page__no-results">
              <p>No vehicles found matching your criteria.</p>
            </div>
          ) : (
            <div className="inventory-page__grid">
              {/* Using a fragment to avoid rendering the console.log as a React child */}
              {filteredCars.map(car => {
                console.log('Rendering car:', car.id);
                return (
                  <React.Fragment key={car.id}>
                    <div className="inventory-page__grid-item">
                      <CarCard car={car} />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
          
          {hasMore && (
            <button 
              className="inventory-page__load-more"
              onClick={loadMoreCars}
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
