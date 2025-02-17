import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import '../styles/pages/ForgotPasswordPage.scss';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to send recovery email');
      }

      setSuccess(true);
    } catch (err) {
      setError(
        'There was a problem sending the recovery email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="recovery-container">
          <div className="success-message">
            <FiMail className="icon" />
            <h1>Check Your Email</h1>
            <p>
              If an account exists for {email}, you will receive a password reset
              link shortly.
            </p>
            <p className="note">
              Don't see the email? Check your spam folder or{' '}
              <button
                className="text-button"
                onClick={() => setSuccess(false)}
                disabled={isLoading}
              >
                try again
              </button>
              .
            </p>
            <Link to="/login" className="back-link">
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="recovery-container">
        <h1>Reset Your Password</h1>
        <p className="description">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
