import React, { useState } from 'react';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import { STOS_PRIORITY_COLORS } from '../theme/stoneos.constants.js';
import { STOS_PRIORITY_LABELS, resolvePriorityPresentation } from '../theme/presentation.js';
import EmptyValue from '../empty-value/EmptyValue.component.jsx';

const DEFAULT_OPTIONS = Object.keys(STOS_PRIORITY_COLORS).map((name) => ({
  name,
  title: STOS_PRIORITY_LABELS[name],
  color: STOS_PRIORITY_COLORS[name],
}));

// Priority as a dot + label. `interactive` opens the catalog (`options` defaults to the four built-ins).
function PriorityPill({
  priority,
  size = 'md',
  showLabel = true,
  interactive = false,
  options,
  labels = STOS_PRIORITY_LABELS,
  emptyLabel,
  onSelect,
  onClick,
  sx = {},
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const presentation = resolvePriorityPresentation(priority, labels);
  const isSmall = size === 'sm';
  const catalog = options || DEFAULT_OPTIONS;

  const open = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const menu = interactive ? (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
      onClick={(event) => event.stopPropagation()}
      disableScrollLock
    >
      {catalog.map((item) => (
        <MenuItem
          key={item.name}
          selected={item.name === presentation?.key}
          onClick={() => {
            setAnchorEl(null);
            onSelect?.(item);
          }}
          sx={{ gap: 1 }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: item.color || STOS_PRIORITY_COLORS[item.name],
              flexShrink: 0,
            }}
          />
          <Typography variant="body1" component="span">
            {item.title || labels[item.name] || item.name}
          </Typography>
        </MenuItem>
      ))}
    </Menu>
  ) : null;

  if (!presentation) {
    return (
      <>
        <EmptyValue
          kind="priority"
          label={emptyLabel}
          interactive={interactive}
          showLabel={showLabel}
          size={size}
          onClick={interactive ? open : onClick}
        />
        {menu}
      </>
    );
  }

  return (
    <>
      <Box
        component={interactive ? 'button' : 'span'}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? open : onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          height: isSmall ? 20 : 22,
          px: showLabel ? (isSmall ? 0.75 : 1) : 0.5,
          borderRadius: 1,
          border: 0,
          background: 'transparent',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 500,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          cursor: interactive ? 'pointer' : 'default',
          '&:hover': interactive ? { backgroundColor: 'action.hover' } : undefined,
          ...sx,
        }}
        title={showLabel ? undefined : presentation.title}
      >
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: presentation.color,
            flexShrink: 0,
          }}
        />
        {showLabel && <Box component="span">{presentation.title}</Box>}
      </Box>

      {menu}
    </>
  );
}

export default PriorityPill;
