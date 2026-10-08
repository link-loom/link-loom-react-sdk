import React from 'react';
import { Button, Tooltip } from '@mui/material';

// A header action ({ label, icon, onClick, disabled }). While it is disabled because the app is offline, the
// tooltip says what to do.
function ListActionButton({ action, variant = 'contained', offlineReason }) {
  return (
    <Tooltip title={action.disabled && offlineReason ? offlineReason : ''}>
      <span>
        <Button variant={variant} startIcon={action.icon} onClick={action.onClick} disabled={action.disabled}>
          {action.label}
        </Button>
      </span>
    </Tooltip>
  );
}

export default ListActionButton;
