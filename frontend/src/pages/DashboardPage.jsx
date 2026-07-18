import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { CardSkeleton } from '../components/LoadingSkeletons';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/dashboardService';

const MotionBox = motion.create(Box);

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

function scoreColor(score) {
  if (score == null) return 'text.disabled';
  if (score >= 75) return 'success.main';
  if (score >= 50) return 'warning.main';
  return 'error.main';
}

function StatCard({ icon, label, value, valueColor }) {
  return (
    <MotionBox variants={itemVariants} sx={{ height: '100%' }}>
      <GlassCard
        sx={{
          height: '100%',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          transition: 'transform .3s ease, box-shadow .3s ease',
          '&:hover': { transform: 'translateY(-4px)' },
        }}
      >
        <Box
          sx={{
            width: 50,
            height: 50,
            flexShrink: 0,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: (theme) => theme.custom.gradients.primarySoft,
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: valueColor, lineHeight: 1.1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Box>
      </GlassCard>
    </MotionBox>
  );
}

function QuickActionCard({ icon, title, desc, to }) {
  const navigate = useNavigate();
  return (
    <MotionBox variants={itemVariants} sx={{ height: '100%' }}>
      <GlassCard
        onClick={() => navigate(to)}
        sx={{
          height: '100%',
          p: 3,
          cursor: 'pointer',
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
        <Typography variant="subtitle1" fontWeight={800} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {desc}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ color: 'primary.main', fontWeight: 700 , alignItems: "center"}}>
          <Typography variant="body2" fontWeight={700}>
            Open
          </Typography>
          <ChevronRightRoundedIcon fontSize="small" />
        </Stack>
      </GlassCard>
    </MotionBox>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDashboard()
      .then((res) => {
        if (!mounted) return;
        setData(res || {});
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        // A brand-new account with nothing yet (or a transient 404) should still
        // render a friendly empty dashboard rather than an error page.
        const status = err?.response?.status;
        if (status === 404) {
          setData({});
          setError(null);
        } else {
          setError('We could not load your dashboard right now. Please try again.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'there'
    );
  }, [user]);

  const recentUploads = data?.recent_uploads || [];
  const activeReminders = data?.active_reminders_count ?? 0;
  const healthScore = data?.latest_health_score || {};
  const overallScore = healthScore?.overall ?? healthScore?.score ?? null;
  const chatActivity = data?.recent_chat_activity || [];

  const hasAnyData =
    recentUploads.length > 0 || activeReminders > 0 || overallScore != null || chatActivity.length > 0;

  const quickActions = [
    {
      icon: <DocumentScannerRoundedIcon />,
      title: 'Prescription Scanner',
      desc: 'Upload or photograph a prescription for instant AI analysis.',
      to: '/scanner/prescription',
    },
    {
      icon: <ReceiptLongRoundedIcon />,
      title: 'Bill Scanner',
      desc: 'Check hospital bills for overcharges and hidden fees.',
      to: '/scanner/bill',
    },
    {
      icon: <ForumRoundedIcon />,
      title: 'AI Chat',
      desc: 'Ask follow-up questions about your health, in plain language.',
      to: '/chat',
    },
    {
      icon: <AlarmRoundedIcon />,
      title: 'Medicine Reminder',
      desc: 'Never miss a dose with smart scheduled reminders.',
      to: '/reminders',
    },
    {
      icon: <LocalHospitalRoundedIcon />,
      title: 'Medical History',
      desc: 'Browse every prescription and bill you have analyzed.',
      to: '/history',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Welcome header */}
      <MotionBox
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        sx={{ mb: 4 }}
      >
        <GlassCard
          sx={{
            p: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            backgroundImage: (t) =>
              t.palette.mode === 'dark' ? t.custom.gradients.heroDark : t.custom.gradients.primarySoft,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
              src={user?.user_metadata?.avatar_url}
              sx={{
                width: 56,
                height: 56,
                backgroundImage: theme.custom.gradients.primary,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {displayName?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Welcome back, {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Stack>
          <GradientButton
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => navigate('/scanner/prescription')}
          >
            New Scan
          </GradientButton>
        </GlassCard>
      </MotionBox>

      {loading && (
        <Box sx={{ mb: 4 }}>
          <CardSkeleton count={2} lines={2} />
        </Box>
      )}

      {!loading && error && (
        <GlassCard sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error" fontWeight={700} gutterBottom>
            {error}
          </Typography>
          <GradientButton size="small" onClick={() => window.location.reload()}>
            Retry
          </GradientButton>
        </GlassCard>
      )}

      {!loading && !error && (
        <>
          {/* Stat cards */}
          <MotionBox variants={containerVariants} initial="hidden" animate="show">
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<CloudUploadRoundedIcon />}
                  label="Recent Uploads"
                  value={recentUploads.length}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<NotificationsActiveRoundedIcon />}
                  label="Active Reminders"
                  value={activeReminders}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<FavoriteRoundedIcon />}
                  label="Latest Health Score"
                  value={overallScore != null ? Math.round(overallScore) : '—'}
                  valueColor={scoreColor(overallScore)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<ChatBubbleRoundedIcon />}
                  label="Recent Chat Activity"
                  value={chatActivity.length}
                />
              </Grid>
            </Grid>
          </MotionBox>

          {!hasAnyData ? (
            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{ mb: 4 }}
            >
              <GlassCard sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    mx: 'auto',
                    mb: 2.5,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: theme.custom.gradients.primary,
                    color: '#fff',
                  }}
                >
                  <DocumentScannerRoundedIcon fontSize="large" />
                </Box>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Nothing here yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 3 }}>
                  Scan your first prescription or hospital bill and your health dashboard will start
                  filling up with insights, reminders and scores.
                </Typography>
                <GradientButton onClick={() => navigate('/scanner/prescription')}>
                  Scan Your First Prescription
                </GradientButton>
              </GlassCard>
            </MotionBox>
          ) : (
            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{ mb: 4 }}
            >
              <GlassCard sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" sx={{ mb: 1 , alignItems: "center", justifyContent: "space-between"}}>
                  <Typography variant="h6" fontWeight={800}>
                    Recent Uploads
                  </Typography>
                  {overallScore != null && (
                    <Chip
                      label={`Health Score: ${Math.round(overallScore)}`}
                      sx={{
                        fontWeight: 700,
                        color: '#fff',
                        bgcolor: scoreColor(overallScore),
                      }}
                    />
                  )}
                </Stack>
                <Divider sx={{ mb: 1 }} />
                {recentUploads.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No uploads yet — scan a prescription or bill to see it here.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {recentUploads.map((item, i) => (
                      <ListItemButton
                        key={item.id || i}
                        component={RouterLink}
                        to="/history"
                        sx={{ borderRadius: 2.5, mb: 0.5 }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: 'transparent',
                              backgroundImage: theme.custom.gradients.primarySoft,
                              color: 'primary.main',
                            }}
                          >
                            {item.type === 'bill' ? <ReceiptLongRoundedIcon /> : <InsertDriveFileRoundedIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.title || item.name || (item.type === 'bill' ? 'Bill' : 'Prescription')}
                          secondary={[
                            item.subtitle || item.summary,
                            item.date ? dayjs(item.date).format('DD MMM YYYY') : null,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                          slotProps={{ primary: { fontWeight: 700 } }}
                        />
                        <ChevronRightRoundedIcon sx={{ color: 'text.secondary' }} />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </GlassCard>
            </MotionBox>
          )}
        </>
      )}

      {/* Quick actions */}
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        Quick Scan
      </Typography>
      <MotionBox variants={containerVariants} initial="hidden" animate="show">
        <Grid container spacing={3}>
          {quickActions.map((action) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={action.to}>
              <QuickActionCard {...action} />
            </Grid>
          ))}
        </Grid>
      </MotionBox>
    </Container>
  );
}
