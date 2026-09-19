import React from 'react';
import { Box, Typography } from '@mui/material';

// Two-line label/value block used inside the meta band and settings tabs.
function KeyValueRow({ label, value, mono = false }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        className={mono ? 'stos-mono' : undefined}
        sx={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          color: 'text.primary',
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default KeyValueRow;
