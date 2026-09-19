import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  PersonAddAltOutlined as PersonAddIcon,
  CalendarTodayOutlined as CalendarIcon,
  FolderOutlined as FolderIcon,
  LabelOutlined as LabelIcon,
  WorkspacesOutlined as WorkspaceIcon,
} from '@mui/icons-material';

const KIND_ICONS = {
  assignee: PersonAddIcon,
  date: CalendarIcon,
  project: FolderIcon,
  workspace: WorkspaceIcon,
  type: LabelIcon,
};

const DEFAULT_LABELS = {
  assignee: 'Unassigned',
  priority: 'No priority',
  date: 'No due date',
  project: 'No project',
  workspace: 'No workspace',
  type: 'No type',
  stage: 'No status',
  text: '—',
};

// The visual default of every cell or property without a value.
function EmptyValue({
  kind = 'text',
  label,
  interactive = false,
  showLabel = true,
  onClick,
  size = 'md',
  sx = {},
}) {
  const Icon = KIND_ICONS[kind];
  const text = label ?? DEFAULT_LABELS[kind] ?? DEFAULT_LABELS.text;
  const isSmall = size === 'sm';
  const clickable = interactive && typeof onClick === 'function';

  const baseSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    color: 'text.disabled',
    cursor: clickable ? 'pointer' : 'default',
    borderRadius: 1,
    px: clickable ? 0.5 : 0,
    mx: clickable ? -0.5 : 0,
    transition: 'color 120ms, background-color 120ms',
    '&:hover': clickable ? { color: 'text.secondary', backgroundColor: 'action.hover' } : undefined,
    ...sx,
  };

  const labelNode = showLabel && (
    <Typography component="span" variant="body2" sx={{ color: 'inherit' }}>
      {text}
    </Typography>
  );

  if (kind === 'assignee') {
    return (
      <Box component="span" sx={baseSx} onClick={onClick} role={clickable ? 'button' : undefined}>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isSmall ? 20 : 24,
            height: isSmall ? 20 : 24,
            borderRadius: '50%',
            border: '1px dashed',
            borderColor: 'currentColor',
            '& svg': { fontSize: isSmall ? 12 : 14 },
          }}
        >
          <PersonAddIcon />
        </Box>
        {labelNode}
      </Box>
    );
  }

  if (kind === 'priority' || kind === 'stage') {
    return (
      <Box component="span" sx={baseSx} onClick={onClick} role={clickable ? 'button' : undefined}>
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            border: '1.5px solid',
            borderColor: 'currentColor',
          }}
        />
        {labelNode}
      </Box>
    );
  }

  return (
    <Box component="span" sx={baseSx} onClick={onClick} role={clickable ? 'button' : undefined}>
      {Icon && <Icon sx={{ fontSize: isSmall ? 14 : 16 }} />}
      {labelNode}
    </Box>
  );
}

export default EmptyValue;
