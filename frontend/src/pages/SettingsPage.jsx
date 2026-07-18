import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import { getHistory } from '../services/historyService';
import { jsPDF } from 'jspdf';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

function SectionCard({ title, icon, children }) {
  return (
    <GlassCard sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Stack direction="row" spacing={1.25} sx={{ mb: 2.5 , alignItems: "center"}}>
        {icon}
        <Typography variant="subtitle1" fontWeight={800}>
          {title}
        </Typography>
      </Stack>
      {children}
    </GlassCard>
  );
}

export default function SettingsPage() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode, setMode } = useThemeMode();

  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const currentLangCode = LANGUAGES.some((l) => l.code === i18n.language) ? i18n.language : 'en';

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const history = await getHistory({});
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-health-guardian-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err?.response?.data?.detail || 'Could not export your data right now.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    setExportError(null);
    try {
      const { items = [] } = await getHistory({});
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 48;
      let y = 56;

      const ensureSpace = (needed) => {
        if (y + needed > pageHeight - 48) {
          doc.addPage();
          y = 56;
        }
      };

      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('AI Health Guardian — History Export', marginX, y);
      y += 20;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(110, 110, 110);
      doc.text(
        `${user?.email || ''}  •  Generated ${new Date().toLocaleString()}`,
        marginX,
        y,
      );
      doc.setTextColor(20, 20, 20);
      y += 24;

      if (items.length === 0) {
        doc.setFontSize(11);
        doc.text('No prescriptions, bills or reminders yet.', marginX, y);
      }

      const typeLabel = { prescription: 'Prescription', bill: 'Bill', reminder: 'Reminder' };
      const wrapWidth = pageWidth - marginX * 2;

      items.forEach((item, i) => {
        ensureSpace(70);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${i + 1}. ${typeLabel[item.type] || item.type} — ${item.title || 'Untitled'}`, marginX, y);
        y += 16;

        doc.setFontSize(9.5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(110, 110, 110);
        const dateText = item.date ? new Date(item.date).toLocaleDateString() : '';
        doc.text(dateText, marginX, y);
        y += 14;
        doc.setTextColor(20, 20, 20);

        doc.setFontSize(10.5);
        [item.subtitle, item.summary].filter(Boolean).forEach((text) => {
          const lines = doc.splitTextToSize(String(text), wrapWidth);
          ensureSpace(lines.length * 13 + 6);
          doc.text(lines, marginX, y);
          y += lines.length * 13 + 6;
        });

        y += 8;
        if (y < pageHeight - 48) {
          doc.setDrawColor(225, 225, 225);
          doc.line(marginX, y - 4, pageWidth - marginX, y - 4);
        }
      });

      doc.save(`ai-health-guardian-export-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      setExportError(err?.response?.data?.detail || 'Could not export your PDF right now.');
    } finally {
      setExportingPdf(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteConfirmed(false);
    setDeleteDialogOpen(true);
  };

  return (
    <Container maxWidth="md">
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          {t('nav.settings', 'Settings')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your appearance, language, profile and data.
        </Typography>
      </Stack>

      <Stack spacing={3}>
        {/* Appearance */}
        <SectionCard
          title="Appearance"
          icon={
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: theme.custom.gradients.primarySoft,
                color: 'primary.main',
              }}
            >
              <DarkModeRoundedIcon fontSize="small" />
            </Box>
          }
        >
          <ToggleButtonGroup value={mode} exclusive onChange={(_e, val) => val && setMode(val)}>
            <ToggleButton value="light">
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <LightModeRoundedIcon fontSize="small" />
                <Typography variant="body2">Light</Typography>
              </Stack>
            </ToggleButton>
            <ToggleButton value="dark">
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <DarkModeRoundedIcon fontSize="small" />
                <Typography variant="body2">Dark</Typography>
              </Stack>
            </ToggleButton>
            <ToggleButton value="system">
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <SettingsBrightnessRoundedIcon fontSize="small" />
                <Typography variant="body2">System</Typography>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
        </SectionCard>

        {/* Language */}
        <SectionCard
          title="Language"
          icon={
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: theme.custom.gradients.primarySoft,
                color: 'primary.main',
              }}
            >
              <TranslateRoundedIcon fontSize="small" />
            </Box>
          }
        >
          <ToggleButtonGroup
            value={currentLangCode}
            exclusive
            onChange={(_e, val) => val && i18n.changeLanguage(val)}
          >
            {LANGUAGES.map((lang) => (
              <ToggleButton key={lang.code} value={lang.code}>
                {lang.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </SectionCard>

        {/* Profile */}
        <SectionCard
          title="Profile"
          icon={
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: theme.custom.gradients.primarySoft,
                color: 'primary.main',
              }}
            >
              <PersonRoundedIcon fontSize="small" />
            </Box>
          }
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
              src={user?.user_metadata?.avatar_url}
              sx={{ width: 56, height: 56, backgroundImage: theme.custom.gradients.primary, fontSize: 22 }}
            >
              {user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {user?.user_metadata?.full_name || 'Unnamed User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Stack>
        </SectionCard>

        {/* Export Data */}
        <SectionCard
          title="Export Data"
          icon={
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: theme.custom.gradients.primarySoft,
                color: 'primary.main',
              }}
            >
              <DownloadRoundedIcon fontSize="small" />
            </Box>
          }
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download a copy of your prescription, bill and reminder history — as raw JSON, or as a
            readable PDF report.
          </Typography>
          {exportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {exportError}
            </Alert>
          )}
          <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
            <GradientButton
              onClick={handleExport}
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <DownloadRoundedIcon />}
            >
              {exporting ? 'Exporting...' : 'Export My Data (JSON)'}
            </GradientButton>
            <Button
              variant="outlined"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              startIcon={
                exportingPdf ? <CircularProgress size={16} /> : <PictureAsPdfRoundedIcon />
              }
            >
              {exportingPdf ? 'Generating...' : 'Export as PDF'}
            </Button>
          </Stack>
        </SectionCard>

        {/* Delete Account */}
        <SectionCard
          title="Delete Account"
          icon={
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'error.main',
                color: '#fff',
              }}
            >
              <DeleteForeverRoundedIcon fontSize="small" />
            </Box>
          }
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Typography>
          <Button variant="outlined" color="error" startIcon={<DeleteForeverRoundedIcon />} onClick={openDeleteDialog}>
            Delete Account
          </Button>
        </SectionCard>
      </Stack>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
          <WarningAmberRoundedIcon color="error" />
          Delete Account
        </DialogTitle>
        <DialogContent>
          {!deleteConfirmed ? (
            <Typography variant="body2" color="text.secondary">
              This will permanently delete your account, prescriptions, bills, reminders and chat
              history. This action cannot be undone. Are you sure you want to continue?
            </Typography>
          ) : (
            <Alert severity="info">
              Please contact support to complete account deletion. We'll verify your identity and
              remove your data within the timeframe required by law.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          {!deleteConfirmed ? (
            <>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={() => setDeleteConfirmed(true)}>
                Yes, Delete My Account
              </Button>
            </>
          ) : (
            <Button onClick={() => setDeleteDialogOpen(false)} variant="contained">
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
