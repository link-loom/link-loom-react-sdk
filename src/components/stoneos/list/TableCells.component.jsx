import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { formatDateTime, formatRelativeTime } from './timestamps.helpers.js';

const EMPTY_CELL = '—';

// Cell of the first column: the name (cut with a tooltip when it does not fit) and, under it, a quiet line.
export function NameCell({ title, subtitle, untitled }) {
  return (
    <Box className="stos-cell stos-cell--stacked">
      <Tooltip title={title || untitled} placement="top-start">
        <Typography variant="subtitle1" noWrap>
          {title || untitled}
        </Typography>
      </Tooltip>
      {subtitle && (
        <Typography variant="caption" noWrap sx={{ color: 'text.tertiary' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

// A cell with one quiet line of text; the tooltip carries the full text when it is cut.
export function TextCell({ value, tooltip, mono = false }) {
  const text = value === undefined || value === null || value === '' ? EMPTY_CELL : String(value);

  return (
    <Box className="stos-cell">
      <Tooltip title={tooltip || (text === EMPTY_CELL ? '' : text)} placement="top-start">
        <Typography
          variant="body2"
          noWrap
          sx={{ color: 'text.secondary', fontFamily: mono ? 'var(--stos-font-mono)' : undefined }}
        >
          {text}
        </Typography>
      </Tooltip>
    </Box>
  );
}

// Time since the record changed, with the full date in the tooltip. `value` is a timestamp (epoch
// milliseconds, an ISO string or a Link Loom log entry).
export function UpdatedCell({ value, locale = 'en', timeZone }) {
  return (
    <Box className="stos-cell">
      <Tooltip title={formatDateTime(value, { locale, timeZone })} placement="top-start">
        <Typography variant="body2" noWrap sx={{ color: 'text.tertiary' }}>
          {formatRelativeTime(value, locale)}
        </Typography>
      </Tooltip>
    </Box>
  );
}

// Cells that hold pills, tags or icons.
export function PillsCell({ children }) {
  return <Box className="stos-cell stos-cell--pills">{children}</Box>;
}
