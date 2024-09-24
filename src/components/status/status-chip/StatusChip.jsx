import React from 'react';
import Chip from '@mui/material/Chip';

function StatusChip({ status, color }) {
  let chipColor;

  if (color) {
    chipColor = color;
  } else {
    switch (status?.name) {
      case 'deleted':
        chipColor = 'error';
        break;
      case 'inactive':
        chipColor = 'warning';
        break;
      default:
        chipColor = 'primary';
    }
  }

  return <Chip label={status?.title || 'Unknown'} color={chipColor} />;
}

export default StatusChip;
