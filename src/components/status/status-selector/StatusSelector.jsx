import React, { useState } from 'react';
import { IconButton, MenuList, MenuItem, ListItemIcon, ListItemIcon, ListItemText } from '@mui/material';
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

      <MenuList dense anchorEl={anchorEl} open={open} onClose={handleClose}>
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
            <section className="d-flex w-100 align-items-center">
              <ListItemIcon className="me-2">
                <RadioButtonCheckedIcon sx={{ color: item.color }} />
              </ListItemIcon>

              <div className="flex-grow-1 me-4">
                <ListItemText primary={item.title} />
              </div>

              <div className="ms-auto">
                {item.name === status.name && <CheckIcon sx={{ color: item.color }} />}
              </div>
            </section>
          </MenuItem>
        ))}
      </MenuList>
    </>
  );
}

export default StatusSelector;
