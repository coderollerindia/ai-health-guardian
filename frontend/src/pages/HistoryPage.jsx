import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { CardSkeleton } from '../components/LoadingSkeletons';
import { getHistory } from '../services/historyService';

const TYPE_ICONS = {
  prescription: DocumentScannerRoundedIcon,
  bill: ReceiptLongRoundedIcon,
  reminder: AlarmRoundedIcon,
};

function typeIcon(type) {
  const Icon = TYPE_ICONS[type] || HistoryRoundedIcon;
  return <Icon fontSize="small" />;
}

function formatGroupDate(dateStr) {
  if (!dateStr) return 'Undated';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function HistoryPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getHistory({
      type: type === 'all' ? undefined : type,
      q: debouncedQuery || undefined,
      from: from || undefined,
      to: to || undefined,
    })
      .then((res) => {
        if (!active) return;
        setItems(Array.isArray(res?.items) ? res.items : []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.response?.data?.detail || 'Could not load your history right now.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery, type, from, to]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const key = item.date ? item.date.slice(0, 10) : 'undated';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  return (
    <Container maxWidth="md">
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A timeline of your prescriptions, bills and reminders.
        </Typography>
      </Stack>

      <GlassCard sx={{ p: 2.5, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search history..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <ToggleButtonGroup
              value={type}
              exclusive
              size="small"
              onChange={(_e, val) => val && setType(val)}
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="prescription">Prescription</ToggleButton>
              <ToggleButton value="bill">Bill</ToggleButton>
              <ToggleButton value="reminder">Reminder</ToggleButton>
            </ToggleButtonGroup>
            <Stack direction="row" spacing={1.5} sx={{ flex: 1 }}>
              <TextField
                type="date"
                label="From"
                size="small"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                type="date"
                label="To"
                size="small"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>
          </Stack>
        </Stack>
      </GlassCard>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <CardSkeleton count={3} lines={2} />}

      {!loading && !error && items.length === 0 && (
        <GlassCard sx={{ p: 5, textAlign: 'center' }}>
          <HistoryRoundedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1.5, opacity: 0.6 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            No records yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a prescription or bill to get started — your history will show up here.
          </Typography>
          <GradientButton startIcon={<UploadFileRoundedIcon />} onClick={() => navigate('/scanner/prescription')}>
            Upload a Prescription
          </GradientButton>
        </GlassCard>
      )}

      {!loading && !error && groups.length > 0 && (
        <Stack spacing={4}>
          {groups.map(([dateKey, groupItems]) => (
            <Box key={dateKey}>
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em' }}
              >
                {formatGroupDate(dateKey === 'undated' ? null : dateKey)}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {groupItems.map((item, idx) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      position: 'relative',
                      pb: idx === groupItems.length - 1 ? 0 : 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundImage: theme.custom.gradients.primarySoft,
                          color: 'primary.main',
                          zIndex: 1,
                        }}
                      >
                        {typeIcon(item.type)}
                      </Box>
                      {idx !== groupItems.length - 1 && (
                        <Box sx={{ flex: 1, width: '2px', bgcolor: 'divider', my: 0.5 }} />
                      )}
                    </Box>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.35 }}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <GlassCard sx={{ p: 2.25 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.title}
                        </Typography>
                        {item.subtitle && (
                          <Typography variant="body2" color="text.secondary">
                            {item.subtitle}
                          </Typography>
                        )}
                        {item.summary && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {item.summary}
                          </Typography>
                        )}
                      </GlassCard>
                    </motion.div>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
}
