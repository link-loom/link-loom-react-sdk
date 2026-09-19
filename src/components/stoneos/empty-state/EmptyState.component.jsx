import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  InboxOutlined,
  SearchOffOutlined,
  ViewKanbanOutlined,
  AccountTreeOutlined,
  ErrorOutlineOutlined,
  FolderOpenOutlined,
  RefreshOutlined,
} from '@mui/icons-material';

const ILLUSTRATIONS = {
  inbox: InboxOutlined,
  search: SearchOffOutlined,
  board: ViewKanbanOutlined,
  tree: AccountTreeOutlined,
  folder: FolderOpenOutlined,
  error: ErrorOutlineOutlined,
};

// An icon in a tinted circle, an h5, a body2, an optional action. size: "page" | "inline"; variant: "default" | "error".
function EmptyState({
  icon,
  illustration = 'inbox',
  title,
  description,
  action,
  size = 'page',
  variant = 'default',
  sx = {},
}) {
  const isError = variant === 'error';
  const Illustration = ILLUSTRATIONS[isError ? 'error' : illustration] || InboxOutlined;
  const tone = isError ? 'var(--stos-danger, #e5484d)' : 'var(--stos-brand, #3c4876)';
  const isInline = size === 'inline';

  return (
    <Box
      role={isError ? 'alert' : undefined}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: isInline ? 0.75 : 1,
        py: isInline ? 3 : 6,
        px: 2,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isInline ? 40 : 56,
          height: isInline ? 40 : 56,
          borderRadius: '50%',
          color: tone,
          backgroundColor: `color-mix(in srgb, ${tone} 10%, var(--stos-bg-surface, white))`,
          '& svg': { fontSize: isInline ? 20 : 28 },
        }}
      >
        {icon || <Illustration />}
      </Box>

      {title && (
        <Typography variant="h5" component="p" sx={{ mt: isInline ? 0.5 : 1 }}>
          {title}
        </Typography>
      )}

      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
          {description}
        </Typography>
      )}

      {action && (
        <Button
          size="small"
          variant={isError ? 'outlined' : 'contained'}
          startIcon={action.icon || (isError ? <RefreshOutlined /> : undefined)}
          onClick={action.onClick}
          sx={{ mt: 1 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;
