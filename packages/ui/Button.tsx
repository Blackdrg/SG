import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'loading';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export const Button = ({ 
  label, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  isLoading = false, 
  disabled = false,
  style,
  ariaLabel,
}: ButtonProps) => {
  const getBgColor = () => {
    switch (variant) {
      case 'primary': return DESIGN_TOKENS.colors.primary;
      case 'secondary': return DESIGN_TOKENS.colors.surface;
      case 'ghost': return 'transparent';
      case 'destructive': return DESIGN_TOKENS.colors.danger;
      case 'loading': return DESIGN_TOKENS.colors.textSecondary;
      default: return DESIGN_TOKENS.colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'destructive' || variant === 'loading') {
      return DESIGN_TOKENS.colors.textInverse;
    }
    return DESIGN_TOKENS.colors.textPrimary;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { padding: '6px 12px', fontSize: 14 };
      case 'lg': return { padding: '16px 24px', fontSize: 18 };
      default: return { padding: '10px 20px', fontSize: 16 };
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel || label}
      aria-disabled={isDisabled}
      style={{
        backgroundColor: getBgColor(),
        color: getTextColor(),
        border: variant === 'ghost' ? `1px solid ${DESIGN_TOKENS.colors.border}` : 'none',
        borderRadius: `${DESIGN_TOKENS.radius.button}px`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: `all ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
        opacity: isDisabled ? 0.6 : 1,
        fontFamily: DESIGN_TOKENS.typography.fontFamily,
        fontWeight: 600,
        fontSize: getSizeStyles().fontSize,
        padding: getSizeStyles().padding,
        boxShadow: variant === 'primary' ? DESIGN_TOKENS.shadows.small : 'none',
        ...style,
      }}
    >
      {isLoading ? 'Loading...' : label}
    </button>
  );
};