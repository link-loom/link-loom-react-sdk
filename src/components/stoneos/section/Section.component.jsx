import React from 'react';
import { Box, Typography } from '@mui/material';

// A surface: paper, one hairline, radius 8, no shadow. variant: "card" · "plain".
function Section({
  title,
  count,
  description,
  actions,
  variant = 'card',
  dense = false,
  padding,
  maxBodyHeight,
  headerSx = {},
  sx = {},
  children,
  ...rest
}) {
  const isCard = variant === 'card';
  const bodyPadding = padding ?? (dense ? 1 : 2);
  const hasHeader = Boolean(title || actions || description);

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: isCard ? 'background.paper' : 'transparent',
        ...(isCard ? { '--stos-table-surface': 'var(--stos-bg-surface)' } : {}),
        border: isCard ? 1 : 0,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}
      {...rest}
    >
      {hasHeader && (
        <Box sx={{ px: 2, pt: 1.5, pb: 1, ...headerSx }}>
          {(title || typeof count === 'number' || actions) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {title && (
                <Typography variant="h6" component="h2" noWrap>
                  {title}
                </Typography>
              )}
              {typeof count === 'number' && (
                <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
                  {count}
                </Typography>
              )}
              {actions && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {actions}
                </Box>
              )}
            </Box>
          )}

          {description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {description}
            </Typography>
          )}
        </Box>
      )}

      <Box
        sx={{
          p: bodyPadding,
          pt: hasHeader ? 0 : bodyPadding,
          ...(maxBodyHeight
            ? { maxHeight: maxBodyHeight, overflowY: 'auto', overflowX: 'hidden' }
            : {}),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Section;
