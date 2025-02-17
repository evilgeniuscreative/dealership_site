import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navigation from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FinancingPage from './pages/FinancingPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import './styles/App.scss';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navigation />
            <main className="app__content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/financing" element={<FinancingPage />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
