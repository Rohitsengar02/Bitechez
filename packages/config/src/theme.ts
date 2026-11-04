export const BITECHEZ_THEME = {
  colors: {
    primary: '#800D32',       // Deep maroon
    primaryDark: '#600821',   // Dark maroon
    primaryLight: '#A31542',  // Accent maroon
    white: '#FFFFFF',
    background: '#FAF8F9',    // Soft warm background
    surface: '#FFFFFF',
    accentPink: '#F9E8ED',    // Light pink tint
    text: '#191923',          // Deep charcoal text
    textMuted: '#6B7280',     // Secondary text
    border: '#E5E7EB',
    borderPink: '#F3D2DC',
    success: '#239B56',
    warning: '#E9A23B',
    error: '#DC4545',
    info: '#2563EB',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
} as const;
