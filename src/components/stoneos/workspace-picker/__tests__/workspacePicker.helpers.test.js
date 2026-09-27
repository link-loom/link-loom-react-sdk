import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { colorFromString } from '../../theme/stoneos.constants.js';
import {
  WORKSPACE_PICKER_LABELS,
  isSystemWorkspace,
  resolveWorkspaceUi,
  selectedWorkspaceOf,
  workspaceNameOf,
  workspaceOptionLabel,
} from '../workspacePicker.helpers.js';

const INTAKE = { id: 'ws-intake', name: 'Intake', slug: 'intake', kind: { name: 'intake' } };
const SALES = {
  id: 'ws-sales',
  name: 'Sales',
  slug: 'sales',
  ui: { emoji: { icon: 'Storefront', color: '#2fb673' } },
};

describe('resolveWorkspaceUi', () => {
  it('reads the colour and icon of the workspace, older emoji shape included', () => {
    assert.deepEqual(resolveWorkspaceUi(SALES), {
      color: '#2fb673',
      icon: 'Storefront',
      initial: 'S',
    });
    assert.deepEqual(
      resolveWorkspaceUi({ id: 'w', name: 'ops', ui: { color: '#111', icon: 'Build' } }),
      {
        color: '#111',
        icon: 'Build',
        initial: 'O',
      },
    );
  });

  it('gives a workspace without colour a stable one from its id', () => {
    assert.equal(resolveWorkspaceUi({ id: 'ws-1', name: 'Ops' }).color, colorFromString('ws-1'));
    assert.equal(resolveWorkspaceUi(null).initial, '?');
  });
});

describe('workspaceNameOf', () => {
  it('reads an intake that keeps the backend name in the reader language', () => {
    assert.equal(isSystemWorkspace(INTAKE), true);
    assert.equal(
      workspaceNameOf(INTAKE, { ...WORKSPACE_PICKER_LABELS, intake: 'Recepción' }),
      'Recepción',
    );
    assert.equal(workspaceNameOf({ ...INTAKE, name: 'Front desk' }), 'Front desk');
  });

  it('falls back to the slug, and to nothing for no workspace', () => {
    assert.equal(workspaceNameOf({ slug: 'north' }), 'north');
    assert.equal(workspaceNameOf(null), '');
  });
});

describe('workspaceOptionLabel', () => {
  it('shows the slug while choosing and only the name in a narrow field', () => {
    assert.equal(workspaceOptionLabel(SALES), 'Sales (sales)');
    assert.equal(workspaceOptionLabel(SALES, { showSlug: false }), 'Sales');
    assert.equal(workspaceOptionLabel({ id: 'ws-x' }), 'ws-x');
  });
});

describe('selectedWorkspaceOf', () => {
  it('prefers the fetched workspace, then the kept snapshot, then the bare id', () => {
    assert.equal(selectedWorkspaceOf({ workspaces: [SALES], value: 'ws-sales' }), SALES);
    assert.deepEqual(
      selectedWorkspaceOf({
        workspaces: [],
        value: 'ws-sales',
        valueSnapshot: { id: 'other', name: 'Sales' },
      }),
      {
        id: 'ws-sales',
        name: 'Sales',
      },
    );
    assert.deepEqual(selectedWorkspaceOf({ value: 'ws-9' }), { id: 'ws-9' });
    assert.equal(selectedWorkspaceOf({ workspaces: [SALES], value: null }), null);
  });
});
