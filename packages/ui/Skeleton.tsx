import React from 'react';
import { DESIGN_TOKENS } from './tokens';

export const Skeleton = ({ width, height, borderRadius = DESIGN_TOKENS.radius.md }: { 
  width?: string | number; 
  height?: string | number; 
  borderRadius?: number 
}) => {
  return (
    <div
      style={{
        width: width || '100%',
        height: height || '20px',
        backgroundColor: '#e0e0e0',
        borderRadius,
        animation: 'shimmer 1.5s infinite linear',
        backgroundImage: 'linear-gradient(90deg, #e0e0e0 0px, #f0f0f0 40px, #e0e0e0 80px)',
        backgroundSize: '200% 100%',
      }}
    />
  );
};

// Add shimmer keyframes to a global style or use a CSS-in-JS solution
