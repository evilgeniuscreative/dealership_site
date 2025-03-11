import React from 'react';
import Hero from '../components/common/Hero';
import '../styles/pages/AboutPage.scss';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <Hero
        title="About Us"
        subtitle="Your Trusted Car Dealership"
        image_url="/images/about-hero.jpg"
        height={350}
      />

      <div className="about-page__content">
        <div className="about-page__text">
          <h2>Welcome to Our Dealership</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do 
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim 
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
            aliquip ex ea commodo consequat.
          </p>

          <h3>Our Mission</h3>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse 
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat 
            cupidatat non proident, sunt in culpa qui officia deserunt mollit 
            anim id est laborum.
          </p>

          <h3>Why Choose Us</h3>
          <ul>
            <li>Wide selection of quality vehicles</li>
            <li>Competitive pricing</li>
            <li>Expert service and maintenance</li>
            <li>Transparent buying process</li>
            <li>Dedicated customer support</li>
          </ul>

          <h3>Our History</h3>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem 
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa 
            quae ab illo inventore veritatis et quasi architecto beatae vitae 
            dicta sunt explicabo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
