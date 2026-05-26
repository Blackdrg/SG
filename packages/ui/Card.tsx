import React from 'react';
import { DESIGN_TOKENS } from './tokens';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  isElevated?: boolean;
  style?: React.CSSProperties;
}

export const Card = ({ children, title, isElevated = false, style: passedStyle }: CardProps) => {
  return (
    <div style={{
      border: isElevated ? 'none' : `1px solid ${DESIGN_TOKENS.colors.neutral}`,
      borderRadius: `${DESIGN_TOKENS.radius.lg}px`,
      padding: `${DESIGN_TOKENS.spacing.md}px`,
      margin: `${DESIGN_TOKENS.spacing.md}px 0`,
      boxShadow: isElevated ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
      backgroundColor: 'white',
      transition: `all ${DESIGN_TOKENS.motion.standard}ms ease-in-out`,
      fontFamily: DESIGN_TOKENS.typography.fontFamily,
      ...passedStyle,
    }}>
      {title && (
        <h3 style={{ 
          marginTop: 0, 
          ...DESIGN_TOKENS.typography.headingM,
          color: DESIGN_TOKENS.colors.secondary 
        }}>
          {title}
        </h3>
      )}
      <div style={{ ...DESIGN_TOKENS.typography.body }}>
        {children}
      </div>
    </div>
  );
};
