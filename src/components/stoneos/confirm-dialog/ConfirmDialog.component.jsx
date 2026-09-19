import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

// A MUI Dialog (not PopUp) so it nests correctly over a detail modal.
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  extraAction = null,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog
      open={Boolean(open)}
      onClose={busy ? undefined : onClose}
      maxWidth={extraAction ? 'sm' : 'xs'}
      fullWidth
      disableScrollLock
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h4" component="span">
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {typeof description === 'string' ? (
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        ) : (
          description
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={busy}
          sx={{ color: 'text.secondary' }}
        >
          {cancelLabel}
        </Button>

        {extraAction && (
          <Box component="span" sx={{ display: 'inline-flex' }}>
            {extraAction}
          </Box>
        )}

        <Button
          variant="contained"
          color={danger ? 'error' : 'primary'}
          onClick={onConfirm}
          disabled={busy}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
