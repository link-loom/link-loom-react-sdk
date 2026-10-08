import React from 'react';
import { Box, Typography } from '@mui/material';
import { HistoryToggleOffOutlined as SavedCopyIcon } from '@mui/icons-material';
import { resolveListLabels } from './listSurface.labels.js';

// Shown when a list answers from the last copy it loaded because the data layer cannot be reached.
function SavedCopyNotice({ visible, labels, locale = 'en' }) {
  if (!visible) {
    return null;
  }

  return (
    <Box role="status" className="stos-saved-copy">
      <SavedCopyIcon sx={{ fontSize: 16 }} />
      <Typography variant="caption" component="span">
        {resolveListLabels(labels, locale).savedCopy}
      </Typography>
    </Box>
  );
}

export default SavedCopyNotice;
