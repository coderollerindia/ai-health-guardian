import { Fragment, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import {
  Box,
  Container,
  Stack,
  Typography,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import CloudRoundedIcon from '@mui/icons-material/CloudRounded';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { CardSkeleton } from '../components/LoadingSkeletons';
import { getReminders, createReminder, updateReminder, deleteReminder } from '../services/reminderService';

const SLOTS = [
  { key: 'morning', label: 'Morning', icon: WbSunnyRoundedIcon, color: '#D97706' },
  { key: 'afternoon', label: 'Afternoon', icon: CloudRoundedIcon, color: '#0284C7' },
  { key: 'night', label: 'Night', icon: NightsStayRoundedIcon, color: '#7C4DFF' },
];

const DEFAULT_FORM = {
  medicine_name: '',
  time_of_day: 'morning',
  reminder_time: '08:00',
  start_date: dayjs().format('YYYY-MM-DD'),
  end_date: '',
  active: true,
};

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m || 0));
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function weekDays() {
  const today = dayjs();
  const dow = today.day(); // 0=Sun..6=Sat
  const monday = today.subtract((dow + 6) % 7, 'day');
  return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day'));
}

function isReminderActiveOn(reminder, day) {
  if (!reminder.active) return false;
  if (reminder.start_date && day.isBefore(dayjs(reminder.start_date), 'day')) return false;
  if (reminder.end_date && day.isAfter(dayjs(reminder.end_date), 'day')) return false;
  return true;
}

export default function RemindersPage() {
  const theme = useTheme();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const { control, handleSubmit, reset } = useForm({ defaultValues: DEFAULT_FORM });

  const days = useMemo(() => weekDays(), []);

  const load = () => {
    setLoading(true);
    setError(null);
    getReminders()
      .then((res) => setReminders(Array.isArray(res?.reminders) ? res.reminders : []))
      .catch((err) => setError(err?.response?.data?.detail || 'Could not load reminders.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    reset(DEFAULT_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (reminder) => {
    setEditing(reminder);
    reset({
      medicine_name: reminder.medicine_name || '',
      time_of_day: reminder.time_of_day || 'morning',
      reminder_time: reminder.reminder_time || '08:00',
      start_date: reminder.start_date || '',
      end_date: reminder.end_date || '',
      active: reminder.active ?? true,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    setFormError(null);
    const payload = {
      ...values,
      end_date: values.end_date || null,
    };
    try {
      if (editing) {
        await updateReminder(editing.id, payload);
      } else {
        await createReminder(payload);
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setFormError(err?.response?.data?.detail || 'Could not save this reminder.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (reminder) => {
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, active: !r.active } : r)));
    try {
      await updateReminder(reminder.id, { active: !reminder.active });
    } catch {
      // revert on failure
      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, active: reminder.active } : r)));
    }
  };

  const handleDelete = async (reminder) => {
    if (!window.confirm(`Delete the reminder for "${reminder.medicine_name}"?`)) return;
    const prev = reminders;
    setReminders((cur) => cur.filter((r) => r.id !== reminder.id));
    try {
      await deleteReminder(reminder.id);
    } catch {
      setReminders(prev);
    }
  };

  const grouped = SLOTS.map((slot) => ({
    ...slot,
    items: reminders.filter((r) => r.time_of_day === slot.key),
  }));

  return (
    <Container maxWidth="md">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 , alignItems: { sm: 'center' }, justifyContent: "space-between"}}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Reminders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay on top of every dose, every day.
          </Typography>
        </Box>
        <GradientButton startIcon={<AddRoundedIcon />} onClick={openAdd}>
          Add Reminder
        </GradientButton>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <CardSkeleton count={3} lines={1} />}

      {!loading && !error && reminders.length === 0 && (
        <GlassCard sx={{ p: 5, textAlign: 'center', mb: 4 }}>
          <AlarmRoundedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1.5, opacity: 0.6 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            No reminders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a reminder so you never miss a dose.
          </Typography>
          <GradientButton startIcon={<AddRoundedIcon />} onClick={openAdd}>
            Add Reminder
          </GradientButton>
        </GlassCard>
      )}

      {!loading && !error && reminders.length > 0 && (
        <Stack spacing={4} sx={{ mb: 5 }}>
          {grouped.map((slot) =>
            slot.items.length === 0 ? null : (
              <Box key={slot.key}>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 , alignItems: "center"}}>
                  <slot.icon sx={{ color: slot.color }} />
                  <Typography variant="subtitle1" fontWeight={800}>
                    {slot.label}
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {slot.items.map((reminder) => (
                    <motion.div key={reminder.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <GlassCard sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: theme.custom.gradients.primarySoft,
                            color: 'primary.main',
                            flexShrink: 0,
                          }}
                        >
                          <MedicationRoundedIcon fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {reminder.medicine_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(reminder.reminder_time)}
                            {reminder.start_date ? ` · from ${reminder.start_date}` : ''}
                            {reminder.end_date ? ` to ${reminder.end_date}` : ''}
                          </Typography>
                        </Box>
                        <Tooltip title={reminder.active ? 'Active' : 'Paused'}>
                          <Switch checked={!!reminder.active} onChange={() => toggleActive(reminder)} />
                        </Tooltip>
                        <IconButton size="small" onClick={() => openEdit(reminder)} aria-label="edit reminder">
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(reminder)} aria-label="delete reminder" color="error">
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </GlassCard>
                    </motion.div>
                  ))}
                </Stack>
              </Box>
            ),
          )}
        </Stack>
      )}

      {!loading && !error && (
        <GlassCard sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            This Week
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `90px repeat(7, minmax(96px, 1fr))`,
                gap: 1,
                minWidth: 760,
              }}
            >
              <Box />
              {days.map((d) => (
                <Box key={d.format('YYYY-MM-DD')} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {d.format('ddd D')}
                  </Typography>
                </Box>
              ))}
              {SLOTS.map((slot) => (
                <Fragment key={slot.key}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <slot.icon sx={{ fontSize: 16, color: slot.color }} />
                    <Typography variant="caption" fontWeight={700}>
                      {slot.label}
                    </Typography>
                  </Stack>
                  {days.map((d) => {
                    const dayItems = reminders.filter(
                      (r) => r.time_of_day === slot.key && isReminderActiveOn(r, d),
                    );
                    return (
                      <Box
                        key={`${slot.key}-${d.format('YYYY-MM-DD')}`}
                        sx={{
                          minHeight: 40,
                          border: `1px dashed ${theme.palette.divider}`,
                          borderRadius: 1.5,
                          p: 0.5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          alignItems: 'center',
                        }}
                      >
                        {dayItems.map((r) => (
                          <Chip
                            key={r.id}
                            label={r.medicine_name}
                            size="small"
                            sx={{
                              maxWidth: '100%',
                              fontSize: 10,
                              height: 20,
                              backgroundImage: theme.custom.gradients.primarySoft,
                              color: 'primary.main',
                            }}
                          />
                        ))}
                      </Box>
                    );
                  })}
                </Fragment>
              ))}
            </Box>
          </Box>
        </GlassCard>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle fontWeight={800}>{editing ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <Controller
                name="medicine_name"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Medicine name"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error ? 'Medicine name is required' : ''}
                  />
                )}
              />
              <Controller
                name="time_of_day"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Time of day" fullWidth>
                    <MenuItem value="morning">Morning</MenuItem>
                    <MenuItem value="afternoon">Afternoon</MenuItem>
                    <MenuItem value="night">Night</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="reminder_time"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="time" label="Reminder time" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
              <Stack direction="row" spacing={2}>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="date" label="Start date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                  )}
                />
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="date" label="End date (optional)" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                  )}
                />
              </Stack>
              {editing && (
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">Active</Typography>
                      <Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                    </Stack>
                  )}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <GradientButton
              type="button"
              onClick={closeDialog}
              sx={{ backgroundImage: 'none', bgcolor: 'action.hover', color: 'text.primary', boxShadow: 'none' }}
            >
              Cancel
            </GradientButton>
            <GradientButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Reminder'}
            </GradientButton>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
