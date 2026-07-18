import { useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { checkEmergency } from '../services/emergencyService';

const URGENCY_META = {
  green: {
    color: '#0EA672',
    bg: 'rgba(14,166,114,0.12)',
    label: 'Low Urgency',
    icon: CheckCircleRoundedIcon,
    desc: 'Your symptoms appear mild. Monitor and take care of yourself.',
  },
  yellow: {
    color: '#D97706',
    bg: 'rgba(217,119,6,0.14)',
    label: 'Moderate Urgency',
    icon: WarningAmberRoundedIcon,
    desc: 'These symptoms warrant prompt attention from a healthcare professional.',
  },
  red: {
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.16)',
    label: 'High Urgency — Act Now',
    icon: ErrorRoundedIcon,
    desc: 'These symptoms may be serious. Seek emergency care immediately.',
  },
};

const ACTION_META = {
  call_doctor: {
    label: 'Call Your Doctor',
    icon: LocalPhoneRoundedIcon,
    ctaLabel: 'Find a Doctor Nearby',
    ctaHref: 'https://www.google.com/maps/search/doctor+near+me',
  },
  visit_clinic: {
    label: 'Visit a Clinic',
    icon: LocalPharmacyRoundedIcon,
    ctaLabel: 'Find a Clinic Nearby',
    ctaHref: 'https://www.google.com/maps/search/clinic+near+me',
  },
  emergency_hospital: {
    label: 'Go to the Emergency Room',
    icon: LocalHospitalRoundedIcon,
    ctaLabel: 'Call Emergency (108)',
    ctaHref: 'tel:108',
  },
};

export default function EmergencyPage() {
  const theme = useTheme();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const runCheck = async () => {
    if (!symptoms.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await checkEmergency(symptoms.trim());
      setResult(res);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not check urgency right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const urgencyMeta = result ? URGENCY_META[result.urgency] || URGENCY_META.yellow : null;
  const actionMeta = result?.recommendation?.action
    ? ACTION_META[result.recommendation.action] || { label: result.recommendation.action, icon: LocalHospitalRoundedIcon }
    : null;

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          borderRadius: '20px',
          p: { xs: 3, md: 4 },
          mb: 3,
          color: '#fff',
          backgroundImage: theme.custom.gradients.emergency,
          boxShadow: '0 14px 34px rgba(220,38,38,0.35)',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LocalHospitalRoundedIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Emergency Symptom Check
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92 }}>
              Describe what you're experiencing and get an instant urgency assessment.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Alert severity="warning" icon={<WarningAmberRoundedIcon />} sx={{ mb: 3 }}>
        This is AI-generated guidance, not a medical diagnosis. If your symptoms are severe or
        life-threatening, call emergency services immediately — do not wait for this tool.
      </Alert>

      <GlassCard sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            multiline
            minRows={4}
            fullWidth
            label="Describe your symptoms"
            placeholder="e.g. Sudden chest pain, shortness of breath, and dizziness for the last 20 minutes..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          {error && (
            <Alert
              severity="error"
              action={
                <Chip
                  icon={<ReplayRoundedIcon />}
                  label="Retry"
                  size="small"
                  onClick={runCheck}
                  clickable
                  color="error"
                  variant="outlined"
                />
              }
            >
              {error}
            </Alert>
          )}
          <GradientButton
            size="large"
            fullWidth
            disabled={loading || !symptoms.trim()}
            onClick={runCheck}
            sx={{ backgroundImage: theme.custom.gradients.emergency }}
            startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <LocalHospitalRoundedIcon />}
          >
            {loading ? 'Checking...' : 'Check Urgency'}
          </GradientButton>
        </Stack>
      </GlassCard>

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <GlassCard
            sx={{
              p: { xs: 2.5, md: 3.5 },
              mb: 3,
              border: `2px solid ${urgencyMeta.color}`,
              backgroundColor: urgencyMeta.bg,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ mb: 2 , alignItems: "center"}}>
              <urgencyMeta.icon sx={{ color: urgencyMeta.color, fontSize: 40 }} />
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: urgencyMeta.color }}>
                  {urgencyMeta.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {urgencyMeta.desc}
                </Typography>
              </Box>
            </Stack>

            {actionMeta && (
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 , alignItems: "center"}}>
                  <actionMeta.icon sx={{ color: urgencyMeta.color }} />
                  <Typography variant="subtitle1" fontWeight={800}>
                    Recommended action: {actionMeta.label}
                  </Typography>
                </Stack>
                {actionMeta.ctaHref && (
                  <GradientButton
                    startIcon={
                      result.recommendation.action === 'emergency_hospital' ? (
                        <LocalPhoneRoundedIcon />
                      ) : (
                        <PlaceRoundedIcon />
                      )
                    }
                    component="a"
                    href={actionMeta.ctaHref}
                    target={actionMeta.ctaHref.startsWith('tel:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    sx={{
                      backgroundImage:
                        result.urgency === 'red'
                          ? theme.custom.gradients.emergency
                          : theme.custom.gradients.primary,
                    }}
                  >
                    {actionMeta.ctaLabel}
                  </GradientButton>
                )}
              </Box>
            )}

            {result.recommendation?.reasons?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  Why this assessment:
                </Typography>
                <List dense disablePadding>
                  {result.recommendation.reasons.map((reason, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <FiberManualRecordRoundedIcon sx={{ fontSize: 8, color: urgencyMeta.color }} />
                      </ListItemIcon>
                      <ListItemText primary={reason} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {result.recommendation?.nearby_action && (
              <Box>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  What to do next:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.recommendation.nearby_action}
                </Typography>
              </Box>
            )}
          </GlassCard>
        </motion.div>
      )}
    </Container>
  );
}
