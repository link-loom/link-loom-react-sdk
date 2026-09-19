import React from 'react';
import { Box, CircularProgress, Tooltip } from '@mui/material';
import {
  CloudDoneOutlined,
  CloudOffOutlined,
  ErrorOutlineOutlined,
  SyncProblemOutlined,
} from '@mui/icons-material';

const DEFAULT_LABELS = {
  saved: 'Saved',
  saving: 'Saving…',
  offline: 'Offline',
  conflict: 'Conflict',
  error: 'Not saved',
};

const DEFAULT_DESCRIPTIONS = {
  saved: 'All changes are saved',
  saving: 'Saving your changes',
  offline: 'Changes are kept on this device and sync when you are back online',
  conflict: 'Someone else changed this; a conflict copy was created',
  error: 'Your last changes could not be saved',
};

const STATUS_TONES = {
  saved: 'text.tertiary',
  saving: 'text.tertiary',
  offline: 'warning.main',
  conflict: 'warning.main',
  error: 'error.main',
};

const STATUS_ICONS = {
  saved: CloudDoneOutlined,
  offline: CloudOffOutlined,
  conflict: SyncProblemOutlined,
  error: ErrorOutlineOutlined,
};

// status: saved | saving | offline | conflict | error
function SyncStatusIndicator({
  status = 'saved',
  labels = {},
  descriptions = {},
  showCaption = true,
  onClick,
  sx = {},
}) {
  const label = { ...DEFAULT_LABELS, ...labels }[status] || DEFAULT_LABELS.saved;
  const description = { ...DEFAULT_DESCRIPTIONS, ...descriptions }[status] || label;
  const Icon = STATUS_ICONS[status];
  const clickable = typeof onClick === 'function';

  return (
    <Tooltip title={description}>
      <Box
        component={clickable ? 'button' : 'span'}
        type={clickable ? 'button' : undefined}
        onClick={onClick}
        role="status"
        aria-live="polite"
        aria-label={label}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          height: 24,
          px: 0.75,
          border: 0,
          borderRadius: 1,
          background: 'transparent',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          color: STATUS_TONES[status] || STATUS_TONES.saved,
          cursor: clickable ? 'pointer' : 'default',
          transition: 'color 120ms ease-in-out, background-color 120ms ease-in-out',
          '&:hover': clickable ? { backgroundColor: 'action.hover' } : undefined,
          '& svg': { fontSize: 16 },
          ...sx,
        }}
      >
        {status === 'saving' ? <CircularProgress size={12} thickness={5} color="inherit" /> : Icon && <Icon />}
        {showCaption && <Box component="span">{label}</Box>}
      </Box>
    </Tooltip>
  );
}

export default SyncStatusIndicator;
