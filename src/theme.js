// ============================================================
//  ROUND ROBIN — Design System
//  Palette: mint/teal fresca, superfici chiare, mobile-first
//  Heading font: Poppins (geometrico, moderno, accattivante)
//  Body font:    Inter (leggibile, neutro, UI-friendly)
// ============================================================

// ── COLORI ───────────────────────────────────────────────────
export const color = {
  bg:             '#f5faf8',
  bgSoft:         '#edf7f3',
  surface:        '#ffffff',
  surfaceAlt:     '#f9fdfb',

  primary:        '#18b48d',
  primaryHover:   '#12997a',
  primaryDark:    '#0d7a62',
  primarySoft:    '#d4f5ed',

  text:           '#1c2b27',
  textSoft:       '#4d6660',
  muted:          '#8ba59e',

  border:         '#ddeee8',
  borderFocus:    '#18b48d',

  success:        '#22a06b',
  successSoft:    '#d4f7e7',
  warning:        '#f4a827',
  warningSoft:    '#fef3d8',
  danger:         '#e05252',
  dangerSoft:     '#fde8e8',
  gold:           '#e8b84b',
  goldSoft:       '#fef6e0',

  overlay:        'rgba(18, 43, 38, 0.45)',
};

// ── TIPOGRAFIA ───────────────────────────────────────────────
// Poppins per titoli (Bold/ExtraBold) — stesso feel del riferimento
// Inter per body/UI — leggibile e neutro
export const font = {
  heading: "'Poppins', 'Inter', sans-serif",
  body:    "'Inter', 'Segoe UI', sans-serif",
};

// Importa entrambi da Google Fonts — incolla questo nel tuo index.html
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

export const text = {
  xxs:  '0.68rem',   // 11px — micro label
  xs:   '0.76rem',   // 12px — badge, tag
  sm:   '0.88rem',   // 14px — bottoni, nav
  md:   '1rem',      // 16px — body
  lg:   '1.15rem',   // 18px — subheading
  xl:   '1.4rem',    // 22px — section title
  xxl:  '1.75rem',   // 28px — page title
  hero: '2.2rem',    // 35px — hero heading (Poppins Bold)
};

// ── SPAZIATURA (multipli di 4px) ─────────────────────────────
export const space = {
  1:  '0.25rem',
  2:  '0.5rem',
  3:  '0.75rem',
  4:  '1rem',
  5:  '1.25rem',
  6:  '1.5rem',
  8:  '2rem',
  10: '2.5rem',
  12: '3rem',
};

// ── BORDER RADIUS ────────────────────────────────────────────
export const radius = {
  xs:   '8px',
  sm:   '12px',
  md:   '16px',
  lg:   '22px',
  xl:   '28px',
  pill: '999px',
};

// ── OMBRE ────────────────────────────────────────────────────
export const shadow = {
  xs: '0 1px 4px rgba(18, 43, 38, 0.06)',
  sm: '0 4px 16px rgba(18, 43, 38, 0.07)',
  md: '0 8px 28px rgba(18, 43, 38, 0.09)',
  lg: '0 16px 48px rgba(18, 43, 38, 0.11)',
};

// ── LAYOUT ───────────────────────────────────────────────────
export const layout = {
  maxWidth:        '960px',
  pagePaddingMob:  '1rem',
  pagePaddingDesk: '1.5rem',
};

// ── TRANSIZIONI ──────────────────────────────────────────────
export const transition = {
  fast:   '120ms ease',
  normal: '200ms ease',
  slow:   '350ms ease',
};

// ── BOTTONI ──────────────────────────────────────────────────
export const btn = {
  primary: {
    background: color.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: radius.pill,
    padding: `${space[3]} ${space[6]}`,
    cursor: 'pointer',
    fontSize: text.sm,
    fontWeight: '700',
    fontFamily: font.body,
    letterSpacing: '0.01em',
    boxShadow: '0 4px 14px rgba(24, 180, 141, 0.28)',
  },
  secondary: {
    background: color.surface,
    color: color.primaryDark,
    border: `1.5px solid ${color.border}`,
    borderRadius: radius.pill,
    padding: `${space[3]} ${space[6]}`,
    cursor: 'pointer',
    fontSize: text.sm,
    fontWeight: '700',
    fontFamily: font.body,
  },
  ghost: {
    background: 'transparent',
    color: color.textSoft,
    border: `1.5px solid ${color.border}`,
    borderRadius: radius.pill,
    padding: `${space[3]} ${space[5]}`,
    cursor: 'pointer',
    fontSize: text.sm,
    fontWeight: '600',
    fontFamily: font.body,
  },
  danger: {
    background: color.dangerSoft,
    color: color.danger,
    border: 'none',
    borderRadius: radius.pill,
    padding: `${space[2]} ${space[4]}`,
    cursor: 'pointer',
    fontSize: text.xs,
    fontWeight: '700',
    fontFamily: font.body,
  },
  icon: {
    background: color.bgSoft,
    color: color.textSoft,
    border: 'none',
    borderRadius: radius.pill,
    width: '38px',
    height: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: text.md,
    padding: 0,
  },
};

// ── INPUT ────────────────────────────────────────────────────
export const input = {
  border: `1.5px solid ${color.border}`,
  borderRadius: radius.sm,
  padding: `${space[3]} ${space[4]}`,
  width: '100%',
  fontSize: text.md,
  background: color.surface,
  color: color.text,
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: font.body,
};

// ── BADGE ────────────────────────────────────────────────────
export const badge = (
  bg = color.primarySoft,
  fg = color.primaryDark
) => ({
  background:    bg,
  color:         fg,
  borderRadius:  radius.pill,
  padding:       '0.25rem 0.7rem',
  fontSize:      text.xs,
  fontWeight:    '700',
  display:       'inline-block',
  letterSpacing: '0.02em',
  fontFamily:    font.body,
});

// ── CARD ─────────────────────────────────────────────────────
export const card = {
  background:   color.surface,
  borderRadius: radius.md,
  boxShadow:    shadow.sm,
  padding:      space[5],
  border:       `1px solid ${color.border}`,
};

// ── HELPERS TIPOGRAFICI (pronti per inline style) ─────────────
// Usa questi per titoli con Poppins, es: <h1 style={heading.hero}>
export const heading = {
  hero: {
    fontFamily: font.heading,
    fontSize: text.hero,
    fontWeight: '800',
    color: color.text,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  xl: {
    fontFamily: font.heading,
    fontSize: text.xxl,
    fontWeight: '700',
    color: color.text,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  lg: {
    fontFamily: font.heading,
    fontSize: text.xl,
    fontWeight: '700',
    color: color.text,
    lineHeight: 1.3,
  },
  md: {
    fontFamily: font.heading,
    fontSize: text.lg,
    fontWeight: '600',
    color: color.text,
    lineHeight: 1.4,
  },
  section: {
    fontFamily: font.heading,
    fontSize: text.md,
    fontWeight: '600',
    color: color.primary,
    letterSpacing: '0.01em',
  },
};

// ── SHORTHAND retrocompatibile (vecchio import `t`) ───────────
export const t = {
  bg:           color.bg,
  bgSoft:       color.bgSoft,
  card:         color.surface,
  cardAlt:      color.surfaceAlt,
  accent:       color.primary,
  accentMid:    color.primary,
  accentLight:  color.primarySoft,
  accentDark:   color.primaryDark,
  text:         color.text,
  textSoft:     color.textSoft,
  muted:        color.muted,
  border:       color.border,
  danger:       color.danger,
  dangerLight:  color.dangerSoft,
  gold:         color.gold,
  goldLight:    color.goldSoft,
  success:      color.success,
  fontSans:     font.body,
  fontSerif:    font.heading,   // ora punta a Poppins
  radius:       radius.md,
  radiusSm:     radius.sm,
  radiusLg:     radius.lg,
  radiusPill:   radius.pill,
  shadow:       shadow.sm,
  shadowMd:     shadow.md,
  gap:          space[4],
  gapSm:        space[2],
  gapLg:        space[6],
};