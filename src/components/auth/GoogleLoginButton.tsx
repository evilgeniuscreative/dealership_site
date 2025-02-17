import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import '../../styles/components/auth/GoogleLoginButton.scss';

interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button
      className="google-login-button"
      onClick={onClick}
      disabled={isLoading}
      type="button"
    >
      {isLoading ? (
        <div className="loading-spinner" />
      ) : (
        <>
          <FcGoogle className="google-icon" />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;
