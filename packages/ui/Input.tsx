import React, { forwardRef } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = 'text', placeholder, value, error, helperText, onChange, id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <div style={{ 
        marginBottom: `${DESIGN_TOKENS.spacing.lg}px`, 
        fontFamily: DESIGN_TOKENS.typography.fontFamily 
      }}>
        <label htmlFor={inputId} style={{ 
          display: 'block', 
          marginBottom: `${DESIGN_TOKENS.spacing.xs}px`, 
          ...DESIGN_TOKENS.typography.smallLabel,
          color: error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.textPrimary
        }}>
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          style={{
            width: '100%',
            padding: `${DESIGN_TOKENS.spacing.md}px`,
            borderRadius: `${DESIGN_TOKENS.radius.input}px`,
            border: `1px solid ${error ? DESIGN_TOKENS.colors.danger : DESIGN_TOKENS.colors.border}`,
            backgroundColor: DESIGN_TOKENS.colors.surface,
            boxSizing: 'border-box',
            ...DESIGN_TOKENS.typography.body,
            transition: `border-color ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}, box-shadow ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 3px ${DESIGN_TOKENS.colors.primary}33`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />
        {error && (
          <span 
            id={`${inputId}-error`}
            role="alert"
            style={{ 
              ...DESIGN_TOKENS.typography.smallLabel,
              color: DESIGN_TOKENS.colors.danger,
              marginTop: `${DESIGN_TOKENS.spacing.xs}px`,
              display: 'block'
            }}
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span 
            id={`${inputId}-helper`}
            style={{ 
              ...DESIGN_TOKENS.typography.caption,
              color: DESIGN_TOKENS.colors.textSecondary,
              marginTop: `${DESIGN_TOKENS.spacing.xs}px`,
              display: 'block'
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';