import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';

const MotionBox = motion.create(Box);

function FeatureCard({ icon, title, desc, index }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      sx={{ height: '100%' }}
    >
      <GlassCard
        sx={{
          height: '100%',
          p: 3.5,
          transition: 'transform .3s ease, box-shadow .3s ease',
          '&:hover': { transform: 'translateY(-6px)' },
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            backgroundImage: (theme) => theme.custom.gradients.accent,
            color: '#fff',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {desc}
        </Typography>
      </GlassCard>
    </MotionBox>
  );
}

function StepCard({ number, icon, title, desc, index }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
      sx={{ height: '100%', position: 'relative' }}
    >
      <GlassCard sx={{ height: '100%', p: 4, textAlign: 'center' }}>
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.18em' }}
        >
          Step {number}
        </Typography>
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            my: 2,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: (theme) => theme.custom.gradients.primarySoft,
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {desc}
        </Typography>
      </GlassCard>
    </MotionBox>
  );
}

function SecurityCard({ icon, title, desc, index }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      sx={{ height: '100%' }}
    >
      <GlassCard sx={{ height: '100%', p: 3.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            flexShrink: 0,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'success.main',
            color: '#fff',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {desc}
          </Typography>
        </Box>
      </GlassCard>
    </MotionBox>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  const features = [
    { icon: <DocumentScannerRoundedIcon />, key: 'prescription' },
    { icon: <ReceiptLongRoundedIcon />, key: 'bill' },
    { icon: <ForumRoundedIcon />, key: 'chat' },
    { icon: <AlarmRoundedIcon />, key: 'reminders' },
    { icon: <LocalHospitalRoundedIcon />, key: 'emergency' },
    { icon: <FavoriteRoundedIcon />, key: 'healthScore' },
    { icon: <InsightsRoundedIcon />, key: 'insights' },
  ];

  const steps = [
    { icon: <UploadFileRoundedIcon fontSize="large" />, titleKey: 'step1Title', descKey: 'step1Desc' },
    { icon: <AutoAwesomeRoundedIcon fontSize="large" />, titleKey: 'step2Title', descKey: 'step2Desc' },
    { icon: <TaskAltRoundedIcon fontSize="large" />, titleKey: 'step3Title', descKey: 'step3Desc' },
  ];

  const securityItems = [
    { icon: <VerifiedUserRoundedIcon />, key: 'auth' },
    { icon: <LockPersonRoundedIcon />, key: 'storage' },
    { icon: <SmartToyRoundedIcon />, key: 'ai' },
  ];

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: theme.palette.mode === 'dark' ? theme.custom.gradients.heroDark : theme.custom.gradients.hero,
          color: '#fff',
          pt: { xs: 10, md: 14 },
          pb: { xs: 12, md: 16 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 40%), radial-gradient(circle at 85% 0%, rgba(124,77,255,0.28), transparent 45%)',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Chip
              icon={<ShieldRoundedIcon sx={{ color: 'inherit !important' }} />}
              label={t('landing.trustBadge')}
              sx={{
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.14)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.28)',
                backdropFilter: 'blur(6px)',
              }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
                mb: 3,
                backgroundImage: 'linear-gradient(90deg, #FFFFFF 0%, #B7F5EA 55%, #D7C6FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('landing.headline')}
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 400, opacity: 0.88, maxWidth: 640, mx: 'auto', mb: 5 }}
            >
              {t('landing.subheadline')}
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: 'easeOut' }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: "center" }}>
              <GradientButton size="large" onClick={() => navigate('/login')}>
                {t('landing.cta')}
              </GradientButton>
              <GradientButton
                size="large"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{
                  backgroundImage: 'none',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', boxShadow: 'none', transform: 'translateY(-2px)' },
                }}
              >
                {t('landing.secondaryCta')}
              </GradientButton>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" id="features" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            {t('landing.features.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
            {t('landing.features.subtitle')}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.key}>
              <FeatureCard
                icon={f.icon}
                title={t(`landing.features.${f.key}.title`)}
                desc={t(`landing.features.${f.key}.desc`)}
                index={i}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works */}
      <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'action.hover' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              {t('landing.how.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
              {t('landing.how.subtitle')}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {steps.map((s, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={s.titleKey}>
                <StepCard
                  number={i + 1}
                  icon={s.icon}
                  title={t(`landing.how.${s.titleKey}`)}
                  desc={t(`landing.how.${s.descKey}`)}
                  index={i}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Security */}
      <Container maxWidth="lg" id="security" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            {t('landing.security.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
            {t('landing.security.subtitle')}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {securityItems.map((s, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={s.key}>
              <SecurityCard
                icon={s.icon}
                title={t(`landing.security.${s.key}.title`)}
                desc={t(`landing.security.${s.key}.desc`)}
                index={i}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Closing band */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          backgroundImage: theme.palette.mode === 'dark' ? theme.custom.gradients.heroDark : theme.custom.gradients.hero,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {t('landing.footer.tagline')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 4 }}>
            {t('landing.footer.disclaimer')}
          </Typography>
          <GradientButton size="large" onClick={() => navigate('/login')}>
            {t('landing.cta')}
          </GradientButton>
        </Container>
      </Box>
    </Box>
  );
}
