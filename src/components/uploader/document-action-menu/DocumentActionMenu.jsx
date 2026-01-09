import React, { useState } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

const DocumentActionMenu = ({ file, itemOnAction, actions }) => {
  const [activeAnchorEl, setActiveAnchorEl] = useState(null);

  const handleMenu = (event) => {
    if (event) {
      setActiveAnchorEl(event.currentTarget);
    } else {
      setActiveAnchorEl(null);
    }
  };

  const isMenuActive = actions.every((item) => item.disabled === true);

  return (
    !isMenuActive && (
      <section className="ml-auto">
        <IconButton disableRipple aria-label="settings" onClick={handleMenu}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          id={'basic-menu-' + file?.filename}
          anchorEl={activeAnchorEl}
          open={Boolean(activeAnchorEl)}
          onClose={() => handleMenu()}
        >
          {actions?.map(
            ({ action, title, disabled }) =>
              !disabled && (
                <MenuItem
                  key={action}
                  onClick={() => {
                    handleMenu();
                    itemOnAction(action, file);
                  }}
                >
                  {title}
                </MenuItem>
              ),
          )}
        </Menu>
      </section>
    )
  );
};

export default DocumentActionMenu;
