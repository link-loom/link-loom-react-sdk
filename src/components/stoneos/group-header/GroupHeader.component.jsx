import React, { useState } from 'react';
import { Box, Divider, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowRight as CollapseIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import StatusPill from '../status-pill/StatusPill.component.jsx';

// chevron · solid pill · count · "⋯" · "+". The two right controls reveal while the pointer is over `.stos-group`.
function GroupHeader({
  label,
  color,
  stage,
  count,
  pageCount,
  collapsed = false,
  onToggle,
  onAdd,
  menuItems,
  addLabel = 'Add task',
  optionsLabel = 'Group options',
  expandLabel = 'Expand',
  collapseLabel = 'Collapse',
  pageAndTotalLabel = (page, total) => `${page} of ${total}`,
  height = 36,
  sx = {},
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const showBoth =
    typeof count === 'number' && typeof pageCount === 'number' && pageCount !== count;
  const hasMenu = Array.isArray(menuItems) && menuItems.length > 0;

  const quiet = {
    opacity: 0,
    transition: 'opacity 120ms ease-in-out',
    '.stos-group:hover &': { opacity: 1 },
    '&:focus-visible': { opacity: 1 },
    '@media (hover: none), (pointer: coarse)': { opacity: 1 },
  };

  return (
    <Box
      className="stos-group-header"
      sx={{ display: 'flex', alignItems: 'center', gap: 1, height, px: 0.5, ...sx }}
    >
      <IconButton
        size="small"
        onClick={onToggle}
        aria-label={collapsed ? expandLabel : collapseLabel}
        sx={{ color: 'text.tertiary' }}
      >
        {collapsed ? <CollapseIcon /> : <ExpandIcon />}
      </IconButton>

      <StatusPill
        variant="solid"
        stage={stage}
        label={label}
        sx={color ? { backgroundColor: color } : undefined}
      />

      {typeof (pageCount ?? count) === 'number' && (
        <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
          {showBoth ? pageAndTotalLabel(pageCount, count) : (pageCount ?? count)}
        </Typography>
      )}

      {hasMenu && (
        <Tooltip title={optionsLabel} arrow>
          <IconButton
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            aria-label={optionsLabel}
            sx={{ color: 'text.tertiary', ...quiet, ...(menuAnchor ? { opacity: 1 } : {}) }}
          >
            <MoreIcon />
          </IconButton>
        </Tooltip>
      )}

      {onAdd && (
        <Tooltip title={addLabel} arrow>
          <IconButton
            size="small"
            onClick={onAdd}
            aria-label={addLabel}
            sx={{ color: 'text.tertiary', ...quiet }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}

      {hasMenu && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          disableScrollLock
        >
          {menuItems.map((item) => [
            item.dividerBefore ? <Divider key={`${item.id}-divider`} sx={{ my: 0.5 }} /> : null,
            <MenuItem
              key={item.id}
              disabled={item.disabled}
              onClick={() => {
                setMenuAnchor(null);
                item.onClick?.();
              }}
              sx={{ gap: 1 }}
            >
              {item.icon && <item.icon sx={{ fontSize: 16 }} />}
              {item.label}
            </MenuItem>,
          ])}
        </Menu>
      )}
    </Box>
  );
}

export default GroupHeader;
