import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';

/**
 * Gate for all authenticated routes. Shows a centered spinner while the
 * Supabase session is resolving, redirects to /login when unauthenticated,
 * otherwise renders the AppLayout shell (which itself renders <Outlet/>
 * for the nested protected page).
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}
