import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

/**
 * Circular 0-100 score gauge built on recharts' RadialBarChart.
 *
 * Color follows value: red (<40) / amber (40-70) / green (>70).
 * Pass `invert` for metrics where LOWER is better (e.g. "risk") — the color
 * scale is flipped so a low risk value reads green and a high one reads red,
 * while the number displayed is still the raw value.
 */
export default function ScoreGauge({ value = 0, label, size = 140, invert = false, thickness = '32%' }) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const effective = invert ? 100 - clamped : clamped;
  const color =
    effective < 40 ? theme.palette.error.main : effective <= 70 ? theme.palette.warning.main : theme.palette.success.main;

  const data = [{ value: clamped, fill: color }];
  const fontSize = size >= 180 ? '2.2rem' : size >= 120 ? '1.35rem' : '1rem';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: size, height: size, position: 'relative' }}>
        <RadialBarChart
          width={size}
          height={size}
          data={data}
          innerRadius={`${100 - parseInt(thickness, 10)}%`}
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={parseInt(thickness, 10) * (size / 100)}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={999}
            background={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(11,31,42,0.08)' }}
            fill={color}
            isAnimationActive
          />
        </RadialBarChart>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{ fontSize, fontWeight: 800, lineHeight: 1 }}>{Math.round(clamped)}</Typography>
          <Typography variant="caption" color="text.secondary">
            / 100
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography variant="body2" fontWeight={700} textAlign="center">
          {label}
        </Typography>
      )}
    </Box>
  );
}
