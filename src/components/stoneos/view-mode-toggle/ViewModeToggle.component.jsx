import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { ViewListOutlined, GridViewOutlined } from '@mui/icons-material';

const DEFAULT_OPTIONS = [
  { value: 'list', label: 'List', icon: <ViewListOutlined /> },
  { value: 'grid', label: 'Grid', icon: <GridViewOutlined /> },
];

// Segmented icon toggle in the StoneOS segmented-control style. options: [{ value, label, icon }]
function ViewModeToggle({ value = 'list', onChange, options = DEFAULT_OPTIONS, label = 'View mode', sx = {} }) {
  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = options[(index + step + options.length) % options.length];
    onChange?.(next.value);
  };

  return (
    <Box
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 28,
        p: '2px',
        gap: '2px',
        borderRadius: '7px',
        backgroundColor: 'var(--stos-bg-muted)',
        ...sx,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Tooltip key={option.value} title={option.label}>
            <Box
              component="button"
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              tabIndex={selected ? 0 : -1}
              onClick={selected ? undefined : () => onChange?.(option.value)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 24,
                p: 0,
                border: 0,
                borderRadius: '5px',
                cursor: selected ? 'default' : 'pointer',
                color: selected ? 'text.primary' : 'text.tertiary',
                backgroundColor: selected ? 'background.paper' : 'transparent',
                boxShadow: selected ? '0 1px 2px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)' : 'none',
                transition: 'color 120ms ease-in-out, background-color 120ms ease-in-out',
                '&:hover': { color: 'text.primary' },
                '&:focus-visible': { outline: '2px solid var(--stos-brand-edge)', outlineOffset: 1 },
                '& svg': { fontSize: 16 },
              }}
            >
              {option.icon}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

export default ViewModeToggle;
