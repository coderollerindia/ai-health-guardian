import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitch from '../components/LanguageSwitch';
import EmergencyFab from '../components/EmergencyFab';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 268;

export default function AppLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: <SpaceDashboardRoundedIcon /> },
    { to: '/scanner/prescription', label: t('nav.prescriptionScanner'), icon: <DocumentScannerRoundedIcon /> },
    { to: '/scanner/bill', label: t('nav.billScanner'), icon: <ReceiptLongRoundedIcon /> },
    { to: '/chat', label: t('nav.aiChat'), icon: <ForumRoundedIcon /> },
    { to: '/history', label: t('nav.history'), icon: <HistoryRoundedIcon /> },
    { to: '/reminders', label: t('nav.reminders'), icon: <AlarmRoundedIcon /> },
    { to: '/emergency', label: t('nav.emergency'), icon: <LocalHospitalRoundedIcon /> },
    { to: '/health-score', label: t('nav.healthScore'), icon: <FavoriteRoundedIcon /> },
    { to: '/insights', label: t('nav.insights'), icon: <InsightsRoundedIcon /> },
    { to: '/settings', label: t('nav.settings'), icon: <SettingsRoundedIcon /> },
  ];

  const handleSignOut = async () => {
    setAnchorEl(null);
    await signOut();
    navigate('/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5, py: 2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            backgroundImage: theme.custom.gradients.primary,
            flexShrink: 0,
          }}
        />
        <Typography variant="subtitle1" fontWeight={800} noWrap>
          {t('app.name', 'AI Health Guardian')}
        </Typography>
      </Toolbar>
      <List sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => !isDesktop && setMobileOpen(false)}
            sx={{
              borderRadius: 2.5,
              mb: 0.5,
              '&.active': {
                backgroundImage: theme.custom.gradients.primarySoft,
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText slotProps={{ primary: { fontWeight: 600 } }} primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backdropFilter: 'blur(16px)',
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(11,16,26,0.72)' : 'rgba(255,255,255,0.72)',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ gap: 0.5 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' }, mr: 1 }}
            aria-label="open navigation"
          >
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitch />
          <ThemeToggle />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }} aria-label="account menu">
            <Avatar
              src={user?.user_metadata?.avatar_url}
              sx={{ width: 34, height: 34, backgroundImage: theme.custom.gradients.primary, fontSize: 15 }}
            >
              {user?.email?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              {t('nav.logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          pt: { xs: 9, md: 11 },
          pb: 6,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>

      <EmergencyFab />
    </Box>
  );
}
