import React from 'react';
import CredentialPicker from './CredentialPicker.component.jsx';
import { pickerPropsOfSchema } from './credentialPicker.helpers.js';

/**
 * Schema renderer for a `ui_widget: 'connection_picker'` field of a connector config_schema.
 * A host schema renderer calls it when `isConnectionPickerSchema(schema)` is true; the allowed types
 * come from `ui_options.credential_types`.
 */
function ConnectionPickerField({ schema, value, onChange, ...pickerProps }) {
  return (
    <CredentialPicker
      {...pickerProps}
      {...pickerPropsOfSchema(schema)}
      label={schema?.title}
      value={value || ''}
      onChange={(credentialId) => onChange(credentialId)}
      helperText={schema?.description || ''}
    />
  );
}

export default ConnectionPickerField;
