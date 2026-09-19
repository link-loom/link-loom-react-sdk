import React from 'react';
import { Box } from '@mui/material';
import { resolveTypePresentation } from '../theme/presentation.js';
import EmptyValue from '../empty-value/EmptyValue.component.jsx';

// A neutral outlined tag (11/500, hairline). Never a dark-filled chip.
function TypeTag({ type, size = 'md', emptyLabel, sx = {} }) {
  const presentation = resolveTypePresentation(type);
  if (!presentation) return <EmptyValue kind="type" size={size} label={emptyLabel} />;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: size === 'sm' ? 18 : 20,
        px: 0.75,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        color: 'text.secondary',
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {presentation.title}
    </Box>
  );
}

export default TypeTag;
