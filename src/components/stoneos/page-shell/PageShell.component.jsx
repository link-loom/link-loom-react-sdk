import React from 'react';
import { Box } from '@mui/material';
import { STOS_PAGE_WIDTHS } from '../theme/stoneos.constants.js';

// width: "full" (default) · "narrow" (1040) · "default" (1280) · "wide" (1440)
function PageShell({ width = 'full', flush = false, sx = {}, children, ...rest }) {
  const maxWidth = STOS_PAGE_WIDTHS[width] ?? STOS_PAGE_WIDTHS.default;

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        maxWidth: maxWidth === 'none' ? 'none' : maxWidth,
        mx: 'auto',
        px: flush ? 0 : 3,
        py: flush ? 0 : 2,
        minWidth: 0,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

export default PageShell;
