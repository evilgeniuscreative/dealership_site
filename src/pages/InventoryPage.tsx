import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchCars(1);
  }, [activeFilters]);

  const fetchCars = async (pageNumber: number) => {
    try {
      // TODO: Replace with actual API call
      const queryParams = new URLSearchParams({
        page: pageNumber.toString(),
        ...activeFilters
      });
      
      const response = await fetch(`/api/cars?${queryParams}`);
      const data = await response.json();
      
      if (pageNumber === 1) {
        setCars(data.cars);
      } else {
        setCars(prev => [...prev, ...data.cars]);
      }
      
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const handleSearch = (query: string) => {
    setActiveFilters(prev => ({ ...prev, query }));
    setPage(1);
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setActiveFilters(filters);
    setPage(1);
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
        imageUrl="/images/inventory-hero.jpg"
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
          {cars.map(car => (
            <CarCard 
              key={car.id} 
              car={car} 
              isFullWidth 
            />
          ))}
          
          {hasMore && (
            <button 
              className="inventory-page__load-more"
              onClick={loadMoreCars}
            >
              Load More
            </button>
          )}

          {cars.length === 0 && (
            <div className="inventory-page__no-results">
              <p>No vehicles found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
