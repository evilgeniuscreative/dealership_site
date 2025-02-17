import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/AuthCallbackPage.scss';

const AuthCallbackPage: React.FC = () => {
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  return (
    <div className="auth-callback-page">
      <div className="callback-container">
        <div className="loading-spinner"></div>
        <h2>Completing login...</h2>
        <p>Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
