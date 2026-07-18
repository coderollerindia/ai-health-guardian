import { useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext';
import { AuthProvider } from './context/AuthContext';
import { getTheme } from './theme/theme';
import i18n from './i18n/i18n';
import AppRoutes from './routes/AppRoutes';

function ThemedShell() {
  const { resolvedMode } = useThemeMode();
  const theme = useMemo(() => getTheme(resolvedMode), [resolvedMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <ThemedShell />
    </ThemeModeProvider>
  );
}
