import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CarCard from '../components/features/Cars/CarCard';
import SearchBar from '../components/features/Search/SearchBar';
import AdvancedSearch from '../components/features/Search/AdvancedSearch';
import { Car, SearchFilters } from '../types';
import '../styles/pages/InventoryPage.scss';

const InventoryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 5; // Limit to 5 cars per page
  
  // Extract search parameters from URL
  const getSearchParamsFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const params: SearchFilters = {};
    
    // Extract query parameter for text search
    const query = searchParams.get('query');
    if (query) {
      params.query = query;
    }
    
    // Extract other filter parameters
    if (searchParams.has('make')) params.make = searchParams.get('make') || '';
    if (searchParams.has('model')) params.model = searchParams.get('model') || '';
    
    if (searchParams.has('minPrice')) {
      const minPrice = parseInt(searchParams.get('minPrice') || '0', 10);
      if (!isNaN(minPrice)) {
        params.minPrice = minPrice;
      }
    }
    
    if (searchParams.has('maxPrice')) {
      const maxPrice = parseInt(searchParams.get('maxPrice') || '0', 10);
      if (!isNaN(maxPrice)) {
        params.maxPrice = maxPrice;
      }
    }
    
    if (searchParams.has('minYear')) {
      const minYear = parseInt(searchParams.get('minYear') || '0', 10);
      if (!isNaN(minYear)) {
        params.minYear = minYear;
      }
    }
    
    if (searchParams.has('maxYear')) {
      const maxYear = parseInt(searchParams.get('maxYear') || '0', 10);
      if (!isNaN(maxYear)) {
        params.maxYear = maxYear;
      }
    }
    
    if (searchParams.has('maxMileage')) {
      const maxMileage = parseInt(searchParams.get('maxMileage') || '0', 10);
      if (!isNaN(maxMileage)) {
        params.maxMileage = maxMileage;
      }
    }
    
    if (searchParams.has('color')) params.color = searchParams.get('color') || '';
    
    if (searchParams.has('isAWD')) {
      params.isAWD = searchParams.get('isAWD') === 'true';
    }
    
    console.log('Extracted search params:', params);
    return params;
  };
  
  // Fetch cars from API
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get search parameters from URL
        const searchParams = getSearchParamsFromUrl();
        setCurrentFilters(searchParams);
        
        // Build query string for API request
        const queryParams = new URLSearchParams();
        
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, String(value));
          }
        });
        
        // Make API request with search parameters
        const apiUrl = `/api/cars${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        console.log('Fetching cars from API:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched cars:', data);
        
        setCars(data);
        setFilteredCars(data);
        setCurrentPage(1); // Reset to first page when new search is performed
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Failed to load cars. Please try again later.');
        setCars([]);
        setFilteredCars([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, [location.search]);
  
  // Get current page cars
  const getCurrentPageCars = () => {
    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    return filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of results
    const contentElement = document.querySelector('.inventory-page__content');
    if (contentElement) {
      window.scrollTo({
        top: (contentElement as HTMLElement).offsetTop,
        behavior: 'smooth'
      });
    }
  };
  
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    
    if (query.trim()) {
      navigate(`/inventory?query=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/inventory');
    }
  };
  
  const handleAdvancedSearch = (filters: SearchFilters) => {
    console.log('Advanced search filters:', filters);
    
    // Build query string from filters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    navigate(`/inventory?${params.toString()}`);
    setShowAdvancedSearch(false);
  };
  
  return (
    <div className="inventory-page">
      <div className="inventory-page__header">
        <div className="container">
          <h1 className="inventory-page__title">Our Inventory</h1>
          <div className="inventory-page__search">
            <SearchBar 
              onSearch={handleSearch}
              onAdvancedSearchClick={() => setShowAdvancedSearch(true)}
            />
            
            {showAdvancedSearch && (
              <AdvancedSearch 
                onSearch={handleAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                isOpen={showAdvancedSearch}
              />
            )}
          </div>
          
          {Object.keys(currentFilters).length > 0 && (
            <div className="inventory-page__active-filters">
              <h3>Active Filters:</h3>
              <div className="inventory-page__filter-tags">
                {Object.entries(currentFilters).map(([key, value]) => (
                  <div key={key} className="inventory-page__filter-tag">
                    {key}: {value.toString()}
                    <button 
                      onClick={() => {
                        const newParams = new URLSearchParams(location.search);
                        newParams.delete(key);
                        navigate(`/inventory?${newParams.toString()}`);
                      }}
                      className="inventory-page__filter-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => navigate('/inventory')}
                  className="inventory-page__clear-filters"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="inventory-page__content container">
        {loading ? (
          <div className="inventory-page__loading">Loading cars...</div>
        ) : error ? (
          <div className="inventory-page__error">{error}</div>
        ) : filteredCars.length === 0 ? (
          <div className="inventory-page__no-results">
            <h2>No cars found matching your search criteria.</h2>
            <p>Try adjusting your filters or <button onClick={() => navigate('/inventory')}>view all cars</button>.</p>
          </div>
        ) : (
          <>
            <div className="inventory-page__cars-grid">
              {getCurrentPageCars().map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="inventory-page__pagination">
                {currentPage > 1 && (
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="inventory-page__pagination-button"
                  >
                    Previous
                  </button>
                )}
                
                <div className="inventory-page__pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`inventory-page__pagination-page ${
                        page === currentPage ? 'inventory-page__pagination-page--active' : ''
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                {currentPage < totalPages && (
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="inventory-page__pagination-button"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
