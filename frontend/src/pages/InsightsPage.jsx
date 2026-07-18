import { useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import MedicationLiquidRoundedIcon from '@mui/icons-material/MedicationLiquidRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import GlassCard from '../components/GlassCard';
import { CardSkeleton } from '../components/LoadingSkeletons';
import { getSummary } from '../services/summaryService';

const IMPROVING_WORDS = ['improving', 'increasing', 'up', 'better', 'positive', 'rising'];
const DECLINING_WORDS = ['declining', 'decreasing', 'down', 'worse', 'worsening', 'negative', 'falling', 'dropping'];

function trendIconFor(text) {
  const lower = (text || '').toLowerCase();
  if (IMPROVING_WORDS.some((w) => lower.includes(w))) return { Icon: TrendingUpRoundedIcon, color: 'success.main' };
  if (DECLINING_WORDS.some((w) => lower.includes(w))) return { Icon: TrendingDownRoundedIcon, color: 'error.main' };
  return { Icon: TrendingFlatRoundedIcon, color: 'text.secondary' };
}

function TrendCard({ title, icon: TitleIcon, text }) {
  const { Icon, color } = trendIconFor(text);
  return (
    <GlassCard sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 , alignItems: "center"}}>
        <TitleIcon fontSize="small" sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={800}>
          {title}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
        <Icon sx={{ color }} fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          {text || 'No data available.'}
        </Typography>
      </Stack>
    </GlassCard>
  );
}

function formatStatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function InsightsPage() {
  const theme = useTheme();
  const [period, setPeriod] = useState('weekly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getSummary(period)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.detail || 'Could not load insights.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);

  const paragraphs = (data?.summary_text || '')
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const statsEntries = data?.stats
    ? Object.entries(data.stats).filter(([, v]) => v !== null && typeof v !== 'object')
    : [];

  return (
    <Container maxWidth="md">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 , alignItems: { sm: 'center' }, justifyContent: "space-between"}}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <InsightsRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={800}>
              Insights
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            AI-generated summaries of your health trends.
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_e, val) => val && setPeriod(val)}
          size="small"
        >
          <ToggleButton value="weekly">Weekly</ToggleButton>
          <ToggleButton value="monthly">Monthly</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <CardSkeleton count={2} lines={3} />}

      {!loading && !error && data && (
        <Stack spacing={3}>
          <GlassCard sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography variant="subtitle1" fontWeight={800} gutterBottom>
              {period === 'weekly' ? 'This Week' : 'This Month'} in Summary
            </Typography>
            <Stack spacing={1.5}>
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <Typography key={i} variant="body2" color="text.secondary">
                    {p}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No summary available for this period yet.
                </Typography>
              )}
            </Stack>
          </GlassCard>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TrendCard title="Adherence" icon={MedicationLiquidRoundedIcon} text={data.adherence_trend} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TrendCard title="Spending" icon={PaymentsRoundedIcon} text={data.spending_trend} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TrendCard title="Health" icon={MonitorHeartRoundedIcon} text={data.health_trend} />
            </Grid>
          </Grid>

          {Array.isArray(data.suggestions) && data.suggestions.length > 0 && (
            <GlassCard sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                Suggestions
              </Typography>
              <List dense disablePadding>
                {data.suggestions.map((s, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText primary={s} />
                  </ListItem>
                ))}
              </List>
            </GlassCard>
          )}

          {statsEntries.length > 0 && (
            <GlassCard sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                Stats
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, rowGap: 1 }}>
                {statsEntries.map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${formatStatKey(key)}: ${value}`}
                    sx={{
                      backgroundImage: theme.custom.gradients.primarySoft,
                      color: 'primary.main',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
            </GlassCard>
          )}
        </Stack>
      )}
    </Container>
  );
}
