import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import PublicLayout from '../layouts/PublicLayout';
import ProtectedRoute from './ProtectedRoute';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const PrescriptionScannerPage = lazy(() => import('../pages/PrescriptionScannerPage'));
const BillScannerPage = lazy(() => import('../pages/BillScannerPage'));
const ChatPage = lazy(() => import('../pages/ChatPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const RemindersPage = lazy(() => import('../pages/RemindersPage'));
const EmergencyPage = lazy(() => import('../pages/EmergencyPage'));
const HealthScorePage = lazy(() => import('../pages/HealthScorePage'));
const InsightsPage = lazy(() => import('../pages/InsightsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <CircularProgress size={36} thickness={4} />
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scanner/prescription" element={<PrescriptionScannerPage />} />
          <Route path="/scanner/bill" element={<BillScannerPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/health-score" element={<HealthScorePage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
