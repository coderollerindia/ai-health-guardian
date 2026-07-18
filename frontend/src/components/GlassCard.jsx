import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Glassmorphism wrapper around MUI Paper: translucent background,
 * backdrop blur, subtle border, generous rounding and a soft layered shadow.
 * Use like a regular <Paper>/<Card> — accepts `sx`, `elevation`, etc.
 */
const GlassCard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.custom?.glass?.background,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: theme.custom?.glass?.border,
  borderRadius: 20,
  boxShadow: theme.custom?.glass?.shadow,
  padding: theme.spacing(3),
  transition: 'transform .25s ease, box-shadow .25s ease',
}));

export default function (props) {
  return <GlassCard elevation={0} {...props} />;
}
