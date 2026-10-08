import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { LockOutlined as ReadOnlyIcon } from '@mui/icons-material';

// A notice above the band of a record: what its state means for the person (it cannot be changed, it
// waits for a decision, data is missing) and the way forward when there is one. `actions` are buttons
// [{ id, label, onClick, disabled, variant, color }]; `action` is the single text button of a read-only
// notice. The lock is the icon of a record that cannot be changed. `tone`: 'muted' | 'warning'.
function ReadOnlyNotice({ message, action, actions = [], icon, tone = 'muted' }) {
  const buttons = action ? [{ id: 'action', variant: 'text', ...action }, ...actions] : actions;

  return (
    <Box role="status" className={`stos-readonly-notice stos-readonly-notice--${tone}`}>
      {icon || <ReadOnlyIcon sx={{ fontSize: 16 }} />}
      <Typography variant="body2" component="span" sx={{ flex: 1, minWidth: 0 }}>
        {message}
      </Typography>
      {buttons.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {buttons.map((button) => (
            <Button
              key={button.id}
              size="small"
              variant={button.variant || 'text'}
              color={button.color || 'primary'}
              onClick={button.onClick}
              disabled={button.disabled}
            >
              {button.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default ReadOnlyNotice;
