import React from 'react';
import { Box, Typography } from '@mui/material';

const TONES = {
  default: 'text.primary',
  brand: 'primary.main',
  success: 'success.main',
  warning: 'warning.main',
  danger: 'error.main',
  info: 'info.main',
  muted: 'text.tertiary',
};

// A number with a label: h2 value in the tone's colour, overline label.
function KpiTile({ label, value, tone = 'default', icon, delta, onClick, active = false, sx = {} }) {
  const color = TONES[tone] || TONES.default;
  const clickable = typeof onClick === 'function';

  return (
    <Box
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-pressed={clickable ? active : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (event) => (event.key === 'Enter' || event.key === ' ') && onClick(event)
          : undefined
      }
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 2,
        minWidth: 120,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: active ? color : 'divider',
        borderRadius: 2,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'border-color 120ms',
        '&:hover': clickable ? { borderColor: active ? color : 'text.disabled' } : undefined,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && (
          <Box sx={{ display: 'inline-flex', color: 'text.tertiary', '& svg': { fontSize: 16 } }}>
            {icon}
          </Box>
        )}
        <Typography variant="overline" sx={{ color: 'text.tertiary' }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="h2" component="span" sx={{ color }}>
          {value ?? '—'}
        </Typography>
        {delta && (
          <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
            {delta}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default KpiTile;
