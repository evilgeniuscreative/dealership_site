import React from 'react';
import { PageHero } from '../../types';
import '../../styles/components/Hero.scss';

interface HeroProps extends PageHero {
  isHomePage?: boolean;
}

const Hero: React.FC<HeroProps> = ({ 
  title, 
  subtitle, 
  imageUrl, 
  height, 
  isHomePage = false 
}) => {
  return (
    <div 
      className={`hero ${isHomePage ? 'hero--home' : ''}`}
      style={{ 
        backgroundImage: `url(${imageUrl})`,
        height: `${height}px`
      }}
    >
      <div className="hero__content">
        {title && <h1 className="hero__title">{title}</h1>}
        {subtitle && <p className="hero__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Hero;
