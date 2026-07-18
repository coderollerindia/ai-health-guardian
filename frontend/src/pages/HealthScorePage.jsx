import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Typography, Grid, Alert, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';

import GlassCard from '../components/GlassCard';
import ScoreGauge from '../components/ScoreGauge';
import { CardSkeleton } from '../components/LoadingSkeletons';
import { getHealthScore } from '../services/healthScoreService';

const METRICS = [
  { key: 'adherence', label: 'Adherence' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'hydration', label: 'Hydration' },
  { key: 'activity', label: 'Activity' },
  { key: 'sleep', label: 'Sleep' },
  // Risk is inverted: a LOW risk score is good, so ScoreGauge flips its color
  // scale for this metric (see `invert` prop) while still showing the raw value.
  { key: 'risk', label: 'Risk', invert: true },
];

function formatDate(d) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HealthScorePage() {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getHealthScore()
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.detail || 'Could not load your health score.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo(() => {
    const history = Array.isArray(data?.history) ? data.history : [];
    return history.map((h) => ({ ...h, dateLabel: formatDate(h.date) }));
  }, [data]);

  return (
    <Container maxWidth="md">
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          Health Score
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A holistic daily snapshot of adherence, lifestyle and risk.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <CardSkeleton count={2} lines={3} />}

      {!loading && !error && data?.current && (
        <>
          <GlassCard sx={{ p: { xs: 3, md: 4 }, mb: 3, textAlign: 'center' }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 , alignItems: "center", justifyContent: "center"}}>
              <FavoriteRoundedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="overline" fontWeight={800} color="text.secondary">
                Overall Health Score
              </Typography>
            </Stack>
            <ScoreGauge value={data.current.overall} size={220} thickness="14%" />
          </GlassCard>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {METRICS.map((m) => (
              <Grid size={{ xs: 6, sm: 4 }} key={m.key}>
                <GlassCard sx={{ p: 2.5, display: 'flex', justifyContent: 'center' }}>
                  <ScoreGauge
                    value={data.current[m.key] ?? 0}
                    label={m.label}
                    size={110}
                    invert={!!m.invert}
                  />
                </GlassCard>
              </Grid>
            ))}
          </Grid>

          <GlassCard sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 , alignItems: "center"}}>
              <ShowChartRoundedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={800}>
                Score Trend
              </Typography>
            </Stack>
            {chartData.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Not enough history yet to show a trend. Check back after a few more days.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="healthScoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} width={36} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.custom.glass.shadow,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="overall"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2.5}
                      fill="url(#healthScoreFill)"
                      dot={{ r: chartData.length === 1 ? 5 : 3 }}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </GlassCard>
        </>
      )}
    </Container>
  );
}
