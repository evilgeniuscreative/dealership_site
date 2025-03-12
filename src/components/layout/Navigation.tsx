import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/components/Navigation.scss';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="navigation__container">
        <Link to="/" className="navigation__logo">
          <img src="img/chapmanmotorsports__logo.png" className="navigation__logo-img" alt="Chapman Motorsports Logo" />
        </Link>
        <div className="navigation__links">
          <Link 
            to="/" 
            className={`navigation__link ${isActive('/') ? 'navigation__link--active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/inventory" 
            className={`navigation__link ${isActive('/inventory') ? 'navigation__link--active' : ''}`}
          >
            Inventory
          </Link>
          <Link 
            to="/financing" 
            className={`navigation__link ${isActive('/financing') ? 'navigation__link--active' : ''}`}
          >
            Financing
          </Link>
          <Link 
            to="/about" 
            className={`navigation__link ${isActive('/about') ? 'navigation__link--active' : ''}`}
          >
            About Us
          </Link>
          <Link 
            to="/contact" 
            className={`navigation__link ${isActive('/contact') ? 'navigation__link--active' : ''}`}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
