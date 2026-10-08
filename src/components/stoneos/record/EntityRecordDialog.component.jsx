import React, { useCallback, useEffect, useRef } from 'react';
import EntityDialog from './EntityDialog.component.jsx';
import useEntityRecord from './useEntityRecord.hook.js';
import useEntityRoute from './useEntityRoute.hook.js';
import {
  copyLinkPathOf,
  createReferenceSubmitter,
  defaultIdOf,
  doneLabelOf,
  recordKeyOf,
} from './entityRecord.helpers.js';
import { resolveRecordLabels } from './record.labels.js';

// A record of an entity over its list, driven by the URL: ?id=<id> opens it and ?new=1 opens its creation,
// which is the same record before it exists (record = null). Closing with unsaved changes asks first, and
// creating answers the app that waits for the record (`canSubmitOutput` + `onSubmitReference`). Each
// entity passes `loadRecord` (id → Promise<{ record }>) and `renderRecord`:
//
// renderRecord({ record, draft, canWrite, action, copyLinkPath, redirectedFrom, doneLabel, onDone, onCreated,
//   onChanged, onClose, onOpen, onDirtyChange })
//
// `linkOf(record)` answers the link that opens a record on its own, `idOf(record)` the id the route
// carries, `routeParams` renames the URL params (see useEntityRoute) and `containerName` the size
// container of the dialog's paper.
function EntityRecordDialog({
  entityType,
  section,
  loadRecord,
  renderRecord,
  onChanged,
  onCreated,
  canWrite = true,
  canSubmitOutput = false,
  onSubmitReference,
  linkOf,
  idOf = defaultIdOf,
  routeParams,
  containerName,
  errorMessage,
  labels,
  locale = 'en',
}) {
  // -----------------------------------------------------
  // 1. Hooks
  // -----------------------------------------------------
  const text = resolveRecordLabels(labels, locale);
  const { openId, creating, action, draft, openEntity, closeEntity } = useEntityRoute({ params: routeParams });
  const { record, loading, error, reload } = useEntityRecord(loadRecord, openId);
  const dirtyRef = useRef(false);

  // -----------------------------------------------------
  // 4. Configs / Constants
  // -----------------------------------------------------
  const open = Boolean(openId) || creating;
  const submitReference = createReferenceSubmitter({ canSubmitOutput, onSubmitReference, entityType });

  // -----------------------------------------------------
  // 5. Component Functions
  // -----------------------------------------------------
  const handleDirty = useCallback((dirty) => {
    dirtyRef.current = dirty;
  }, []);

  const handleCreated = (created) => {
    dirtyRef.current = false;
    onChanged?.();
    onCreated?.(created);
    submitReference(created);
    openEntity(idOf(created), { replace: true });
  };

  const changed = async ({ deleted } = {}) => {
    onChanged?.();
    if (deleted) {
      closeEntity();
      return;
    }
    await reload();
  };

  const finish = () => {
    submitReference(record);
    closeEntity();
  };

  // -----------------------------------------------------
  // 6. Lifecycle
  // -----------------------------------------------------
  useEffect(() => {
    dirtyRef.current = false;
  }, [openId, creating]);

  // -----------------------------------------------------
  // 7. Render
  // -----------------------------------------------------
  const renderContent = ({ requestClose }) => (
    <React.Fragment key={recordKeyOf(record, idOf)}>
      {renderRecord({
        record: creating ? null : record,
        draft,
        canWrite,
        action,
        copyLinkPath: copyLinkPathOf({ creating, record, linkOf }),
        redirectedFrom: creating ? undefined : record?.redirected_from,
        doneLabel: doneLabelOf(canSubmitOutput, text),
        onDone: canSubmitOutput ? finish : requestClose,
        onCreated: handleCreated,
        onChanged: changed,
        onClose: requestClose,
        onOpen: openEntity,
        onDirtyChange: handleDirty,
      })}
    </React.Fragment>
  );

  return (
    <EntityDialog
      open={open}
      label={section}
      creating={creating}
      record={record}
      loading={loading}
      error={error}
      reload={reload}
      dirtyRef={dirtyRef}
      onClose={closeEntity}
      containerName={containerName}
      errorMessage={errorMessage}
      labels={labels}
      locale={locale}
    >
      {renderContent}
    </EntityDialog>
  );
}

export default EntityRecordDialog;
