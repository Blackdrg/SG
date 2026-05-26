import React from 'react';
import { DESIGN_TOKENS } from './tokens';

interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = ({ label, type = 'text', placeholder, value, error, onChange }: InputProps) => {
  return (
    <div style={{ marginBottom: `${DESIGN_TOKENS.spacing.md}px`, fontFamily: DESIGN_TOKENS.typography.fontFamily }}>
      <label style={{ 
        display: 'block', 
        marginBottom: `${DESIGN_TOKENS.spacing.xs}px`, 
        ...DESIGN_TOKENS.typography.smallLabel,
        color: DESIGN_TOKENS.colors.secondary
      }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: `${DESIGN_TOKENS.spacing.sm}px`,
          borderRadius: `${DESIGN_TOKENS.radius.md}px`,
          border: `1px solid ${error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.neutral}`,
          boxSizing: 'border-box',
          ...DESIGN_TOKENS.typography.body,
          transition: `border-color ${DESIGN_TOKENS.motion.micro}ms ease-in-out`,
        }}
      />
      {error && (
        <span style={{ 
          ...DESIGN_TOKENS.typography.caption, 
          color: DESIGN_TOKENS.colors.danger,
          marginTop: `${DESIGN_TOKENS.spacing.xs}px`,
          display: 'block'
        }}>
          {error}
        </span>
      )}
    </div>
  );
};
