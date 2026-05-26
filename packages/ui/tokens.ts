export const DESIGN_TOKENS = {
  colors: {
    primary: '#f04e31', // Appetite red/orange
    secondary: '#1a1a1a', // Premium dark
    neutral: '#f5f5f5',
    success: '#4caf50',
    danger: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    // Dark mode variants
    dark: {
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      secondaryText: '#b0b0b0',
      border: '#333333',
    },
    light: {
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#1a1a1a',
      secondaryText: '#666666',
      border: '#dddddd',
    }
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
    fontFamily: 'Inter, sans-serif',
    headingXL: { fontSize: 32, fontWeight: 'bold' },
    headingL: { fontSize: 24, fontWeight: 'bold' },
    headingM: { fontSize: 18, fontWeight: 'bold' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 14, fontWeight: 'normal' },
    smallLabel: { fontSize: 12, fontWeight: '500' },
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  motion: {
    micro: 200,
    standard: 350,
    page: 500,
  },
};
