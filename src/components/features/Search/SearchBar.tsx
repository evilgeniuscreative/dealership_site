import React, { useState } from 'react';
import '../../../styles/components/SearchBar.scss';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAdvancedSearchClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onAdvancedSearchClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

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
