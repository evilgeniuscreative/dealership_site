import React, { useState } from 'react';
import { SearchFilters } from '../../../types';
import '../../../styles/components/AdvancedSearch.scss';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClose: () => void;
  isOpen: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClose,
  isOpen
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    make: '',
    model: '',
    minPrice: undefined,
    maxPrice: undefined,
    maxMileage: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : 
        ['minPrice', 'maxPrice', 'maxMileage'].includes(name) ? 
        Number(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="advanced-search">
      <div className="advanced-search__content">
        <button 
          className="advanced-search__close"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="advanced-search__title">Advanced Search</h2>
        <form onSubmit={handleSubmit} className="advanced-search__form">
          <div className="advanced-search__field">
            <label htmlFor="make">Make</label>
            <input
              type="text"
              id="make"
              name="make"
              value={filters.make || ''}
              onChange={handleChange}
              placeholder="Enter make..."
            />
          </div>
          
          <div className="advanced-search__field">
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={filters.model || ''}
              onChange={handleChange}
              placeholder="Enter model..."
            />
          </div>
          
          <div className="advanced-search__field-group">
            <div className="advanced-search__field">
              <label htmlFor="minPrice">Min Price</label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={filters.minPrice || ''}
                onChange={handleChange}
                placeholder="$"
                min="0"
              />
            </div>
            
            <div className="advanced-search__field">
              <label htmlFor="maxPrice">Max Price</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice || ''}
                onChange={handleChange}
                placeholder="$"
                min="0"
              />
            </div>
          </div>
          
          <div className="advanced-search__field">
            <label htmlFor="maxMileage">Max Mileage</label>
            <input
              type="number"
              id="maxMileage"
              name="maxMileage"
              value={filters.maxMileage || ''}
              onChange={handleChange}
              placeholder="Enter maximum mileage..."
              min="0"
            />
          </div>
          
          <button type="submit" className="advanced-search__submit">
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearch;
