import React, { useState } from 'react';
import { Box, Chip, InputBase, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import {
  Search as SearchIcon,
  KeyboardArrowDown as ArrowIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

// chips: [{ id, label, icon, active, onClick, onClear, menu: [{ id, label, checked, onClick }], node }]
// search: { value, onChange, placeholder }
function FilterChip({ chip }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const hasMenu = Array.isArray(chip.menu) && chip.menu.length > 0;

  if (chip.node) return chip.node;

  return (
    <>
      <Chip
        size="small"
        variant={chip.active ? 'filled' : 'outlined'}
        icon={chip.icon || undefined}
        deleteIcon={hasMenu ? <ArrowIcon /> : undefined}
        onDelete={
          hasMenu
            ? (event) => setAnchorEl(event.currentTarget.closest('.MuiChip-root'))
            : chip.onClear
        }
        label={chip.label}
        onClick={(event) => {
          if (hasMenu) {
            setAnchorEl(event.currentTarget);
            return;
          }
          chip.onClick?.(event);
        }}
        sx={{
          height: 28,
          fontSize: 12,
          fontWeight: 500,
          border: 1,
          borderStyle: 'solid',
          borderColor: chip.active ? 'var(--stos-brand-edge)' : 'divider',
          color: chip.active ? 'primary.main' : 'text.secondary',
          backgroundColor: chip.active ? 'var(--stos-brand-tint-strong)' : 'background.paper',
          '&:hover': {
            backgroundColor: chip.active ? 'var(--stos-brand-tint-strong)' : 'action.hover',
          },
          borderRadius: 999,
          px: 0.25,
          '& .MuiChip-icon': { fontSize: 15, color: 'inherit', ml: '6px' },
          '& .MuiChip-deleteIcon': { fontSize: 16, color: 'inherit', opacity: 0.7, mr: '4px' },
        }}
      />
      {hasMenu && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          disableScrollLock
        >
          {chip.menu.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => {
                setAnchorEl(null);
                item.onClick?.();
              }}
              selected={Boolean(item.checked)}
            >
              <ListItemIcon sx={{ minWidth: 24, visibility: item.checked ? 'visible' : 'hidden' }}>
                <CheckIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 13 }}>{item.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
}

function FilterBar({ chips = [], search, trailing, sx = {} }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', ...sx }}>
      {chips.filter(Boolean).map((chip) => (
        <FilterChip key={chip.id} chip={chip} />
      ))}

      {(search || trailing) && (
        <Box
          sx={{
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: '1 1 220px',
            maxWidth: { xs: '100%', md: 340 },
          }}
        >
          {search && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                height: 28,
                px: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 999,
                backgroundColor: 'background.paper',
                color: 'text.tertiary',
                flex: 1,
                minWidth: 0,
                '&:focus-within': { borderColor: 'text.disabled' },
              }}
            >
              <SearchIcon sx={{ fontSize: 16 }} />
              <InputBase
                value={search.value || ''}
                onChange={(event) => search.onChange?.(event.target.value)}
                placeholder={search.placeholder || 'Search…'}
                sx={{ fontSize: 12, flex: 1, color: 'text.primary' }}
              />
            </Box>
          )}
          {trailing}
        </Box>
      )}
    </Box>
  );
}

export default FilterBar;
