import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CarouselManager from '../components/admin/CarouselManager';
import InventoryManager from '../components/admin/InventoryManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { validateUsername, validatePassword } from '../utils/validation';
import '../styles/pages/AdminPage.scss';

interface LocationState {
  from: {
    pathname: string;
  };
}

interface FormErrors {
  username?: string;
  password?: string;
}

const AdminPage: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const validateForm = (checkTouched: boolean = true) => {
    const errors: FormErrors = {};
    const usernameError = validateUsername(username, checkTouched && touchedFields.has('username'));
    const passwordError = validatePassword(password, checkTouched && touchedFields.has('password'));

    if (usernameError) errors.username = usernameError;
    if (passwordError) errors.password = passwordError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
    validateForm(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm(false)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          throw new Error('Too many failed attempts. Please try again later.');
        }
        throw new Error(data.error || 'Invalid credentials');
      }

      const { token, refreshToken } = await response.json();
      login(token, refreshToken); 
      localStorage.setItem('refreshToken', refreshToken);

      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/admin/inventory';
      navigate(from, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      }).finally(() => {
        localStorage.removeItem('refreshToken');
        logout();
      });
    } else {
      logout();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-page__login">
          <h2>Admin Login</h2>
          {error && <div className="admin-page__error">{error}</div>}
          <form onSubmit={handleLogin} noValidate>
            <div className="admin-page__field">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (touchedFields.has('username')) {
                    validateForm();
                  }
                }}
                onBlur={() => handleBlur('username')}
                className={formErrors.username && touchedFields.has('username') ? 'error' : ''}
                required
              />
              {formErrors.username && touchedFields.has('username') && (
                <div className="admin-page__field-error">{formErrors.username}</div>
              )}
            </div>
            <div className="admin-page__field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touchedFields.has('password')) {
                    validateForm();
                  }
                }}
                onBlur={() => handleBlur('password')}
                className={formErrors.password && touchedFields.has('password') ? 'error' : ''}
                required
              />
              {formErrors.password && touchedFields.has('password') && (
                <div className="admin-page__field-error">{formErrors.password}</div>
              )}
            </div>
            <button
              type="submit"
              className="admin-page__submit"
              disabled={loading || Object.keys(formErrors).length > 0}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <button
            onClick={() => navigate('/admin/inventory')}
            className="admin-page__nav-button"
          >
            Manage Inventory
          </button>
          <button
            onClick={() => navigate('/admin/carousel')}
            className="admin-page__nav-button"
          >
            Manage Carousel
          </button>
          <button
            onClick={handleLogout}
            className="admin-page__nav-button admin-page__nav-button--logout"
          >
            Logout
          </button>
        </nav>
      </div>
      <div className="admin-page__content">
        <Routes>
          <Route path="inventory" element={<InventoryManager />} />
          <Route path="carousel" element={<CarouselManager />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPage;
