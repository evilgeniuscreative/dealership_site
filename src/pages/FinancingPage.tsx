import React, { useEffect } from 'react';
import Hero from '../components/common/Hero';
import '../styles/pages/FinancingPage.scss';
interface FinancingPageProps {
  monthlyPmt: number;
  vehiclePrice: number;
  downPayment: number;
  term: number;
  apr: number;
}

const FinancingPage: React.FC = () => {
  const calculatePayment = () => {
    const vehiclePriceInput = document.getElementById('vehiclePrice') as HTMLInputElement;
    const downPaymentInput = document.getElementById('downPayment') as HTMLInputElement;
    const termSelect = document.getElementById('term') as HTMLSelectElement;
    const aprInput = document.getElementById('apr') as HTMLInputElement;
    
    // Convert inputs to numbers
    const vehiclePrice = parseFloat(vehiclePriceInput.value);
    const downPayment = parseFloat(downPaymentInput.value);
    const term = parseInt(termSelect.value);
    const apr = parseFloat(aprInput.value) / 100 / 12; // Convert annual rate to monthly decimal
    
    // Calculate number of payments
    const numPayments = term;
    
    // Calculate monthly payment using the correct formula
    const monthlyPmt = (vehiclePrice - downPayment) * (apr * Math.pow(1 + apr, numPayments)) / (Math.pow(1 + apr, numPayments) - 1);
    
    // Display the result
    const resultElement = document.querySelector('.calculator__payment');
    if (resultElement) {
      if (isNaN(monthlyPmt)) {
        resultElement.textContent = "Error: Please check your numbers.";
      } else {
        resultElement.textContent = `$${monthlyPmt.toFixed(2)}`;
      }
    }
  }

  // Use useEffect to add event listeners after component mounts
  useEffect(() => {
    // Get the form element after the component is mounted
    const formElement = document.getElementById('calcForm');
    
    // Only add the event listener if the element exists
    if (formElement) {
      formElement.addEventListener('change', () => {
        calculatePayment();
      });
    }
    
    // Cleanup function to remove event listener when component unmounts
    return () => {
      if (formElement) {
        formElement.removeEventListener('change', () => {
          calculatePayment();
        });
      }
    };
  }, []); // Empty dependency array means this runs once after initial render

  return (
    <div className="financing-page">
      <Hero
        title="Financing Options"
        subtitle="Find the right payment plan for you"
        image_url="/images/financing-hero.jpg"
        height={160}
      />

      <div className="financing-page__content">
        <div className="financing-page__section">
          <h2>Flexible Financing Solutions</h2>
          <p>
            We offer competitive financing options to help you drive home in your 
            dream car today. Our partnerships with multiple lenders allow us to 
            provide flexible terms and competitive rates for all credit situations.
          </p>
        </div>

        <div className="financing-page__options">
          <div className="financing-page__option">
            <h3>Traditional Financing</h3>
            <ul>
              <li>Competitive interest rates</li>
              <li>Flexible terms from 24-84 months</li>
              <li>Simple application process</li>
              <li>Quick approval decisions</li>
            </ul>
          </div>

          <div className="financing-page__option">
            <h3>Lease Options</h3>
            <ul>
              <li>Lower monthly payments</li>
              <li>New car every few years</li>
              <li>Warranty coverage</li>
              <li>Multiple end-of-lease options</li>
            </ul>
          </div>

          <div className="financing-page__option">
            <h3>Special Programs</h3>
            <ul>
              <li>First-time buyer programs</li>
              <li>College graduate discounts</li>
              <li>Military discounts</li>
              <li>Seasonal promotions</li>
            </ul>
          </div>
        </div>

        <div className="financing-page__calculator">
          <h2>Payment Calculator</h2>
          <div className="financing-page__calculator-form">
            <div id="calcForm" className="calcForm">
            <div className="calculator__field">
              <label htmlFor="vehiclePrice">Vehicle Price</label>
              <input 
                type="number" 
                id="vehiclePrice" 
                placeholder="Enter vehicle price"
              />
            </div>

            <div className="calculator__field">
              <label htmlFor="downPayment">Down Payment</label>
              <input 
                type="number" 
                id="downPayment" 
                placeholder="Enter down payment"
              />
            </div>

            <div className="calculator__field">
              <label htmlFor="term">Term (months)</label>
              <select id="term">
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="48">48 months</option>
                <option value="60">60 months</option>
                <option value="72">72 months</option>
                <option value="84">84 months</option>
              </select>
            </div>

            <div className="calculator__field">
              <label htmlFor="apr">APR (%)</label>
              <input 
                type="number" 
                id="apr" 
                placeholder="Enter APR"
                step="0.1"
              />
            </div>

            <button className="calculator__submit" onClick={calculatePayment}>
              Calculate Payment
            </button>

            <div className="calculator__result">
              <h3>Estimated Monthly Payment:</h3>
              <p className="calculator__payment">$0.00</p>
            </div>
            </div>
          </div>
        </div>

        <div className="financing-page__apply">
          <h2>Ready to Apply?</h2>
          <p>
            Start your financing application today and get one step closer to 
            driving your new vehicle home.
          </p>
          <button className="financing-page__apply-button">
            Apply for Financing
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancingPage;
