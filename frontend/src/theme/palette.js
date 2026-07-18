// Deep-blue/teal medical-tech palette with a violet/emerald AI accent.
// Light and dark are tuned independently rather than being naive inverses.

export const gradients = {
  primary: 'linear-gradient(135deg, #0B3D6B 0%, #0E7C86 55%, #12B8A6 100%)',
  primarySoft: 'linear-gradient(135deg, rgba(11,61,107,0.12) 0%, rgba(18,184,166,0.12) 100%)',
  accent: 'linear-gradient(135deg, #7C4DFF 0%, #12B8A6 100%)',
  hero: 'linear-gradient(120deg, #062A4A 0%, #0B4C63 40%, #0E7C86 70%, #12B8A6 100%)',
  heroDark: 'linear-gradient(120deg, #030B14 0%, #05202F 35%, #0A3B45 65%, #0F6E6A 100%)',
  emergency: 'linear-gradient(135deg,#EF4444 0%,#DC2626 100%)',
};

const glassLight = {
  background: 'rgba(255,255,255,0.66)',
  border: '1px solid rgba(255,255,255,0.55)',
  shadow: '0 8px 32px rgba(15,40,80,0.12)',
};

const glassDark = {
  background: 'rgba(19,27,40,0.58)',
  border: '1px solid rgba(255,255,255,0.08)',
  shadow: '0 8px 32px rgba(0,0,0,0.45)',
};

export function getPalette(mode) {
  if (mode === 'dark') {
    return {
      mode: 'dark',
      primary: { main: '#2DD4BF', light: '#5EEAD4', dark: '#0F766E', contrastText: '#04121A' },
      secondary: { main: '#A78BFA', light: '#C4B5FD', dark: '#7C3AED', contrastText: '#0B0714' },
      success: { main: '#34D399' },
      warning: { main: '#FBBF24' },
      error: { main: '#F87171' },
      info: { main: '#38BDF8' },
      background: { default: '#070E17', paper: '#101A26' },
      text: { primary: '#EAF2F5', secondary: 'rgba(234,242,245,0.68)' },
      divider: 'rgba(255,255,255,0.08)',
      custom: { gradients, glass: glassDark },
    };
  }
  return {
    mode: 'light',
    primary: { main: '#0E7C86', light: '#3FA9AE', dark: '#0B3D6B', contrastText: '#FFFFFF' },
    secondary: { main: '#7C4DFF', light: '#9E7BFF', dark: '#5B2FDB', contrastText: '#FFFFFF' },
    success: { main: '#0EA672' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
    info: { main: '#0284C7' },
    background: { default: '#F2F7FA', paper: '#FFFFFF' },
    text: { primary: '#0B1F2A', secondary: 'rgba(11,31,42,0.66)' },
    divider: 'rgba(11,31,42,0.08)',
    custom: { gradients, glass: glassLight },
  };
}
