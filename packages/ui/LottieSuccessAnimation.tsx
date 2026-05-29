import React from 'react';
import { DESIGN_TOKENS } from './tokens';

interface LottieSuccessAnimationProps {
  width?: number | string;
  height?: number | string;
  speed?: number;
  loop?: boolean;
  style?: React.CSSProperties;
}

const LottieSuccessAnimation: React.FC<LottieSuccessAnimationProps> = ({ 
  width = 200, 
  height = 200, 
  speed = 1, 
  loop = false, 
  style 
}) => {
  return (
    <div style={{ 
      width: width as number | string, 
      height: height as number | string, 
      ...style 
    }}>
      <svg 
        viewBox="0 0 100 100" 
        style={{ width: '100%', height: '100%' }}
      >
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill={DESIGN_TOKENS.colors.success} 
          opacity="0.2"
        />
        <path 
          d="M 30 50 L 45 65 L 70 35" 
          stroke={DESIGN_TOKENS.colors.success} 
          strokeWidth="8" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default LottieSuccessAnimation;