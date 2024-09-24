import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckIcon from '@mui/icons-material/Check';

function StatusSelector({ status, statuses, size, statusSelected }) {
  const defaultColor = '#B0BEC5';
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size={size} sx={{ color: status.color || defaultColor }} onClick={handleClick}>
        <RadioButtonCheckedIcon fontSize={size} />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {Object.values(statuses).map((item) => (
          <MenuItem
            key={item.id}
            onClick={() => {
              handleClose();

              if (statusSelected) {
                statusSelected(item);
              }
            }}
          >
            <ListItemIcon>
              <RadioButtonCheckedIcon sx={{ color: item.color }} />
            </ListItemIcon>
            <ListItemText primary={item.title} />
            {item.name === status.name && <CheckIcon sx={{ color: item.color }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default StatusSelector;
