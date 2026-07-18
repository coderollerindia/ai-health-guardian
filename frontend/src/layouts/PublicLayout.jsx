import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Stack, Container, Divider, Link as MuiLink } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import GradientButton from '../components/GradientButton';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitch from '../components/LanguageSwitch';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#security', label: 'Security' },
];

export default function PublicLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(7,14,23,0.7)' : 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(16px)',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                backgroundImage: theme.custom.gradients.primary,
                flexShrink: 0,
              }}
            />
            <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1 }}>
              {t('app.name', 'AI Health Guardian')}
            </Typography>
            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {NAV_LINKS.map((link) => (
                <MuiLink
                  key={link.href}
                  href={link.href}
                  underline="none"
                  sx={{ color: 'text.primary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
            <LanguageSwitch />
            <ThemeToggle />
            <GradientButton size="medium" onClick={() => navigate('/login')}>
              {t('nav.login')}
            </GradientButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ py: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} {t('app.name', 'AI Health Guardian')} — {t('landing.footer.rights')}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
