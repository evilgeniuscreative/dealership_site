import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import '../styles/pages/ResetPasswordPage.scss';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isTokenChecking, setIsTokenChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          setIsValidToken(true);
        } else {
          setError('This password reset link has expired or is invalid.');
        }
      } catch (err) {
        setError('Failed to validate reset token.');
      } finally {
        setIsTokenChecking(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: formData.password
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      // Redirect to login with success message
      navigate('/login', {
        state: { message: 'Password reset successful. Please log in.' }
      });
    } catch (err) {
      setError(
        'There was a problem resetting your password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenChecking) {
    return (
      <div className="reset-password-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="reset-password-page">
        <div className="reset-container">
          <div className="error-state">
            <FiLock className="icon" />
            <h1>Invalid Reset Link</h1>
            <p>{error}</p>
            <Link to="/forgot-password" className="primary-button">
              Request New Reset Link
            </Link>
            <Link to="/login" className="back-link">
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-container">
        <h1>Reset Your Password</h1>
        <p className="description">
          Please enter your new password below.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <div className="password-requirements">
            <p>Password must:</p>
            <ul>
              <li className={formData.password.length >= 8 ? 'valid' : ''}>
                Be at least 8 characters long
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                Include at least one uppercase letter
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                Include at least one lowercase letter
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                Include at least one number
              </li>
              <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'valid' : ''}>
                Include at least one special character
              </li>
            </ul>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
