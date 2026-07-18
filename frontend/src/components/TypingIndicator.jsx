import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const dotVariants = {
  animate: (i) => ({
    y: [0, -6, 0],
    opacity: [0.4, 1, 0.4],
    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 },
  }),
};

/**
 * Animated 3-dot "AI is typing" indicator. Reusable inside chat bubbles,
 * loading states for AI analysis, etc.
 */
export default function TypingIndicator({ size = 8, color = 'currentColor' }) {
  return (
    <Box
      role="status"
      aria-label="AI is typing"
      sx={{ display: 'inline-flex', gap: 0.75, alignItems: 'center', px: 1, py: 0.5 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          custom={i}
          variants={dotVariants}
          animate="animate"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
          }}
        />
      ))}
    </Box>
  );
}
