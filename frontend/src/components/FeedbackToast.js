import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  background: ${({ type, theme }) => {
    switch(type) {
      case 'good': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.primary;
    }
  }};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${slideIn} 0.3s ease-out;
  z-index: 1000;
  max-width: 300px;
`;

const FeedbackToast = ({ message, type = 'info', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <ToastContainer type={type}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        {type === 'good' && '✅ Great Form!'}
        {type === 'warning' && '⚠️ Form Check'}
        {type === 'error' && '❌ Form Alert'}
        {type === 'info' && 'ℹ️ AI Coach'}
      </div>
      <div style={{ fontSize: '0.875rem' }}>
        {message}
      </div>
    </ToastContainer>
  );
};

export default FeedbackToast;
