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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@mui/material';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import NoFoodRoundedIcon from '@mui/icons-material/NoFoodRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PregnantWomanRoundedIcon from '@mui/icons-material/PregnantWomanRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import LocalBarRoundedIcon from '@mui/icons-material/LocalBarRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import FileDropzone from '../components/FileDropzone';
import CameraCapture from '../components/CameraCapture';
import TypingIndicator from '../components/TypingIndicator';
import MedicineTable from '../components/MedicineTable';
import { uploadPrescription } from '../services/prescriptionService';

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

function BulletList({ items, icon }) {
  if (!items || items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nothing noted.
      </Typography>
    );
  }
  return (
    <List dense disablePadding>
      {items.map((item, i) => (
        <ListItem key={i} disableGutters sx={{ alignItems: 'flex-start', py: 0.4 }}>
          <ListItemIcon sx={{ minWidth: 30, mt: 0.4 }}>{icon}</ListItemIcon>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );
}

function confidenceColor(score) {
  if (score == null) return 'default';
  if (score >= 0.8) return 'success';
  if (score >= 0.5) return 'warning';
  return 'error';
}

/** Renders a per-medicine breakdown for a section whose data lives inside
 * each medicine object (warnings, missed-dose instructions, safety, etc).
 * `getContent` returns falsy/empty to skip a medicine that has nothing to show. */
function PerMedicineSection({ medicines, getContent }) {
  const entries = medicines
    .map((med, i) => ({ med, i, content: getContent(med) }))
    .filter((e) => e.content);

  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No specific notes provided for your medicines.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {entries.map(({ med, i, content }) => (
        <Accordion
          key={i}
          disableGutters
          elevation={0}
          sx={{
            bgcolor: 'action.hover',
            borderRadius: '14px !important',
            '&:before': { display: 'none' },
            overflow: 'hidden',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle2" fontWeight={700}>
              {med.name || `Medicine ${i + 1}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>{content}</AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}

const questionsCheckedInit = () => new Set();

export default function PrescriptionScannerPage() {
  const [tab, setTab] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [checkedQuestions, setCheckedQuestions] = useState(questionsCheckedInit);

  const { register, watch } = useForm({ defaultValues: { notes: '' } });
  const notesValue = watch('notes');

  const handleCameraCapture = (blob) => {
    setFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
  };

  const onAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await uploadPrescription(file, notesValue);
      setResult(res);
      setCheckedQuestions(questionsCheckedInit());
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong while analyzing this prescription. Please try again.';
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

  const toggleQuestion = (i) => {
    setCheckedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const medicines = result?.medicines || [];
  const anyUnclear = medicines.some((m) => m.unclear);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Prescription Scanner
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload a photo or scan of a prescription and let AI translate it into a clear medicine
          schedule, warnings and lifestyle guidance.
        </Typography>
      </Box>

      {/* Upload card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <GlassCard sx={{ p: { xs: 3, md: 4 }, mb: 4 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 3 }}
            variant="fullWidth"
          >
            <Tab icon={<UploadFileRoundedIcon />} iconPosition="start" label="Upload File" />
            <Tab icon={<PhotoCameraRoundedIcon />} iconPosition="start" label="Camera" />
          </Tabs>

          {tab === 0 && (
            <FileDropzone
              onFile={setFile}
              accept="image/*,.pdf"
              label="Drag & drop a prescription here, or click to browse"
              helperText="Images or PDF, up to 10MB"
            />
          )}
          {tab === 1 && <CameraCapture onCapture={handleCameraCapture} />}

          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              {...register('notes')}
              fullWidth
              multiline
              minRows={3}
              label="Additional notes (optional)"
              placeholder={'e.g. "I have fever for 4 days." / "Doctor said to take after food."'}
            />
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
              {loading ? 'Analyzing…' : 'Analyze Prescription'}
            </GradientButton>
            {loading && (
              <Stack direction="row" spacing={1} sx={{ color: 'primary.main' , alignItems: "center"}}>
                <TypingIndicator />
                <Typography variant="body2" fontWeight={600}>
                  AI is analyzing your prescription…
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
                  Analysis Result
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Chip
                    label={`Confidence: ${
                      result.confidence_score != null ? Math.round(result.confidence_score * 100) : '—'
                    }%`}
                    color={confidenceColor(result.confidence_score)}
                    sx={{ fontWeight: 700, color: '#fff' }}
                  />
                  <GradientButton size="small" onClick={resetAll} startIcon={<RefreshRoundedIcon />}>
                    Scan Another
                  </GradientButton>
                </Stack>
              </Stack>

              {anyUnclear && (
                <Alert severity="warning" icon={<WarningAmberRoundedIcon />}>
                  Some handwriting was unclear — please verify with your doctor/pharmacist. Affected
                  medicines are highlighted below.
                </Alert>
              )}

              <SectionCard icon={<LocalHospitalRoundedIcon />} title="Patient Summary">
                <Typography variant="body1">{result.patient_summary || 'Not provided.'}</Typography>
              </SectionCard>

              <SectionCard icon={<ReportProblemRoundedIcon />} title="Disease / Symptoms">
                <Typography variant="body1">{result.disease_symptoms || 'Not provided.'}</Typography>
              </SectionCard>

              <SectionCard icon={<QuizRoundedIcon />} title="Doctor's Advice Summary">
                <Typography variant="body1">{result.doctor_advice_summary || 'Not provided.'}</Typography>
              </SectionCard>

              <SectionCard icon={<LocalHospitalRoundedIcon />} title="Medicine Schedule">
                <MedicineTable medicines={medicines} />
              </SectionCard>

              <SectionCard icon={<ShieldRoundedIcon />} title="Warnings & Drug Interactions">
                <PerMedicineSection
                  medicines={medicines}
                  getContent={(med) => {
                    const warnings = med.warnings || [];
                    const interactions = med.drug_interactions || [];
                    if (warnings.length === 0 && interactions.length === 0) return null;
                    return (
                      <Stack spacing={1.5}>
                        {warnings.length > 0 && (
                          <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">
                              WARNINGS
                            </Typography>
                            <BulletList items={warnings} icon={<WarningAmberRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} />} />
                          </Box>
                        )}
                        {interactions.length > 0 && (
                          <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">
                              DRUG INTERACTIONS
                            </Typography>
                            <BulletList items={interactions} icon={<ReportProblemRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />} />
                          </Box>
                        )}
                      </Stack>
                    );
                  }}
                />
              </SectionCard>

              <SectionCard icon={<ScheduleRoundedIcon />} title="Missed Dose Instructions">
                <PerMedicineSection
                  medicines={medicines}
                  getContent={(med) => (med.missed_dose_instructions ? <Typography variant="body2">{med.missed_dose_instructions}</Typography> : null)}
                />
              </SectionCard>

              <SectionCard icon={<InventoryRoundedIcon />} title="Storage Instructions">
                <PerMedicineSection
                  medicines={medicines}
                  getContent={(med) => (med.storage_instructions ? <Typography variant="body2">{med.storage_instructions}</Typography> : null)}
                />
              </SectionCard>

              <SectionCard icon={<ShieldRoundedIcon />} title="Safety Information">
                <PerMedicineSection
                  medicines={medicines}
                  getContent={(med) => {
                    const rows = [
                      { label: 'Pregnancy', icon: <PregnantWomanRoundedIcon fontSize="small" />, value: med.pregnancy_safety },
                      { label: 'Children', icon: <ChildCareRoundedIcon fontSize="small" />, value: med.children_safety },
                      { label: 'Alcohol', icon: <LocalBarRoundedIcon fontSize="small" />, value: med.alcohol_warning },
                      { label: 'Driving', icon: <DirectionsCarRoundedIcon fontSize="small" />, value: med.driving_warning },
                    ].filter((r) => r.value);
                    if (rows.length === 0) return null;
                    return (
                      <Stack spacing={1}>
                        {rows.map((r) => (
                          <Stack key={r.label} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                            <Chip icon={r.icon} label={r.label} size="small" sx={{ flexShrink: 0 }} />
                            <Typography variant="body2" color="text.secondary">
                              {r.value}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    );
                  }}
                />
              </SectionCard>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <SectionCard icon={<ScheduleRoundedIcon />} title="Estimated Treatment Duration" sx={{ height: '100%' }}>
                    <Typography variant="body1">{result.estimated_treatment_duration || 'Not specified.'}</Typography>
                  </SectionCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <SectionCard icon={<WaterDropRoundedIcon />} title="Water Intake" sx={{ height: '100%' }}>
                    <Typography variant="body1">{result.water_intake || 'Not specified.'}</Typography>
                  </SectionCard>
                </Grid>
              </Grid>

              {result.emergency_warning_signs?.length > 0 && (
                <Alert severity="error" icon={<ErrorRoundedIcon />}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    Seek immediate medical attention if you notice:
                  </Typography>
                  <List dense disablePadding>
                    {result.emergency_warning_signs.map((sign, i) => (
                      <ListItem key={i} disableGutters sx={{ py: 0.2 }}>
                        <ListItemText primary={sign} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}

              <SectionCard icon={<FitnessCenterRoundedIcon />} title="Lifestyle & Exercise Suggestions">
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      LIFESTYLE
                    </Typography>
                    <BulletList items={result.lifestyle_suggestions} icon={<CheckCircleRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      EXERCISE
                    </Typography>
                    <BulletList items={result.exercise_suggestions} icon={<FitnessCenterRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />} />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard icon={<RestaurantRoundedIcon />} title="Food Guidance">
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" fontWeight={700} color="success.main">
                      RECOMMENDED
                    </Typography>
                    <BulletList items={result.food_recommendations} icon={<CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" fontWeight={700} color="error.main">
                      AVOID
                    </Typography>
                    <BulletList items={result.foods_to_avoid} icon={<NoFoodRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />} />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard icon={<EventAvailableRoundedIcon />} title="Next Doctor Visit">
                <Typography variant="body1">{result.next_doctor_visit || 'Not specified.'}</Typography>
              </SectionCard>

              <SectionCard icon={<QuizRoundedIcon />} title="Questions to Ask Your Doctor">
                {result.questions_to_ask_doctor?.length > 0 ? (
                  <List dense disablePadding>
                    {result.questions_to_ask_doctor.map((q, i) => (
                      <ListItem
                        key={i}
                        disableGutters
                        sx={{ py: 0.2 }}
                        onClick={() => toggleQuestion(i)}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            edge="start"
                            checked={checkedQuestions.has(i)}
                            tabIndex={-1}
                            disableRipple
                            icon={<CancelRoundedIcon sx={{ opacity: 0 }} />}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={q}
                          sx={{
                            textDecoration: checkedQuestions.has(i) ? 'line-through' : 'none',
                            color: checkedQuestions.has(i) ? 'text.secondary' : 'text.primary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No suggested questions.
                  </Typography>
                )}
              </SectionCard>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
