import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { buildSecretFromFields, itemsOfResponse, missingSecretFields } from './credentialPicker.helpers.js';

// Create-credential modal of the picker: the person never leaves the form that needs it.
// `secretShapes` is the catalog of the vault ({ [type]: { required, optional } }); the host reads it
// from the credential catalogs, so the shape is never written here.
function CredentialCreateDialog({ open, onClose, onCreated, createCredential, credentialTypes, secretShapes, labels }) {
  const [name, setName] = useState('');
  const [typeName, setTypeName] = useState(credentialTypes[0] || '');
  const [values, setValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const shape = secretShapes?.[typeName];
  const fields = useMemo(() => [...(shape?.required || []), ...(shape?.optional || [])], [shape]);
  const missing = missingSecretFields({ shape, values });
  const canSave = Boolean(name.trim() && typeName && fields.length && !missing.length) && !isSaving;

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');

    const response = await createCredential({
      name: name.trim(),
      type: { name: typeName },
      secret_handle: buildSecretFromFields({ fields, values }),
    });

    setIsSaving(false);
    if (!response?.success) {
      setErrorMessage(response?.message || labels.createError);
      return;
    }

    const created = response.result?.items ? itemsOfResponse(response)[0] : response.result;
    setName('');
    setValues({});
    onCreated(created);
  };

  return (
    <Dialog open={Boolean(open)} onClose={isSaving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{labels.createTitle}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <TextField size="small" label={labels.name} value={name} onChange={(event) => setName(event.target.value)} />
          <TextField
            select
            size="small"
            label={labels.type}
            value={typeName}
            onChange={(event) => {
              setTypeName(event.target.value);
              setValues({});
            }}
          >
            {credentialTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          {fields.map((field) => (
            <TextField
              key={field}
              size="small"
              type="password"
              autoComplete="off"
              label={field}
              required={(shape?.required || []).includes(field)}
              value={values[field] || ''}
              onChange={(event) => setValues({ ...values, [field]: event.target.value })}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          {labels.cancel}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          {labels.create}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CredentialCreateDialog;
