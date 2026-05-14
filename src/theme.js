export const t = {
  // Colori
  bg: '#f6f1e8',
  bgSoft: '#fbf8f3',
  accent: '#6f8f72',
  accentMid: '#89a98c',
  accentLight: '#edf3ec',
  text: '#1f1f1c',
  textSoft: '#5f5a52',
  muted: '#8b857d',
  border: '#ece6dc',
  card: '#fffdf9',
  danger: '#c94b4b',
  dangerLight: '#f9ebeb',
  gold: '#b78b2e',

  // Typography
  fontSans: "'Inter', 'Segoe UI', sans-serif",
  fontSerif: "'Cormorant Garamond', serif",

  // Radius
  radius: '8px',
  radiusSm: '6px',
  radiusLg: '12px',
  radiusPill: '999px',

  // Shadows
  shadow: '0 2px 10px rgba(0,0,0,0.03)',
  shadowMd: '0 6px 24px rgba(0,0,0,0.04)',

  // Spacing
  gap: '1.2rem',
  gapSm: '0.6rem',
  gapLg: '2rem',
};

export const btn = {
  primary: {
    background: '#6f8f72',
    color: '#ffffff',
    border: 'none',
    borderRadius: '999px',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    fontSize: '0.92rem',
    fontWeight: '600',
    letterSpacing: '0.01em',
    transition: 'all 0.2s ease',
  },

  secondary: {
    background: 'transparent',
    color: '#6f8f72',
    border: '1px solid #d8d2c8',
    borderRadius: '999px',
    padding: '0.7rem 1.4rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },

  ghost: {
    background: 'transparent',
    color: '#8b857d',
    border: '1px solid transparent',
    borderRadius: '999px',
    padding: '0.7rem 1.4rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },

  danger: {
    background: 'transparent',
    color: '#c94b4b',
    border: '1px solid #c94b4b',
    borderRadius: '6px',
    padding: '0.35rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};

export const input = {
  border: '1px solid transparent',
  borderRadius: '8px',
  padding: '0.85rem 1rem',
  width: '100%',
  fontSize: '0.96rem',
  background: '#f3eee5',
  color: '#1f1f1c',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'all 0.2s ease',
};

export const badge = (color = '#edf3ec', text = '#6f8f72') => ({
  background: color,
  color: text,
  borderRadius: '999px',
  padding: '0.2rem 0.7rem',
  fontSize: '0.72rem',
  fontWeight: '600',
  display: 'inline-block',
  letterSpacing: '0.02em',
});

export const card = {
  background: '#fffdf9',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
  padding: '1.8rem',
  border: '1px solid #f0ebe3',
};