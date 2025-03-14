import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Car } from '../../../types';
import '../../../styles/components/SearchBar.scss';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAdvancedSearchClick: () => void;
}

// List of common stop words to exclude from search suggestions
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 
  'were', 'will', 'with', 'ft', '1/2', '1/4', '3/4'
]);

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onAdvancedSearchClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');

  // Extract individual words from a string and filter out stop words
  const extractSearchTerms = (text: string): string[] => {
    if (!text) return [];
    
    // Split by spaces and special characters
    return text
      .split(/[\s\-\/]+/) // Split by spaces, hyphens, and slashes
      .map(word => word.replace(/[^\w]/g, '').trim()) // Remove non-word characters
      .filter(word => 
        word && 
        word.length > 1 && 
        !STOP_WORDS.has(word.toLowerCase())
      );
  };

  // Fetch car data for suggestions
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cars');
        const cars = await response.json() as Car[];
        
        // Extract unique makes, models, colors, and titles
        const makes = Array.from(new Set(cars.map((car: Car) => car.make)));
        const models = Array.from(new Set(cars.map((car: Car) => car.model)));
        const colors = Array.from(new Set(cars.map((car: Car) => car.color)));
        const titles = Array.from(new Set(cars.map((car: Car) => car.title)));
        
        // Extract individual words from makes and models
        const makeWords = makes.flatMap(make => extractSearchTerms(make));
        const modelWords = models.flatMap(model => extractSearchTerms(model));
        
        // Combine all possible search terms and filter out undefined/null values
        const allTerms: string[] = [
          ...makes, 
          ...models, 
          ...colors, 
          ...titles,
          ...makeWords,
          ...modelWords
        ].filter(Boolean) as string[];
        
        // Remove duplicates and sort
        const uniqueTerms = Array.from(new Set(allTerms)).sort();
        
        setOptions(uniqueTerms);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = selected.length > 0 ? selected[0] : searchQuery;
    console.log('Search submitted with query:', query);
    onSearch(query);
  };

  // Filter options based on input text
  const getFilteredOptions = () => {
    if (!inputText || inputText.length === 0) {
      return []; // Return empty array when no input
    }
    return options.filter(option => 
      option.toLowerCase().includes(inputText.toLowerCase())
    );
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-bar__input-container">
          <Typeahead
            id="search-typeahead"
            onChange={(selected) => {
              setSelected(selected as string[]);
              if (selected.length > 0) {
                setSearchQuery(selected[0] as string);
                setInputText(selected[0] as string);
              } else {
                setSearchQuery('');
              }
            }}
            options={getFilteredOptions()}
            placeholder="Search vehicles..."
            selected={selected}
            isLoading={isLoading}
            className="search-bar__typeahead"
            onInputChange={(event) => {
              // Check if event is a string or an event object
              const text = typeof event === 'string' ? event : event.target.value;
              setInputText(text);
              setSearchQuery(text);
            }}
            minLength={1} // Only show suggestions after at least 1 character
          />
        </div>
        <button type="submit" className="search-bar__button">
          <img src="img/gg_search.svg" alt="Search" title="Search" />
        </button>
      </form>
      <button 
        className="search-bar__advanced"
        onClick={onAdvancedSearchClick}
      >
        Advanced Search
      </button>
    </div>
  );
};

export default SearchBar;
