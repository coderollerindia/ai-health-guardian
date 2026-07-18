import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  Typography,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import NoFoodRoundedIcon from '@mui/icons-material/NoFoodRounded';

function TimingIcon({ active }) {
  return active ? (
    <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
  ) : (
    <RemoveCircleOutlineRoundedIcon fontSize="small" sx={{ color: 'text.disabled', opacity: 0.5 }} />
  );
}

function TruncatedList({ items }) {
  if (!items || items.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  }
  const summary = items.length > 1 ? `${items[0]} +${items.length - 1} more` : items[0];
  return (
    <Tooltip title={items.join(', ')} arrow placement="top">
      <Typography variant="body2" sx={{ maxWidth: 180, cursor: 'help' }} noWrap>
        {summary}
      </Typography>
    </Tooltip>
  );
}

/**
 * Reusable medicine schedule table used by the Prescription Scanner result view.
 * Expects an array of medicine objects matching the PrescriptionAnalysis.medicines
 * shape from docs/ARCHITECTURE.md. Rows whose `unclear` flag is true get a
 * warning-tinted background and a flag icon next to the medicine name.
 */
export default function MedicineTable({ medicines = [] }) {
  if (!medicines.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No medicines were detected in this prescription.
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ borderRadius: 3, overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 800 }}>Medicine</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Purpose</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Dosage</TableCell>
            <TableCell align="center" sx={{ fontWeight: 800 }}>
              Morning
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 800 }}>
              Afternoon
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 800 }}>
              Night
            </TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Food</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Duration</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Side Effects</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {medicines.map((med, i) => (
            <TableRow
              key={`${med.name}-${i}`}
              sx={{
                bgcolor: med.unclear ? (theme) => alpha(theme.palette.warning.main, 0.12) : 'transparent',
                '&:hover': {
                  bgcolor: med.unclear
                    ? (theme) => alpha(theme.palette.warning.main, 0.2)
                    : 'action.hover',
                },
              }}
            >
              <TableCell>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  {med.unclear && (
                    <Tooltip title="Handwriting unclear — please verify with your doctor/pharmacist" arrow>
                      <WarningAmberRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} />
                    </Tooltip>
                  )}
                  <Typography variant="body2" fontWeight={700}>
                    {med.name || 'Unnamed medicine'}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {med.purpose || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{med.dosage || '—'}</Typography>
              </TableCell>
              <TableCell align="center">
                <TimingIcon active={med.morning} />
              </TableCell>
              <TableCell align="center">
                <TimingIcon active={med.afternoon} />
              </TableCell>
              <TableCell align="center">
                <TimingIcon active={med.night} />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap" }}>
                  {med.before_food && (
                    <Chip
                      size="small"
                      icon={<NoFoodRoundedIcon />}
                      label="Before food"
                      sx={{ bgcolor: 'info.main', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
                    />
                  )}
                  {med.after_food && (
                    <Chip
                      size="small"
                      icon={<RestaurantRoundedIcon />}
                      label="After food"
                      sx={{ bgcolor: 'success.main', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
                    />
                  )}
                  {!med.before_food && !med.after_food && (
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{med.duration || '—'}</Typography>
              </TableCell>
              <TableCell>
                <TruncatedList items={med.side_effects} />
              </TableCell>
              <TableCell>
                <Box sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {med.important_notes || '—'}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
