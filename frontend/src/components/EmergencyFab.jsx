import { Fab, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { useNavigate } from 'react-router-dom';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.55); }
  70% { box-shadow: 0 0 0 18px rgba(239,68,68,0); }
  100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
`;

const PulsingFab = styled(Fab)({
  position: 'fixed',
  right: 24,
  bottom: 24,
  zIndex: 1300,
  color: '#fff',
  backgroundImage: 'linear-gradient(135deg,#EF4444 0%,#DC2626 100%)',
  animation: `${pulse} 2.2s infinite`,
  '&:hover': {
    backgroundImage: 'linear-gradient(135deg,#DC2626 0%,#B91C1C 100%)',
  },
});

/** Floating red pulsing action button that routes to /emergency. */
export default function EmergencyFab() {
  const navigate = useNavigate();

  return (
    <Tooltip title="Emergency symptom check" placement="left">
      <PulsingFab onClick={() => navigate('/emergency')} aria-label="emergency check">
        <LocalHospitalRoundedIcon />
      </PulsingFab>
    </Tooltip>
  );
}
