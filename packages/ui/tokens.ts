import React from 'react';

export const DESIGN_TOKENS = {
  colors: {
    primary: '#FF5A1F',
    secondary: '#111827',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    elevated: '#F5F5F5',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textInverse: '#FFFFFF',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    premium: '#D4AF37',
    border: '#E5E7EB',
    dangerDark: '#c62828',
    neutral: '#9CA3AF',
  },
  icon: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-text-primary)',
    muted: 'var(--color-text-secondary)',
    danger: 'var(--color-danger)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    headingXL: { fontSize: 48, fontWeight: 700, lineHeight: 1.2 },
    headingL: { fontSize: 36, fontWeight: 600, lineHeight: 1.3 },
    headingM: { fontSize: 28, fontWeight: 600, lineHeight: 1.4 },
    headingS: { fontSize: 24, fontWeight: 600, lineHeight: 1.4 },
    body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
    bodyMedium: { fontSize: 16, fontWeight: 500, lineHeight: 1.5 },
    caption: { fontSize: 14, fontWeight: 400, lineHeight: 1.4 },
    captionM: { fontSize: 14, fontWeight: 500, lineHeight: 1.4 },
    smallLabel: { fontSize: 12, fontWeight: 500, lineHeight: 1.3 },
  },
  radius: {
    sm: 4,
    md: 8,
    button: 12,
    input: 14,
    card: 24,
    container: 28,
    full: 9999,
  },
  motion: {
    micro: 150,
    standard: 300,
    page: 450,
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.08)',
    medium: '0 4px 12px rgba(0,0,0,0.12)',
    large: '0 8px 24px rgba(0,0,0,0.16)',
    premiumFloat: '0 8px 24px rgba(255,90,31,0.25)',
  },
};

export const MOTION_EASING = {
  easeOutSoft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  springSmooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const DARK_MODE_TOKENS = {
  colors: {
    primary: '#FF5A1F',
    secondary: '#F9FAFB',
    background: '#121212',
    surface: '#1E1E1E',
    elevated: '#252525',
    textPrimary: '#F9FAFB',
    textSecondary: '#B0B0B0',
    textInverse: '#121212',
    border: '#333333',
  },
};

export const ReducedMotionContext = React.createContext({
  prefersReduced: false,
});

export const useReducedMotion = () => React.useContext(ReducedMotionContext);