import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import '../../../styles/components/ContactForm.scss';

const ContactForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // EmailJS configuration
  const SERVICE_ID = 'service_dealership'; // Replace with your actual service ID
  const TEMPLATE_ID = 'template_contact'; // Replace with your actual template ID
  const PUBLIC_KEY = 'your_public_key'; // Replace with your actual public key

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    setStatus('sending');
    setErrorMessage('');

    try {
      await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        formRef.current,
        PUBLIC_KEY
      );

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      console.error('Failed to send email:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} ref={formRef}>
      <div className="contact-form__field">
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter your name"
        />
      </div>

      <div className="contact-form__field">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="contact-form__field">
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
        />
      </div>

      <div className="contact-form__field">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Enter your message"
          rows={5}
        />
      </div>

      <button 
        type="submit" 
        className="contact-form__submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>

      {status === 'success' && (
        <p className="contact-form__message contact-form__message--success">
          Your message has been sent successfully!
        </p>
      )}

      {status === 'error' && (
        <p className="contact-form__message contact-form__message--error">
          Failed to send message: {errorMessage || 'Please try again later.'}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
