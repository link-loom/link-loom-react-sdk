import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Autocomplete, Button, TextField } from '@mui/material';
import CredentialCreateDialog from './CredentialCreateDialog.component.jsx';
import { filterCredentials, itemsOfResponse } from './credentialPicker.helpers.js';

const DEFAULT_LABELS = {
  label: 'Credential',
  createAction: 'Create credential',
  createTitle: 'Create credential',
  name: 'Name',
  type: 'Type',
  create: 'Create',
  cancel: 'Cancel',
  createError: 'The credential could not be created',
};

/**
 * Picker of an existing credential: the consumption side of the vault, for any host (conectores.md 3.3).
 * It shows only credentials of the organization, of an allowed type, never deleted or revoked, and
 * offers "Create credential" in a modal. The host injects the data access, so the SDK holds no client:
 *
 * - organizationId: organization of the session (required)
 * - value: selected credential id
 * - onChange(credentialId, credential)
 * - credentialTypes: allowed `type.name` values (empty = all)
 * - loadCredentials({ organizationId }): list response (items or an envelope)
 * - createCredential(payload): create response; omit it to hide the create action
 * - secretShapes: { [type]: { required, optional } } from the credential catalogs
 * - labels: translated texts, merged over the defaults
 */
function CredentialPicker({
  organizationId,
  value,
  onChange = () => {},
  credentialTypes = [],
  providers = [],
  loadCredentials,
  createCredential,
  secretShapes = {},
  labels = {},
  disabled = false,
  helperText = '',
}) {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const texts = { ...DEFAULT_LABELS, ...labels };

  const reload = useCallback(async () => {
    if (!organizationId || !loadCredentials) {
      setCredentials([]);
      return;
    }

    setIsLoading(true);
    setCredentials(itemsOfResponse(await loadCredentials({ organizationId })));
    setIsLoading(false);
  }, [organizationId, loadCredentials]);

  useEffect(() => {
    reload();
  }, [reload]);

  const options = useMemo(
    () => filterCredentials({ credentials, organizationId, credentialTypes, providers }),
    [credentials, organizationId, credentialTypes, providers],
  );
  const selected = options.find((credential) => credential.id === value) || null;

  const handleCreated = async (created) => {
    setIsCreating(false);
    await reload();
    if (created?.id) {
      onChange(created.id, created);
    }
  };

  return (
    <div>
      <Autocomplete
        size="small"
        disabled={disabled || !organizationId}
        loading={isLoading}
        options={options}
        value={selected}
        getOptionLabel={(credential) => credential?.name || credential?.slug || credential?.id || ''}
        isOptionEqualToValue={(option, chosen) => option?.id === chosen?.id}
        onChange={(_event, next) => onChange(next?.id || '', next || null)}
        renderInput={(params) => <TextField {...params} label={texts.label} helperText={helperText} />}
      />
      {createCredential ? (
        <Button size="small" disabled={disabled || !organizationId} onClick={() => setIsCreating(true)}>
          {texts.createAction}
        </Button>
      ) : null}
      {createCredential ? (
        <CredentialCreateDialog
          open={isCreating}
          onClose={() => setIsCreating(false)}
          onCreated={handleCreated}
          createCredential={createCredential}
          credentialTypes={credentialTypes}
          secretShapes={secretShapes}
          labels={texts}
        />
      ) : null}
    </div>
  );
}

export default CredentialPicker;
