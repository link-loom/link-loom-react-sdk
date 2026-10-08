import React, { useCallback, useState } from 'react';
import { Box, CircularProgress, Dialog } from '@mui/material';
import ConfirmDialog from '../confirm-dialog/ConfirmDialog.component.jsx';
import EmptyState from '../empty-state/EmptyState.component.jsx';
import { describeError } from '../shared/labels.helpers.js';
import { RECORD_CONTAINER_NAME, hasUnsavedChanges, recordDialogPaperSx } from './entityDialog.helpers.js';
import { resolveRecordLabels } from './record.labels.js';

// The record over the current view. It holds the states a modal always has (loading, error, not found)
// at the size of a record, and closing with unsaved changes asks first: the content reports them through
// `dirtyRef.current`. `children({ requestClose })` is the detail or the form once the record exists (or
// while creating). The paper is a size container named `containerName`, so a record in a portal follows
// the narrow-width rules of its own width. `errorMessage(error)` words a failed load in the app's language.
function EntityDialog({
  open,
  label,
  creating,
  record,
  loading,
  error,
  reload,
  dirtyRef,
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
  const [confirmingClose, setConfirmingClose] = useState(false);

  // -----------------------------------------------------
  // 5. Component Functions
  // -----------------------------------------------------
  const requestClose = useCallback(() => {
    if (hasUnsavedChanges(dirtyRef)) {
      setConfirmingClose(true);
      return;
    }
    onClose();
  }, [dirtyRef, onClose]);

  const discardAndClose = () => {
    setConfirmingClose(false);
    if (dirtyRef) {
      dirtyRef.current = false;
    }
    onClose();
  };

  const renderState = () => {
    if (loading) {
      return (
        <Box className="stos-record-dialog__state">
          <CircularProgress size={24} aria-label={text.loading} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box className="stos-record-dialog__state">
          <EmptyState
            variant="error"
            size="inline"
            title={text.loadErrorTitle}
            description={describeError(error, { errorMessage, fallback: text.unknownError })}
            action={{ label: text.retry, onClick: reload }}
          />
        </Box>
      );
    }

    return (
      <Box className="stos-record-dialog__state">
        <EmptyState
          size="inline"
          illustration="search"
          title={text.notFoundTitle}
          description={text.notFoundDescription}
          action={{ label: text.backToList, onClick: onClose }}
        />
      </Box>
    );
  };

  // -----------------------------------------------------
  // 7. Render
  // -----------------------------------------------------
  return (
    <>
      <Dialog
        open={Boolean(open)}
        onClose={requestClose}
        maxWidth={false}
        PaperProps={{ sx: recordDialogPaperSx(containerName) }}
        aria-label={label}
      >
        {open && (creating || record ? children({ requestClose }) : renderState())}
      </Dialog>
      <ConfirmDialog
        open={confirmingClose}
        title={text.discardTitle}
        description={text.discardDescription}
        confirmLabel={text.discardConfirm}
        cancelLabel={text.keepEditing}
        danger
        onConfirm={discardAndClose}
        onClose={() => setConfirmingClose(false)}
      />
    </>
  );
}

export default EntityDialog;
