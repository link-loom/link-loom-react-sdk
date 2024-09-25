import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
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

      <Menu
        dense
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          dense: true,
        }}
        slotProps={{
          paper: {
            sx: { width: 160 },
          },
        }}
      >
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
            <ListItemText>{item.title}</ListItemText>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.name === status.name && <CheckIcon sx={{ color: 'grey.900' }} />}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default StatusSelector;
