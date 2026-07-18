import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Stack,
  Tabs,
  Tab,
  TextField,
  Typography,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tooltip,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import FileDropzone from '../components/FileDropzone';
import CameraCapture from '../components/CameraCapture';
import TypingIndicator from '../components/TypingIndicator';
import { uploadBill } from '../services/billService';

function SectionCard({ icon, title, children, sx }) {
  return (
    <GlassCard sx={{ p: { xs: 3, md: 3.5 }, ...sx }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 , alignItems: "center"}}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: (theme) => theme.custom.gradients.primarySoft,
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
      </Stack>
      {children}
    </GlassCard>
  );
}

function WarningList({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" fontWeight={700} color="error.main">
        {title.toUpperCase()}
      </Typography>
      <List dense disablePadding>
        {items.map((item, i) => (
          <ListItem key={i} disableGutters sx={{ alignItems: 'flex-start', py: 0.3 }}>
            <ListItemIcon sx={{ minWidth: 30, mt: 0.3 }}>
              <WarningAmberRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function ratingColor(rating) {
  const r = (rating || '').toLowerCase();
  if (r === 'low') return 'success';
  if (r === 'high') return 'error';
  return 'warning';
}

function ScoreGauge({ label, value }) {
  const v = value != null ? Math.round(value) : null;
  const color = v == null ? 'text.disabled' : v >= 75 ? 'success.main' : v >= 50 ? 'warning.main' : 'error.main';
  return (
    <GlassCard sx={{ p: 3, textAlign: 'center', height: '100%' }}>
      <Box
        sx={{
          width: 96,
          height: 96,
          mx: 'auto',
          mb: 1.5,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '6px solid',
          borderColor: color,
        }}
      >
        <Typography variant="h5" fontWeight={800} sx={{ color }}>
          {v != null ? v : '—'}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={700} color="text.secondary">
        {label}
      </Typography>
    </GlassCard>
  );
}

function money(v) {
  if (v == null) return '—';
  return `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function BillScannerPage() {
  const [tab, setTab] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const { register, getValues } = useForm({
    defaultValues: { hospitalName: '', location: '', insuranceCompany: '', notes: '' },
  });

  const handleCameraCapture = (blob) => {
    setFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
  };

  const onAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const values = getValues();
      const res = await uploadBill(file, values);
      setResult(res);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong while analyzing this bill. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const lineItems = result?.line_items || [];
  const verification = result?.verification || {};
  const subtotals = result?.subtotals || {};
  const costComparison = result?.cost_comparison || {};

  const verificationLists = [
    { key: 'duplicate_charges', title: 'Duplicate Charges' },
    { key: 'unusually_expensive_medicines', title: 'Unusually Expensive Medicines' },
    { key: 'suspicious_items', title: 'Suspicious Items' },
    { key: 'unnecessary_tests', title: 'Unnecessary Tests' },
    { key: 'hidden_charges', title: 'Hidden Charges' },
  ];
  const hasAnyVerificationWarning = verificationLists.some((v) => (verification[v.key] || []).length > 0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Bill Scanner
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload a hospital or pharmacy bill and let AI check line items, GST and pricing for
          overcharges or hidden fees.
        </Typography>
      </Box>

      {/* Upload card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <GlassCard sx={{ p: { xs: 3, md: 4 }, mb: 4 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} variant="fullWidth">
            <Tab icon={<UploadFileRoundedIcon />} iconPosition="start" label="Upload File" />
            <Tab icon={<PhotoCameraRoundedIcon />} iconPosition="start" label="Camera" />
          </Tabs>

          {tab === 0 && (
            <FileDropzone
              onFile={setFile}
              accept="image/*,.pdf"
              label="Drag & drop a bill here, or click to browse"
              helperText="Images or PDF, up to 10MB"
            />
          )}
          {tab === 1 && <CameraCapture onCapture={handleCameraCapture} />}

          <Box component="form" sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField {...register('hospitalName')} fullWidth label="Hospital Name (optional)" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField {...register('location')} fullWidth label="Location (optional)" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField {...register('insuranceCompany')} fullWidth label="Insurance Company (optional)" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField {...register('notes')} fullWidth label="Additional Notes (optional)" />
              </Grid>
            </Grid>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 3 }}
              action={
                <GradientButton size="small" onClick={onAnalyze} startIcon={<RefreshRoundedIcon />}>
                  Retry
                </GradientButton>
              }
            >
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 3 , alignItems: "center"}}>
            <GradientButton
              size="large"
              disabled={!file || loading}
              onClick={onAnalyze}
              startIcon={<AutoAwesomeRoundedIcon />}
            >
              {loading ? 'Analyzing…' : 'Analyze Bill'}
            </GradientButton>
            {loading && (
              <Stack direction="row" spacing={1} sx={{ color: 'primary.main' , alignItems: "center"}}>
                <TypingIndicator />
                <Typography variant="body2" fontWeight={600}>
                  AI is analyzing your bill…
                </Typography>
              </Stack>
            )}
          </Stack>
        </GlassCard>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Stack spacing={3} sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                <Typography variant="h5" fontWeight={800}>
                  Bill Analysis
                </Typography>
                <GradientButton size="small" onClick={resetAll} startIcon={<RefreshRoundedIcon />}>
                  Scan Another
                </GradientButton>
              </Stack>

              <SectionCard icon={<LocalHospitalRoundedIcon />} title="Bill Details">
                <Grid container spacing={2}>
                  {[
                    ['Hospital', result.hospital_name],
                    ['Doctor', result.doctor_name],
                    ['Bill Date', result.bill_date],
                    ['Bill Number', result.bill_number],
                    ['Patient Name', result.patient_name],
                  ].map(([label, value]) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {label.toUpperCase()}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {value || '—'}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>

              <SectionCard icon={<ReceiptLongRoundedIcon />} title="Line Items">
                {lineItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No line items were detected.
                  </Typography>
                ) : (
                  <TableContainer sx={{ borderRadius: 3, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>
                            Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lineItems.map((item, i) => (
                          <TableRow
                            key={i}
                            sx={{
                              bgcolor: item.flagged
                                ? (theme) => alpha(theme.palette.error.main, 0.1)
                                : 'transparent',
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                                {item.flagged && (
                                  <Tooltip title={item.flag_reason || 'Flagged for review'} arrow>
                                    <FlagRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
                                  </Tooltip>
                                )}
                                <Typography variant="body2" fontWeight={600}>
                                  {item.description}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip label={item.category || 'Other'} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={700}>
                                {money(item.amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </SectionCard>

              <SectionCard icon={<CalculateRoundedIcon />} title="Subtotals">
                <Grid container spacing={2}>
                  {[
                    ['Medicine Charges', subtotals.medicine_charges],
                    ['Room Charges', subtotals.room_charges],
                    ['Consultation Fees', subtotals.consultation_fees],
                    ['Lab Charges', subtotals.lab_charges],
                    ['GST', subtotals.gst],
                    ['Discount', subtotals.discount],
                  ].map(([label, value]) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {label.toUpperCase()}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {money(value)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Grand Total
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    {money(subtotals.grand_total)}
                  </Typography>
                </Stack>
              </SectionCard>

              <SectionCard icon={<VerifiedUserRoundedIcon />} title="Verification">
                <Stack direction="row" spacing={1} sx={{ mb: hasAnyVerificationWarning ? 2 : 0 , alignItems: "center"}}>
                  {verification.gst_correct ? (
                    <CheckCircleRoundedIcon sx={{ color: 'success.main' }} />
                  ) : (
                    <CancelRoundedIcon sx={{ color: 'error.main' }} />
                  )}
                  <Typography variant="body1" fontWeight={600}>
                    GST calculation {verification.gst_correct ? 'looks correct' : 'may be incorrect'}
                  </Typography>
                </Stack>
                {hasAnyVerificationWarning ? (
                  verificationLists.map((v) => (
                    <WarningList key={v.key} title={v.title} items={verification[v.key]} />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No duplicate charges, suspicious items or hidden fees were detected.
                  </Typography>
                )}
              </SectionCard>

              <SectionCard icon={<TrendingUpRoundedIcon />} title="Cost Comparison">
                <Grid container spacing={3} rowSpacing={3.5} sx={{ alignItems: 'flex-start' }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        LOCATION
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {costComparison.location || '—'}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        HOSPITAL
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {costComparison.hospital || '—'}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Stack spacing={0.75}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                        PRICE RATING
                      </Typography>
                      <Box>
                        <Chip
                          label={(costComparison.rating || 'unknown').toUpperCase()}
                          color={ratingColor(costComparison.rating)}
                          sx={{ fontWeight: 700, color: '#fff' }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        ESTIMATED FAIR PRICE
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {money(costComparison.estimated_fair_price)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        PRICE DIFFERENCE
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {costComparison.price_difference_pct != null ? `${costComparison.price_difference_pct}%` : '—'}
                      </Typography>
                    </Stack>
                  </Grid>
                  {costComparison.savings_opportunity != null && (
                    <Grid size={{ xs: 12 }} sx={{ pt: 1 }}>
                      <Alert severity="info" icon={<LightbulbRoundedIcon />}>
                        Potential savings opportunity: {money(costComparison.savings_opportunity)}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </SectionCard>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ScoreGauge label="Billing Confidence" value={result.billing_confidence_score} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ScoreGauge label="Overall Accuracy" value={result.overall_accuracy_score} />
                </Grid>
              </Grid>

              {result.recommendations?.length > 0 && (
                <Alert severity="info" icon={<LightbulbRoundedIcon />}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    Recommendations
                  </Typography>
                  <List dense disablePadding>
                    {result.recommendations.map((rec, i) => (
                      <ListItem key={i} disableGutters sx={{ py: 0.2 }}>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
