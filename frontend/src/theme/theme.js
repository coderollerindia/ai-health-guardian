import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { getPalette } from './palette';
import typography from './typography';

export function getTheme(mode) {
  const resolvedMode = mode === 'dark' ? 'dark' : 'light';
  const palette = getPalette(resolvedMode);
  const { glass, gradients } = palette.custom;

  let theme = createTheme({
    palette,
    typography,
    shape: { borderRadius: 18 },
    custom: { gradients, glass },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage:
              resolvedMode === 'dark'
                ? 'radial-gradient(circle at 10% 0%, rgba(45,212,191,0.10), transparent 45%), radial-gradient(circle at 90% 10%, rgba(167,139,250,0.10), transparent 40%)'
                : 'radial-gradient(circle at 10% 0%, rgba(14,124,134,0.08), transparent 45%), radial-gradient(circle at 90% 10%, rgba(124,77,255,0.07), transparent 40%)',
            backgroundAttachment: 'fixed',
            scrollbarWidth: 'thin',
          },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: resolvedMode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(11,31,42,0.18)',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none', borderRadius: 18 },
          rounded: { borderRadius: 18 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: glass.background,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: glass.border,
            boxShadow: glass.shadow,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingInline: 20,
            paddingBlock: 10,
            fontWeight: 700,
            transition: 'transform .2s ease, box-shadow .2s ease',
          },
          containedPrimary: {
            backgroundImage: gradients.primary,
            boxShadow: '0 10px 24px rgba(14,124,134,0.28)',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 30px rgba(14,124,134,0.38)' },
          },
          outlined: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 600 } } },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none' } } },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
}

export default getTheme;
