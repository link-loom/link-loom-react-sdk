import React, { useEffect, useState } from 'react';
import { FormControlLabel, Switch } from '@mui/material';

function EditModeToggle({ checked, onChange, label }) {
  return (
    <FormControlLabel
      control={<Switch checked={checked} onChange={onChange} color="primary" size="small" />}
      label={label}
      labelPlacement="start"
      sx={{
        mr: 0,
        ml: 1,
        gap: 0.5,
        '& .MuiFormControlLabel-label': { color: 'text.secondary' },
      }}
    />
  );
}

/**
 * View-first preview ↔ edit wrapper for entity detail modals. Both modes render inside the same
 * fixed-width container so the modal never resizes when toggling.
 * renderPreview({ entity, onEdit, onUpdatedEntity, setIsOpen })
 * renderEdit({ entity, onUpdatedEntity, setIsOpen, isPopupContext, editToggle, onCancelEdit })
 */
function EntityManagerShell({
  entitySelected,
  onUpdatedEntity,
  setIsOpen,
  isPopupContext,
  mode = 'quick-view',
  width = 890,
  editLabel = 'Edit',
  renderPreview,
  renderEdit,
}) {
  const [isEditMode, setIsEditMode] = useState(mode === 'edit' && Boolean(renderEdit));
  const [currentEntity, setCurrentEntity] = useState(entitySelected);

  useEffect(() => {
    setCurrentEntity(entitySelected);
  }, [entitySelected]);

  const handleUpdate = (action, response) => {
    if (response?.result) {
      setCurrentEntity((previous) => ({ ...previous, ...response.result }));
    }
    onUpdatedEntity?.(action, response);
  };

  const onCancelEdit = () => setIsEditMode(false);

  return (
    <div
      style={width === 'full' ? { width: '100%' } : { width: `min(${width}px, 92vw)`, margin: '0 auto' }}
    >
      <section style={{ width: '100%' }}>
        {isEditMode && renderEdit
          ? renderEdit({
              entity: currentEntity,
              onUpdatedEntity: handleUpdate,
              setIsOpen,
              isPopupContext,
              onCancelEdit,
              editToggle: <EditModeToggle checked onChange={onCancelEdit} label={editLabel} />,
            })
          : renderPreview({
              entity: currentEntity,
              onEdit: renderEdit ? () => setIsEditMode(true) : undefined,
              onUpdatedEntity: handleUpdate,
              setIsOpen,
            })}
      </section>
    </div>
  );
}

export default EntityManagerShell;
