import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Primary call-to-action button styled with the brand gradient plus a
 * subtle lift-and-glow hover micro-interaction.
 */
const GradientButton = styled(Button)(({ theme }) => ({
  backgroundImage: theme.custom?.gradients?.primary,
  color: '#fff',
  borderRadius: 14,
  paddingInline: 28,
  paddingBlock: 12,
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: '0 10px 26px rgba(14,124,134,0.35)',
  transition: 'transform .25s ease, box-shadow .25s ease, filter .25s ease',
  '&:hover': {
    backgroundImage: theme.custom?.gradients?.primary,
    transform: 'translateY(-2px) scale(1.015)',
    boxShadow: '0 14px 34px rgba(14,124,134,0.45)',
    filter: 'brightness(1.05)',
  },
  '&:active': {
    transform: 'translateY(0) scale(0.99)',
  },
  '&.Mui-disabled': {
    backgroundImage: 'none',
    color: theme.palette.text.disabled,
  },
}));

export default GradientButton;
