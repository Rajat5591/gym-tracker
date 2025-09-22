export const lightTheme = {
  colors: {
    // Primary colors
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    
    // Secondary colors
    secondary: '#64748b',
    secondaryHover: '#475569',
    secondaryLight: '#f1f5f9',
    
    // Background colors
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceHover: '#f1f5f9',
    
    // Text colors
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    
    // Status colors
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    
    // Chart colors
    chart: {
      primary: '#2563eb',
      secondary: '#10b981',
      tertiary: '#f59e0b',
      quaternary: '#8b5cf6',
      grid: '#f1f5f9'
    }
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    // Primary colors
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryLight: '#1e3a8a',
    
    // Secondary colors
    secondary: '#94a3b8',
    secondaryHover: '#cbd5e1',
    secondaryLight: '#334155',
    
    // Background colors
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    
    // Text colors
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#334155',
    borderHover: '#475569',
    
    // Status colors
    success: '#22c55e',
    successLight: '#15803d',
    warning: '#fbbf24',
    warningLight: '#d97706',
    error: '#f87171',
    errorLight: '#dc2626',
    
    // Chart colors
    chart: {
      primary: '#3b82f6',
      secondary: '#22c55e',
      tertiary: '#fbbf24',
      quaternary: '#a855f7',
      grid: '#334155'
    }
  }
};
