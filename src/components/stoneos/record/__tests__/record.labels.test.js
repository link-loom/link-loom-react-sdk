import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LIST_SURFACE_LABELS } from '../../list/listSurface.labels.js';
import { ROW_ACTION_LABELS } from '../row-actions.helpers.js';
import { RECORD_KIT_LABELS, autocompleteLabelsOf, resolveRecordLabels } from '../record.labels.js';

const isObject = (value) => value && typeof value === 'object';

// Every path of a dictionary down to its sentences: 'rowActions.edit', 'list.rowsPerPage', 'save'.
const pathsOf = (dictionary, prefix = '') =>
  Object.entries(dictionary).flatMap(([key, value]) =>
    isObject(value) ? pathsOf(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );

const valueAt = (dictionary, path) => path.split('.').reduce((value, key) => value[key], dictionary);

const placeholdersOf = (text) => (String(text).match(/\{\w+\}/g) || []).sort();

describe('RECORD_KIT_LABELS', () => {
  it('has the same keys in English and Spanish', () => {
    assert.deepEqual(pathsOf(RECORD_KIT_LABELS.es).sort(), pathsOf(RECORD_KIT_LABELS.en).sort());
  });

  it('has a sentence at every key, in both languages', () => {
    ['en', 'es'].forEach((locale) => {
      pathsOf(RECORD_KIT_LABELS[locale]).forEach((path) => {
        const text = valueAt(RECORD_KIT_LABELS[locale], path);
        assert.equal(typeof text, 'string', `${locale} ${path}`);
        assert.notEqual(text.trim(), '', `${locale} ${path}`);
      });
    });
  });

  it('keeps the placeholders of a sentence in its translation', () => {
    pathsOf(RECORD_KIT_LABELS.en).forEach((path) => {
      assert.deepEqual(
        placeholdersOf(valueAt(RECORD_KIT_LABELS.es, path)),
        placeholdersOf(valueAt(RECORD_KIT_LABELS.en, path)),
        path,
      );
    });
  });

  it('actually translates: no Spanish sentence repeats the English one, but for the shared ones', () => {
    const shared = ['filterOne', 'filterMany'];
    const untranslated = pathsOf(RECORD_KIT_LABELS.en).filter(
      (path) => valueAt(RECORD_KIT_LABELS.es, path) === valueAt(RECORD_KIT_LABELS.en, path),
    );

    assert.deepEqual(untranslated.filter((path) => !shared.includes(path)), []);
  });

  it('gathers the labels of the row actions and of the list surface', () => {
    assert.equal(RECORD_KIT_LABELS.en.rowActions, ROW_ACTION_LABELS.en);
    assert.equal(RECORD_KIT_LABELS.es.list, LIST_SURFACE_LABELS.es);
  });

  it('writes Spanish without voseo', () => {
    const voseo = /(?<!\p{L})(vos|tenés|podés|querés|hacé|escribí|elegí|seleccioná|guardá|cerrá)(?!\p{L})/iu;
    pathsOf(RECORD_KIT_LABELS.es).forEach((path) => {
      assert.doesNotMatch(valueAt(RECORD_KIT_LABELS.es, path), voseo, path);
    });
  });
});

describe('ROW_ACTION_LABELS and LIST_SURFACE_LABELS', () => {
  it('have the same keys in English and Spanish', () => {
    assert.deepEqual(Object.keys(ROW_ACTION_LABELS.es), Object.keys(ROW_ACTION_LABELS.en));
    assert.deepEqual(Object.keys(LIST_SURFACE_LABELS.es), Object.keys(LIST_SURFACE_LABELS.en));
  });
});

describe('resolveRecordLabels', () => {
  it('reads the locale, English by default', () => {
    assert.equal(resolveRecordLabels().save, 'Save');
    assert.equal(resolveRecordLabels(undefined, 'es').save, 'Guardar');
    assert.equal(resolveRecordLabels(undefined, 'es-CO').save, 'Guardar');
    assert.equal(resolveRecordLabels(undefined, 'fr').save, 'Save');
  });

  it('puts the overrides of the app on top, nested ones included', () => {
    const labels = resolveRecordLabels({ save: 'Store', rowActions: { edit: 'Change' } }, 'es');

    assert.equal(labels.save, 'Store');
    assert.equal(labels.discard, 'Descartar');
    assert.equal(labels.rowActions.edit, 'Change');
    assert.equal(labels.rowActions.delete, 'Eliminar');
  });
});

describe('autocompleteLabelsOf', () => {
  it('gives MUI the texts of the locale', () => {
    assert.deepEqual(autocompleteLabelsOf(resolveRecordLabels(undefined, 'es')), {
      openText: 'Abrir',
      closeText: 'Cerrar',
      clearText: 'Limpiar',
      loadingText: 'Cargando…',
      noOptionsText: 'Sin coincidencias',
    });
  });
});
