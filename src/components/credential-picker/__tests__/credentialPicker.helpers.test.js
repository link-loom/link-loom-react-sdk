import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSecretFromFields,
  filterCredentials,
  isConnectionPickerSchema,
  itemsOfResponse,
  missingSecretFields,
  pickerPropsOfSchema,
} from '../credentialPicker.helpers.js';

const credentials = [
  { id: 'a', organization_id: 'org-1', type: { name: 'api-key' }, status: { name: 'active' } },
  { id: 'b', organization_id: 'org-1', type: { name: 'api-key' }, status: { name: 'revoked' } },
  { id: 'c', organization_id: 'org-1', type: { name: 'api-key' }, status: { name: 'deleted' } },
  { id: 'd', organization_id: 'org-2', type: { name: 'api-key' }, status: { name: 'active' } },
  { id: 'e', organization_id: 'org-1', type: { name: 'oauth2' }, status: { name: 'active' } },
];

describe('credential picker rules', () => {
  it('lists only the organization, the allowed types, and neither deleted nor revoked', () => {
    const shown = filterCredentials({ credentials, organizationId: 'org-1', credentialTypes: ['api-key'] });

    assert.deepEqual(shown.map((credential) => credential.id), ['a']);
  });

  it('lists every type when none is declared', () => {
    const shown = filterCredentials({ credentials, organizationId: 'org-1' });

    assert.deepEqual(shown.map((credential) => credential.id), ['a', 'e']);
  });

  it('reads the items of a list or an envelope', () => {
    assert.deepEqual(itemsOfResponse({ result: { items: [1] } }), [1]);
    assert.deepEqual(itemsOfResponse([2]), [2]);
    assert.deepEqual(itemsOfResponse(null), []);
  });

  it('recognizes the connection_picker widget and reads its allowed types', () => {
    const schema = { type: 'string', ui_widget: 'connection_picker', ui_options: { credential_types: ['api-key'], types: [] } };

    assert.equal(isConnectionPickerSchema(schema), true);
    assert.equal(isConnectionPickerSchema({ type: 'string' }), false);
    assert.deepEqual(pickerPropsOfSchema(schema), { credentialTypes: ['api-key'], providers: [] });
  });

  it('builds the secret from the typed fields and reports the required ones that are missing', () => {
    const shape = { required: ['username', 'password'], optional: [] };

    assert.deepEqual(missingSecretFields({ shape, values: { username: 'u' } }), ['password']);
    assert.deepEqual(buildSecretFromFields({ fields: ['username', 'password'], values: { username: ' u ', password: '' } }), { username: 'u' });
  });
});
