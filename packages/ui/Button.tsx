import React from 'react';
import { DESIGN_TOKENS } from './tokens';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  style?: React.CSSProperties;
}

export const Button = ({ label, onClick, variant = 'primary', isLoading = false, style: passedStyle }: ButtonProps) => {
  const bgColor = DESIGN_TOKENS.colors[variant] || DESIGN_TOKENS.colors.primary;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      style={{
        padding: `${DESIGN_TOKENS.spacing.sm}px ${DESIGN_TOKENS.spacing.md}px`,
        backgroundColor: bgColor,
        color: 'white',
        border: 'none',
        borderRadius: `${DESIGN_TOKENS.radius.md}px`,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: `all ${DESIGN_TOKENS.motion.micro}ms ease-in-out`,
        opacity: isLoading ? 0.7 : 1,
        fontFamily: DESIGN_TOKENS.typography.fontFamily,
        fontWeight: 'bold',
        ...passedStyle,
      }}
    >
      {isLoading ? 'Loading...' : label}
    </button>
  );
};
