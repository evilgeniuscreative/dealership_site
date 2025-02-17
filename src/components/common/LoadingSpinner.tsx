import React from 'react';
import '../../styles/components/common/LoadingSpinner.scss';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  overlay = false 
}) => {
  return (
    <div className={`loading-spinner__container ${overlay ? 'loading-spinner__overlay' : ''}`}>
      <div className={`loading-spinner loading-spinner--${size}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
