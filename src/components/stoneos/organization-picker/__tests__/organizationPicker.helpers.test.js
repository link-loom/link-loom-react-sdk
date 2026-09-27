import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ORGANIZATION_DIRECTORY_STATUS,
  ORGANIZATION_STATUS_OPTION_ID,
  buildOrganizationOptions,
  normalizeSearchText,
} from '../organizationPicker.helpers.js';

const MINE = { id: 'org-mine', display_name: 'Tienda Central', slug: 'tienda-central' };
const ACME = { id: 'org-acme', display_name: 'Acme', slug: 'acme' };
const BOGOTA = { id: 'org-bog', display_name: 'Bogotá Foods', slug: 'bogota-foods' };

describe('normalizeSearchText', () => {
  it('ignores case and accents', () => {
    assert.equal(normalizeSearchText('Bogotá'), 'bogota');
    assert.equal(normalizeSearchText(undefined), '');
  });
});

describe('buildOrganizationOptions', () => {
  it('leads with your own organization, listed in the directory or not', () => {
    const options = buildOrganizationOptions({
      entries: [ACME, BOGOTA],
      myOrganization: MINE,
      status: 'ready',
    });
    assert.deepEqual(
      options.map((option) => option.id),
      ['org-mine', 'org-acme', 'org-bog'],
    );
  });

  it('takes the directory copy of your organization without listing it twice', () => {
    const listedMine = { ...MINE, display_name: 'Tienda Central S.A.S.', is_verified: true };
    const options = buildOrganizationOptions({ entries: [ACME, listedMine], myOrganization: MINE });
    assert.equal(options.length, 2);
    assert.equal(options[0].display_name, 'Tienda Central S.A.S.');
    assert.equal(options[0].is_verified, true);
  });

  it('keeps your organization only while it matches the text, accents aside', () => {
    const matching = buildOrganizationOptions({
      entries: [BOGOTA],
      myOrganization: MINE,
      text: 'tienda',
    });
    const notMatching = buildOrganizationOptions({
      entries: [BOGOTA],
      myOrganization: MINE,
      text: 'bogota',
    });
    assert.equal(matching[0].id, 'org-mine');
    assert.deepEqual(
      notMatching.map((option) => option.id),
      ['org-bog'],
    );
  });

  it('leaves your organization out when asked', () => {
    const options = buildOrganizationOptions({
      entries: [ACME, MINE],
      myOrganization: MINE,
      includeMine: false,
    });
    assert.deepEqual(
      options.map((option) => option.id),
      ['org-acme'],
    );
  });

  it('adds a status row under the list when the directory failed, never an empty list', () => {
    const failed = buildOrganizationOptions({
      entries: [],
      myOrganization: MINE,
      status: ORGANIZATION_DIRECTORY_STATUS.unauthorized,
    });
    assert.deepEqual(
      failed.map((option) => option.id),
      ['org-mine', ORGANIZATION_STATUS_OPTION_ID],
    );
    assert.equal(failed[1].status, 'unauthorized');
    assert.deepEqual(
      buildOrganizationOptions({ entries: [], status: ORGANIZATION_DIRECTORY_STATUS.error }),
      [],
    );
  });
});
