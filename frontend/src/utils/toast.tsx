import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Custom toast component with dismiss button
const CustomToast = ({ 
  t, 
  message, 
  type 
}: { 
  t: any; 
  message: string; 
  type: 'success' | 'error' | 'loading' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsAnimating(true);
    // Wait for slide-out animation before hiding
    setTimeout(() => {
      setIsVisible(false);
      toast.dismiss(t.id);
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6b7280';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '⟳';

  return (
    <div 
      style={{
        background: bgColor,
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        minWidth: '300px',
        transform: isAnimating ? 'translateX(100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isAnimating ? 0 : 1,
        transitionProperty: 'transform, opacity',
        transitionDuration: '0.3s',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span>{message}</span>
      </div>
      <button
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0',
          opacity: '0.7',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '1'}
        onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '0.7'}
      >
        ×
      </button>
    </div>
  );
};

// Custom toast functions
export const customToast = {
  success: (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="success" />);
  },
  error: (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="error" />);
  },
  loading: (message: string) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="loading" />);
  },
};