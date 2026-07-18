import { Box, Skeleton, Stack } from '@mui/material';
import GlassCard from './GlassCard';

/** Skeleton placeholder for a glass card of content (title + a few lines). */
export function CardSkeleton({ count = 1, lines = 3 }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard key={i} sx={{ p: 3 }}>
          <Skeleton variant="rounded" height={22} width="45%" sx={{ mb: 2 }} />
          {Array.from({ length: lines }).map((__, li) => (
            <Skeleton
              key={li}
              variant="rounded"
              height={14}
              width={li === lines - 1 ? '65%' : '100%'}
              sx={{ mb: 1 }}
            />
          ))}
        </GlassCard>
      ))}
    </Stack>
  );
}

/** Skeleton placeholder for a data table (header row + N body rows). */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={2}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} variant="rounded" height={18} sx={{ flex: 1, opacity: 0.6 }} />
        ))}
      </Stack>
      {Array.from({ length: rows }).map((_, r) => (
        <Stack key={r} direction="row" spacing={2}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} variant="rounded" height={34} sx={{ flex: 1 }} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

export default function LoadingSkeletons() {
  return (
    <Box>
      <CardSkeleton count={1} />
    </Box>
  );
}
