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
        minWidth: 0,
        height: '100%',
        boxSizing: 'border-box',
        containerType: 'inline-size',
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25, minWidth: 0 }}>
        <Typography
          variant="h2"
          component="span"
          sx={{
            color,
            maxWidth: '100%',
            fontSize: 'clamp(0.8125rem, 9cqw, 1.5rem)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value ?? '—'}
        </Typography>
        {delta && (
          <Typography variant="caption" sx={{ color: 'text.tertiary', maxWidth: '100%', overflowWrap: 'anywhere' }}>
            {delta}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default KpiTile;
