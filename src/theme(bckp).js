export const t = {
  // Colori
  bg:          '#ffffff',
  bgSoft:      '#f7f8f6',
  accent:      '#2d6a4f',
  accentMid:   '#52b788',
  accentLight: '#d8f3dc',
  text:        '#1a1a1a',
  textSoft:    '#555555',
  muted:       '#999999',
  border:      '#e8ebe8',
  card:        '#ffffff',
  danger:      '#d62828',
  dangerLight: '#fde8e8',
  gold:        '#d4a017',

  // Tipografia
  fontSans: "'Inter', 'Segoe UI', sans-serif",
  fontSerif: "'Georgia', serif",

  // Radii
  radius:   '12px',
  radiusSm: '8px',
  radiusLg: '20px',
  radiusPill: '100px',

  // Ombre
  shadow:   '0 2px 12px rgba(0,0,0,0.07)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.10)',

  // Spaziatura
  gap: '1rem',
  gapSm: '0.5rem',
  gapLg: '1.5rem',
};

export const btn = {
  primary: {
    background: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '100px',
    padding: '0.6rem 1.4rem',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '600',
    letterSpacing: '0.01em',
  },
  secondary: {
    background: 'transparent',
    color: '#2d6a4f',
    border: '1.5px solid #2d6a4f',
    borderRadius: '100px',
    padding: '0.55rem 1.4rem',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '600',
  },
  ghost: {
    background: 'transparent',
    color: '#999',
    border: '1.5px solid #e8ebe8',
    borderRadius: '100px',
    padding: '0.55rem 1.4rem',
    cursor: 'pointer',
    fontSize: '0.88rem',
  },
  danger: {
    background: 'transparent',
    color: '#d62828',
    border: '1.5px solid #d62828',
    borderRadius: '8px',
    padding: '0.3rem 0.7rem',
    cursor: 'pointer',
    fontSize: '0.78rem',
  },
};

export const input = {
  border: '1.5px solid #e8ebe8',
  borderRadius: '10px',
  padding: '0.65rem 0.9rem',
  width: '100%',
  fontSize: '0.92rem',
  background: '#f7f8f6',
  color: '#1a1a1a',
  boxSizing: 'border-box',
  outline: 'none',
};

export const badge = (color = '#d8f3dc', text = '#2d6a4f') => ({
  background: color,
  color: text,
  borderRadius: '100px',
  padding: '0.15rem 0.65rem',
  fontSize: '0.72rem',
  fontWeight: '600',
  display: 'inline-block',
  letterSpacing: '0.02em',
});

export const card = {
  background: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  padding: '1.4rem',
  border: 'none',
};