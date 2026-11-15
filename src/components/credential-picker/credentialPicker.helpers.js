// Pure rules of the credential picker (conectores.md 3.3), apart from React so they are testable.

export const CONNECTION_PICKER_WIDGET = 'connection_picker';

// Statuses a credential must not be offered with: it cannot be used any more.
export const EXCLUDED_CREDENTIAL_STATUSES = ['deleted', 'revoked'];

export function itemsOfResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.result?.items || response?.items || [];
}

/** Only credentials of the organization, of an allowed type and not deleted or revoked. */
export function filterCredentials({ credentials, organizationId, credentialTypes = [], providers = [] }) {
  return (credentials || []).filter((credential) => {
    if (organizationId && credential?.organization_id && credential.organization_id !== organizationId) {
      return false;
    }
    if (EXCLUDED_CREDENTIAL_STATUSES.includes(credential?.status?.name)) {
      return false;
    }
    if (credentialTypes.length && !credentialTypes.includes(credential?.type?.name)) {
      return false;
    }
    if (providers.length && !providers.includes(credential?.provider?.name)) {
      return false;
    }
    return true;
  });
}

export function isConnectionPickerSchema(schema) {
  return schema?.type === 'string' && schema?.ui_widget === CONNECTION_PICKER_WIDGET;
}

/** The picker props a `connection_picker` field of a config_schema declares. */
export function pickerPropsOfSchema(schema) {
  const options = schema?.ui_options || {};

  return {
    credentialTypes: Array.isArray(options.credential_types) ? options.credential_types : [],
    providers: Array.isArray(options.providers) ? options.providers : [],
  };
}

/** The secret object of a new credential from the typed fields; the shape comes from the host. */
export function buildSecretFromFields({ fields, values }) {
  return Object.fromEntries(
    fields
      .map((field) => [field, String(values?.[field] ?? '').trim()])
      .filter(([, value]) => value),
  );
}

export function missingSecretFields({ shape, values }) {
  return (shape?.required || []).filter((field) => !String(values?.[field] ?? '').trim());
}
