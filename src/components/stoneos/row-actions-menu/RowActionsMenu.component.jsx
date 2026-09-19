import React, { useState } from 'react';
import { Button, ButtonGroup, Divider, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';

// items: [{ id, label, icon, onClick, danger, disabled, hidden, dividerBefore }]
// copyActions: [{ id, label, onClick }] — rendered as the leading button group.
function RowActionsMenu({
  items = [],
  copyActions = [],
  label = 'Options',
  size = 'small',
  className,
  sx = {},
}) {
  const [anchor, setAnchor] = useState(null);

  const shown = items.filter((item) =>
    typeof item.hidden === 'function' ? !item.hidden() : !item.hidden,
  );
  const cleaned = shown.filter((item, index) => !item.dividerBefore || index > 0);

  if (!cleaned.length && !copyActions.length) return null;

  const close = () => setAnchor(null);

  const run = (item) => {
    close();
    item.onClick?.();
  };

  return (
    <>
      <Tooltip title={label} arrow>
        <IconButton
          size={size}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={anchor ? 'true' : 'false'}
          className={className}
          onClick={(event) => {
            event.stopPropagation();
            setAnchor(event.currentTarget);
          }}
          sx={{ color: 'text.tertiary', ...sx }}
        >
          <MoreIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        onClick={(event) => event.stopPropagation()}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ className: 'stos-row-menu' }}
      >
        {copyActions.length > 0 && (
          <MenuItem
            disableRipple
            sx={{ cursor: 'default', '&:hover': { backgroundColor: 'transparent' } }}
          >
            <ButtonGroup variant="outlined" size="small" aria-label={label}>
              {copyActions.map((action) => (
                <Button key={action.id} onClick={() => run(action)}>
                  {action.label}
                </Button>
              ))}
            </ButtonGroup>
          </MenuItem>
        )}

        {cleaned.map((item) => [
          item.dividerBefore ? (
            <Divider key={`${item.id}-divider`} component="li" sx={{ my: 0.5 }} />
          ) : null,
          <MenuItem
            key={item.id}
            disabled={item.disabled}
            className={item.danger ? 'stos-action--danger' : undefined}
            onClick={() => run(item)}
          >
            {item.icon}
            {item.label}
          </MenuItem>,
        ])}
      </Menu>
    </>
  );
}

export default RowActionsMenu;
