import { IconButton, Tooltip } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import { useThemeMode } from '../context/ThemeModeContext';

const ICONS = {
  light: LightModeRoundedIcon,
  dark: DarkModeRoundedIcon,
  system: SettingsBrightnessRoundedIcon,
};

const LABELS = {
  light: 'Light theme — click for dark',
  dark: 'Dark theme — click for system',
  system: 'System theme — click for light',
};

/** Icon button that cycles light -> dark -> system -> light. */
export default function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  const Icon = ICONS[mode] || ICONS.system;

  return (
    <Tooltip title={LABELS[mode] || 'Toggle theme'}>
      <IconButton onClick={toggle} color="inherit" aria-label="toggle color theme">
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
