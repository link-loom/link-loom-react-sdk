import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DATA_TABLE_LABELS, resolveDataTableLabels } from '../dataTable.labels.js';

describe('DATA_TABLE_LABELS', () => {
  it('has the same keys in English and Spanish', () => {
    assert.deepEqual(Object.keys(DATA_TABLE_LABELS.es).sort(), Object.keys(DATA_TABLE_LABELS.en).sort());
  });
});

describe('resolveDataTableLabels', () => {
  it('reads the group options sentence in the language of the app', () => {
    assert.equal(resolveDataTableLabels({}, 'es-CO').groupOptions, 'Opciones del grupo');
    assert.equal(resolveDataTableLabels({}, 'en').groupOptions, 'Group options');
  });

  it('lets the app override one sentence without restating the rest', () => {
    const labels = resolveDataTableLabels({ groupOptions: 'Más del grupo' }, 'es');
    assert.equal(labels.groupOptions, 'Más del grupo');
    assert.equal(labels.expandGroup, 'Expandir este grupo');
  });
});
