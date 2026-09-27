import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Box, TextField, Tooltip, Typography } from '@mui/material';
import { FolderOutlined as FolderIcon, LockOutlined as LockIcon } from '@mui/icons-material';
import { loadCollection } from '../shared/readCollection.js';
import WorkspaceSquare from './WorkspaceSquare.component.jsx';
import {
  WORKSPACE_PICKER_LABELS,
  isSystemWorkspace,
  resolveWorkspaceUi,
  selectedWorkspaceOf,
  workspaceNameOf,
  workspaceOptionLabel,
} from './workspacePicker.helpers.js';

/**
 * Picks a workspace of one organization. `loadWorkspaces({ organizationId })` answers the workspaces
 * that may be addressed, not only those that may be opened: filing work into a closed area is why the
 * middle level of visibility exists, and those arrive marked `is_listing_only` (drawn with a lock).
 * `onChange(id, workspace)` hands both, so the caller can keep a display snapshot of the workspace
 * (`valueSnapshot`) instead of fetching its name every time it draws a row. A list that could not load
 * says so; it is never shown as "no workspace matches".
 */
function WorkspacePicker({
  organizationId,
  loadWorkspaces,
  value,
  valueSnapshot,
  onChange,
  disabled = false,
  label,
  placeholder,
  showSlug = true,
  renderIcon,
  labels,
  sx = {},
}) {
  // -----------------------------------------------------
  // 1. Models / State
  // -----------------------------------------------------
  const [workspaces, setWorkspaces] = useState([]);

  // -----------------------------------------------------
  // 2. UI States
  // -----------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  // The list reloads when the organization changes, not when the caller hands a new loader function.
  const loaderRef = useRef(loadWorkspaces);
  loaderRef.current = loadWorkspaces;

  // -----------------------------------------------------
  // 3. Configs / Constants
  // -----------------------------------------------------
  const resolvedLabels = { ...WORKSPACE_PICKER_LABELS, ...labels };
  const selectedWorkspace = useMemo(
    () => selectedWorkspaceOf({ workspaces, value, valueSnapshot }),
    [workspaces, value, valueSnapshot],
  );

  // -----------------------------------------------------
  // 4. Component Functions
  // -----------------------------------------------------
  // The slot is always drawn, so option rows and the selected adornment line up whether or not the
  // workspace picked an icon.
  const renderWorkspaceIcon = (workspace, size = 16) => {
    if (isSystemWorkspace(workspace)) {
      return <WorkspaceSquare workspace={workspace} size={22} radius={6} />;
    }
    const { color, icon } = resolveWorkspaceUi(workspace);
    const customGlyph = icon && renderIcon ? renderIcon(icon, { color, fontSize: size }) : null;

    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: 0.75,
          backgroundColor: 'var(--stos-bg-muted)',
          flexShrink: 0,
        }}
      >
        {customGlyph || <FolderIcon sx={{ fontSize: size, color: 'text.tertiary' }} />}
      </Box>
    );
  };

  // -----------------------------------------------------
  // 5. Lifecycle
  // -----------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    if (!organizationId) {
      setWorkspaces([]);
      setHasLoadError(false);
      return undefined;
    }

    setIsLoading(true);
    setHasLoadError(false);
    loadCollection(loaderRef.current, { organizationId }).then((collection) => {
      if (cancelled) {
        return;
      }
      setWorkspaces(collection.items);
      setHasLoadError(!collection.ok);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  // -----------------------------------------------------
  // 6. Render
  // -----------------------------------------------------
  return (
    <Autocomplete
      size="small"
      fullWidth
      sx={sx}
      openOnFocus
      loading={isLoading}
      loadingText={resolvedLabels.loading}
      disabled={disabled}
      options={workspaces}
      value={selectedWorkspace}
      onChange={(event, next) => onChange?.(next?.id || null, next || null)}
      isOptionEqualToValue={(option, candidate) => option?.id === candidate?.id}
      getOptionLabel={(option) =>
        workspaceOptionLabel(option, { showSlug, labels: resolvedLabels })
      }
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            component="li"
            {...optionProps}
            key={option.id}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {option.is_listing_only ? (
              <Tooltip title={resolvedLabels.lockedScope}>
                <LockIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
              </Tooltip>
            ) : (
              renderWorkspaceIcon(option, 16)
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                title={workspaceNameOf(option, resolvedLabels)}
              >
                {workspaceNameOf(option, resolvedLabels)}
              </Typography>
              <Typography
                variant="caption"
                className="stos-mono"
                noWrap
                sx={{ color: 'text.secondary' }}
              >
                {option.slug || option.id}
              </Typography>
            </Box>
          </Box>
        );
      }}
      noOptionsText={hasLoadError ? resolvedLabels.loadFailed : resolvedLabels.noMatch}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label ?? resolvedLabels.label}
          placeholder={placeholder ?? resolvedLabels.placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: selectedWorkspace ? (
              <Box sx={{ ml: 0.5, mr: 0.5, display: 'flex' }}>
                {renderWorkspaceIcon(selectedWorkspace, 14)}
              </Box>
            ) : (
              params.InputProps?.startAdornment
            ),
          }}
        />
      )}
    />
  );
}

export default WorkspacePicker;
