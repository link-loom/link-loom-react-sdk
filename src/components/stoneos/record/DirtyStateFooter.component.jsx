import React from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { CheckOutlined as SavedIcon, ErrorOutlineOutlined as ErrorIcon } from '@mui/icons-material';
import { describeError } from '../shared/labels.helpers.js';
import { resolveRecordLabels } from './record.labels.js';

// Footer of a view-first form driven by useDirtyState:
// clean → close only · dirty → unsaved + discard/save · saving → spinner · saved → confirmation · error → retry.
// `errorMessage(error)` words a failed save in the app's language; without it the error's own message
// is shown.
function DirtyStateFooter({
  status,
  error,
  onSave,
  onDiscard,
  onClose,
  closeLabel,
  errorMessage,
  labels,
  locale = 'en',
}) {
  const text = resolveRecordLabels(labels, locale);
  const isSaving = status === 'saving';
  const hasChanges = status === 'dirty' || status === 'saving' || status === 'error';

  return (
    <Box className="stos-dirty-footer">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, mr: 'auto' }}>
        {status === 'dirty' && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {text.unsaved}
          </Typography>
        )}
        {status === 'saved' && (
          <>
            <SavedIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {text.saved}
            </Typography>
          </>
        )}
        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="body2" noWrap sx={{ color: 'error.main' }}>
              {describeError(error, { errorMessage }) || text.saveError}
            </Typography>
          </>
        )}
      </Box>

      {!hasChanges && onClose && (
        <Button variant="text" onClick={onClose}>
          {closeLabel || text.close}
        </Button>
      )}

      {hasChanges && (
        <>
          <Button variant="text" onClick={onDiscard} disabled={isSaving}>
            {text.discard}
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {status === 'error' ? text.retry : text.save}
          </Button>
        </>
      )}
    </Box>
  );
}

export default DirtyStateFooter;
