import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { SearchFilters, Car } from '../../../types';
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
  console.log('AdvancedSearch rendering with props:', { isOpen });
  
  const [filters, setFilters] = useState<SearchFilters>({
    make: '',
    model: '',
    minPrice: undefined,
    maxPrice: undefined,
    maxMileage: undefined,
    color: '',
    isAWD: false,
    minYear: undefined,
    maxYear: undefined
  });
  
  // State for typeahead
  const [makeOptions, setMakeOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [makeInputText, setMakeInputText] = useState('');
  const [modelInputText, setModelInputText] = useState('');
  const [colorInputText, setColorInputText] = useState('');

  // Debug the filters state
  useEffect(() => {
    console.log('AdvancedSearch filters state:', filters);
  }, [filters]);
  
  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setFilters({
        make: '',
        model: '',
        minPrice: undefined,
        maxPrice: undefined,
        maxMileage: undefined,
        color: '',
        isAWD: false,
        minYear: undefined,
        maxYear: undefined
      });
      setSelectedMake([]);
      setSelectedModel([]);
      setSelectedColor([]);
    }
  }, [isOpen]);
  
  // Fetch makes, models, and colors for typeahead
  useEffect(() => {
    const fetchCarData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cars');
        const cars = await response.json() as Car[];
        
        // Extract unique makes
        const uniqueMakes = Array.from(new Set(cars.map((car: Car) => car.make)))
          .filter(Boolean)
          .sort() as string[];
        setMakeOptions(uniqueMakes);
        
        // Extract unique colors
        const uniqueColors = Array.from(new Set(cars.map((car: Car) => car.color)))
          .filter(Boolean)
          .sort() as string[];
        setColorOptions(uniqueColors);
        
        // Extract unique models if make is selected
        if (filters.make) {
          const filteredModels = Array.from(
            new Set(
              cars
                .filter((car: Car) => 
                  car.make.toLowerCase().includes(filters.make?.toLowerCase() || '')
                )
                .map((car: Car) => car.model)
            )
          ).filter(Boolean).sort() as string[];
          setModelOptions(filteredModels);
        } else {
          // If no make is selected, show all models
          const allModels = Array.from(new Set(cars.map((car: Car) => car.model)))
            .filter(Boolean)
            .sort() as string[];
          setModelOptions(allModels);
        }
      } catch (error) {
        console.error('Error fetching car data for typeahead:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCarData();
  }, [filters.make, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AdvancedSearch submitting filters:', filters);
    
    // Filter out empty string values and undefined values
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value === '' || value === undefined) {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {} as SearchFilters);
    
    console.log('Cleaned filters for submission:', cleanedFilters);
    onSearch(cleanedFilters);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    console.log('AdvancedSearch handleChange:', { name, value, type });
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFilters(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
      return;
    }
    
    setFilters(prev => {
      const newValue = value === '' ? undefined : 
        ['minPrice', 'maxPrice', 'maxMileage', 'minYear', 'maxYear'].includes(name) ? 
        Number(value) : value;
      
      console.log('Setting new value for', name, ':', newValue);
      
      return {
        ...prev,
        [name]: newValue
      };
    });
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
          {/* Make with typeahead */}
          <div className="advanced-search__field">
            <label htmlFor="make-typeahead">Make</label>
            <Typeahead
              id="make-typeahead"
              onChange={(selected) => {
                setSelectedMake(selected as string[]);
                if (selected.length > 0) {
                  setFilters(prev => ({
                    ...prev,
                    make: selected[0] as string
                  }));
                  setMakeInputText(selected[0] as string);
                } else {
                  setFilters(prev => ({
                    ...prev,
                    make: ''
                  }));
                }
              }}
              options={makeInputText.length > 0 ? makeOptions.filter(option => option.toLowerCase().includes(makeInputText.toLowerCase())) : []}
              placeholder="Enter make..."
              selected={selectedMake}
              onInputChange={(event) => {
                const text = typeof event === 'string' ? event : event.target.value;
                setMakeInputText(text);
                if (!text) {
                  setFilters(prev => ({
                    ...prev,
                    make: ''
                  }));
                }
              }}
              isLoading={isLoading}
              className="advanced-search__typeahead"
              minLength={1}
            />
          </div>
          
          {/* Model with typeahead */}
          <div className="advanced-search__field">
            <label htmlFor="model-typeahead">Model</label>
            <Typeahead
              id="model-typeahead"
              onChange={(selected) => {
                setSelectedModel(selected as string[]);
                if (selected.length > 0) {
                  setFilters(prev => ({
                    ...prev,
                    model: selected[0] as string
                  }));
                  setModelInputText(selected[0] as string);
                } else {
                  setFilters(prev => ({
                    ...prev,
                    model: ''
                  }));
                }
              }}
              options={modelInputText.length > 0 ? modelOptions.filter(option => option.toLowerCase().includes(modelInputText.toLowerCase())) : []}
              placeholder="Enter model..."
              selected={selectedModel}
              onInputChange={(event) => {
                const text = typeof event === 'string' ? event : event.target.value;
                setModelInputText(text);
                if (!text) {
                  setFilters(prev => ({
                    ...prev,
                    model: ''
                  }));
                }
              }}
              isLoading={isLoading}
              className="advanced-search__typeahead"
              minLength={1}
            />
          </div>
          
          {/* Price Range */}
          <div className="advanced-search__field-group">
            <div className="advanced-search__field">
              <label htmlFor="minPrice">Min Price ($)</label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={filters.minPrice || ''}
                onChange={handleChange}
                min="0"
                step="1000"
                placeholder="Min Price"
              />
            </div>
            <div className="advanced-search__field">
              <label htmlFor="maxPrice">Max Price ($)</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice || ''}
                onChange={handleChange}
                min="0"
                step="1000"
                placeholder="Max Price"
              />
            </div>
          </div>
          
          {/* Year Range */}
          <div className="advanced-search__field-group">
            <div className="advanced-search__field">
              <label htmlFor="minYear">Min Year</label>
              <input
                type="number"
                id="minYear"
                name="minYear"
                value={filters.minYear || ''}
                onChange={handleChange}
                min="1900"
                max="2030"
                step="1"
                placeholder="Min Year"
              />
            </div>
            <div className="advanced-search__field">
              <label htmlFor="maxYear">Max Year</label>
              <input
                type="number"
                id="maxYear"
                name="maxYear"
                value={filters.maxYear || ''}
                onChange={handleChange}
                min="1900"
                max="2030"
                step="1"
                placeholder="Max Year"
              />
            </div>
          </div>
          
          {/* Mileage */}
          <div className="advanced-search__field">
            <label htmlFor="maxMileage">Max Mileage</label>
            <input
              type="number"
              id="maxMileage"
              name="maxMileage"
              value={filters.maxMileage || ''}
              onChange={handleChange}
              min="0"
              step="1000"
              placeholder="Max Mileage"
            />
          </div>
          
          {/* Color */}
          <div className="advanced-search__field">
            <label htmlFor="color-typeahead">Color</label>
            <Typeahead
              id="color-typeahead"
              onChange={(selected) => {
                setSelectedColor(selected as string[]);
                if (selected.length > 0) {
                  setFilters(prev => ({
                    ...prev,
                    color: selected[0] as string
                  }));
                  setColorInputText(selected[0] as string);
                } else {
                  setFilters(prev => ({
                    ...prev,
                    color: ''
                  }));
                }
              }}
              options={colorInputText.length > 0 ? colorOptions.filter(option => option.toLowerCase().includes(colorInputText.toLowerCase())) : []}
              placeholder="Select color..."
              selected={selectedColor}
              onInputChange={(event) => {
                const text = typeof event === 'string' ? event : event.target.value;
                setColorInputText(text);
                if (!text) {
                  setFilters(prev => ({
                    ...prev,
                    color: ''
                  }));
                }
              }}
              isLoading={isLoading}
              className="advanced-search__typeahead"
              minLength={1}
            />
          </div>
          
          {/* AWD */}
          <div className="advanced-search__field advanced-search__field--checkbox">
            <label htmlFor="isAWD">
              <input
                type="checkbox"
                id="isAWD"
                name="isAWD"
                checked={filters.isAWD || false}
                onChange={handleChange}
              />
              All-Wheel Drive (AWD)
            </label>
          </div>
          
          <div className="advanced-search__actions">
            <button 
              type="button" 
              className="advanced-search__button advanced-search__button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="advanced-search__button advanced-search__button--primary"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearch;
