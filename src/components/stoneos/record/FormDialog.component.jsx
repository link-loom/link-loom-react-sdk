import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { describeError } from '../shared/labels.helpers.js';
import { RECORD_CONTAINER_NAME } from './entityDialog.helpers.js';
import { resolveRecordLabels } from './record.labels.js';

// A short form in a modal of its own (a currency to enable, a unit, a series, a day to declare). It keeps its
// size, shows the refusal in words and closes only when `onSubmit` resolves (unless `closeOnSubmit` is
// false, for a dialog that answers in place). `valid` enables the primary action. The paper is a size
// container (`containerName`), so the narrow-width rules of the app apply inside it. `errorMessage(error)`
// words a refusal in the app's language; without it the error's own message is shown.
function FormDialog({
  open,
  title,
  description,
  submitLabel,
  valid = true,
  danger = false,
  maxWidth = 'sm',
  closeOnSubmit = true,
  cancelLabel,
  onSubmit,
  onClose,
  containerName = RECORD_CONTAINER_NAME,
  errorMessage,
  labels,
  locale = 'en',
  children,
}) {
  // -----------------------------------------------------
  // 1. Hooks
  // -----------------------------------------------------
  const text = resolveRecordLabels(labels, locale);

  // -----------------------------------------------------
  // 3. UI States
  // -----------------------------------------------------
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------------------------------
  // 5. Component Functions
  // -----------------------------------------------------
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSubmit();
      if (closeOnSubmit) {
        onClose();
      }
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
    }
  };

  // -----------------------------------------------------
  // 6. Lifecycle
  // -----------------------------------------------------
  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  // -----------------------------------------------------
  // 7. Render
  // -----------------------------------------------------
  return (
    <Dialog
      open={Boolean(open)}
      onClose={busy ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      disableScrollLock
      PaperProps={{ sx: { containerType: 'inline-size', containerName } }}
    >
      <DialogTitle>
        <Typography variant="h4" component="span">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>{children}</Box>
        {error && (
          <Typography variant="body2" role="alert" sx={{ color: 'error.main', mt: 1.5 }}>
            {describeError(error, { errorMessage, fallback: text.unknownError })}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="text" onClick={onClose} disabled={busy}>
          {cancelLabel || text.cancel}
        </Button>
        <Button
          variant="contained"
          color={danger ? 'error' : 'primary'}
          onClick={submit}
          disabled={!valid || busy}
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDialog;
