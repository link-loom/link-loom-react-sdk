import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { describeError } from '../shared/labels.helpers.js';
import { MAX_REASON_LENGTH, isReasonValid } from './reasonDialog.helpers.js';
import { resolveRecordLabels } from './record.labels.js';

// A confirmation that asks why: the action stays disabled until the reason has at least five characters,
// and a refusal is shown in the dialog, which stays open. `onConfirm(reason)` answers a promise; the
// dialog closes by itself only when it resolves. `errorMessage(error)` words a refusal in the app's
// language; without it the error's own message is shown.
function ReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = true,
  reasonLabel,
  required = true,
  onConfirm,
  onClose,
  errorMessage,
  labels,
  locale = 'en',
}) {
  // -----------------------------------------------------
  // 1. Hooks
  // -----------------------------------------------------
  const text = resolveRecordLabels(labels, locale);

  // -----------------------------------------------------
  // 3. UI States
  // -----------------------------------------------------
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------------------------------
  // 5. Component Functions
  // -----------------------------------------------------
  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      onClose();
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
      setReason('');
      setError(null);
    }
  }, [open]);

  // -----------------------------------------------------
  // 7. Render
  // -----------------------------------------------------
  return (
    <Dialog open={Boolean(open)} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth disableScrollLock>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h4" component="span">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        {description && (
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            {description}
          </Typography>
        )}
        <TextField
          autoFocus
          multiline
          minRows={2}
          maxRows={5}
          fullWidth
          size="small"
          label={reasonLabel || text.reason}
          value={reason}
          required={required}
          disabled={busy}
          inputProps={{ maxLength: MAX_REASON_LENGTH }}
          helperText={required ? text.reasonHint : undefined}
          onChange={(event) => setReason(event.target.value)}
        />
        {error && (
          <Typography variant="body2" role="alert" sx={{ color: 'error.main', mt: 1 }}>
            {describeError(error, { errorMessage, fallback: text.unknownError })}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button variant="text" onClick={onClose} disabled={busy}>
          {text.cancel}
        </Button>
        <Button
          variant="contained"
          color={danger ? 'error' : 'primary'}
          onClick={confirm}
          disabled={!isReasonValid(reason, required) || busy}
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReasonDialog;
