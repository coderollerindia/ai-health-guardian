import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Alert, CircularProgress } from '@mui/material';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import GoogleIcon from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) throw authError;
      // Supabase performs a full redirect to Google; nothing else to do here.
    } catch (err) {
      setError(err?.message || 'Something went wrong while signing in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        backgroundImage: (theme) =>
          theme.palette.mode === 'dark' ? theme.custom.gradients.heroDark : theme.custom.gradients.primarySoft,
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <GlassCard sx={{ p: { xs: 4, sm: 5 }, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 2.5,
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: (theme) => theme.custom.gradients.primary,
                color: '#fff',
              }}
            >
              <HealthAndSafetyRoundedIcon fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              {t('app.name', 'AI Health Guardian')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {t('auth.loginSubtitle')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            <GradientButton
              fullWidth
              size="large"
              onClick={handleGoogleLogin}
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={18} sx={{ color: '#fff' }} />
                ) : (
                  <GoogleIcon />
                )
              }
            >
              {submitting ? t('auth.signingIn') : t('auth.continueWithGoogle')}
            </GradientButton>

            <Typography
              variant="body2"
              onClick={() => navigate('/')}
              sx={{
                mt: 3,
                cursor: 'pointer',
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': { color: 'primary.main' },
              }}
            >
              ← {t('auth.backToHome')}
            </Typography>
          </GlassCard>
        </motion.div>
      </Container>
    </Box>
  );
}
