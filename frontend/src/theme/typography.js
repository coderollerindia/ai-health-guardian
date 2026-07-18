const fontFamily = [
  '"Plus Jakarta Sans"',
  '"Inter"',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

const typography = {
  fontFamily,
  h1: { fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08 },
  h2: { fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.14 },
  h3: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.18 },
  h4: { fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.22 },
  h5: { fontWeight: 700, lineHeight: 1.3 },
  h6: { fontWeight: 700, lineHeight: 1.35 },
  subtitle1: { fontWeight: 600 },
  subtitle2: { fontWeight: 600 },
  body1: { lineHeight: 1.65 },
  body2: { lineHeight: 1.6 },
  button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
  overline: { fontWeight: 700, letterSpacing: '0.12em' },
};

export default typography;
