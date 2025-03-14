import React from 'react';
import Hero from '../components/common/Hero';
import ContactForm from '../components/features/Contact/ContactForm';
import '../styles/pages/ContactPage.scss';

const ContactPage: React.FC = () => {
  return (
    <div className="contact-page">
      <Hero
        title="Contact Us"
        subtitle="We're here to help"
        image_url="/images/contact-hero.jpg"
        height={160}
      />

      <div className="contact-page__content">
        <div className="contact-page__info">
          <div className="contact-page__section">
            <h2>Get in Touch</h2>
            <p>
              Have questions about our vehicles or services? We're here to help!
              Fill out the form below or reach out to us directly.
            </p>
          </div>

          <div className="contact-page__details">
            <div className="contact-page__detail">
              <div className="contact-page__icon">📞</div>
              <div>
                <h3>Phone</h3>
                <p>(555) 123-4567</p>
              </div>
            </div>

            <div className="contact-page__detail">
              <div className="contact-page__icon">✉️</div>
              <div>
                <h3>Email</h3>
                <p>info@dealership.com</p>
              </div>
            </div>

            <div className="contact-page__detail">
              <div className="contact-page__icon">📍</div>
              <div>
                <h3>Location</h3>
                <p>123 Car Street</p>
                <p>Automotive City, AC 12345</p>
              </div>
            </div>
          </div>

          <div className="contact-page__hours">
            <h3>Business Hours</h3>
            <ul>
              <li><span>Monday - Friday:</span> 9:00 AM - 8:00 PM</li>
              <li><span>Saturday:</span> 9:00 AM - 6:00 PM</li>
              <li><span>Sunday:</span> 10:00 AM - 4:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="contact-page__form">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
