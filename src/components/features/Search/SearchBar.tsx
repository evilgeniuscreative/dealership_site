import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/components/SearchBar.scss';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAdvancedSearchClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onAdvancedSearchClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  console.log('SearchBar rendering with props:', { onSearch, onAdvancedSearchClick });
  console.log('FontAwesomeIcon:', FontAwesomeIcon);
  console.log('faSearch icon:', faSearch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted with query:', searchQuery);
    onSearch(searchQuery);
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-bar__input"
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-bar__button">
          {/* Temporarily replace FontAwesomeIcon with text to see if this is causing the issue */}
          Search
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
