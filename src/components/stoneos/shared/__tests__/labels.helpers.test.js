import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  describeError,
  interpolate,
  mergeLabels,
  normalizeLocale,
  resolveLabels,
} from '../labels.helpers.js';

const DICTIONARIES = { en: { save: 'Save', nested: { a: 'A', b: 'B' } }, es: { save: 'Guardar', nested: { a: 'a', b: 'b' } } };

describe('normalizeLocale', () => {
  it('reads the language of a regional or upper-case locale', () => {
    assert.equal(normalizeLocale('es-CO', DICTIONARIES), 'es');
    assert.equal(normalizeLocale('ES', DICTIONARIES), 'es');
    assert.equal(normalizeLocale('es_MX', DICTIONARIES), 'es');
  });

  it('falls back to English for a language without copy, and for nothing', () => {
    assert.equal(normalizeLocale('fr', DICTIONARIES), 'en');
    assert.equal(normalizeLocale(undefined, DICTIONARIES), 'en');
    assert.equal(normalizeLocale('constructor', DICTIONARIES), 'en');
  });
});

describe('interpolate', () => {
  it('fills the placeholders it has a value for and leaves the rest as written', () => {
    assert.equal(interpolate('{label}: {value} +{more}', { label: 'Roles', value: 'Customer', more: 2 }), 'Roles: Customer +2');
    assert.equal(interpolate('{label}: {value}', { label: 'Roles' }), 'Roles: {value}');
  });

  it('keeps a value with replacement patterns as it is', () => {
    assert.equal(interpolate('{value}', { value: "$& $1" }), '$& $1');
  });

  it('returns the text untouched without params', () => {
    assert.equal(interpolate('Save'), 'Save');
  });
});

describe('mergeLabels', () => {
  it('lets the overrides win and ignores empty entries', () => {
    const merged = mergeLabels(DICTIONARIES.en, { save: 'Store', nested: null, extra: undefined });
    assert.equal(merged.save, 'Store');
    assert.deepEqual(merged.nested, DICTIONARIES.en.nested);
    assert.equal('extra' in merged, false);
  });

  it('merges nested labels key by key without touching the defaults', () => {
    const merged = mergeLabels(DICTIONARIES.en, { nested: { b: 'Bee' } });
    assert.deepEqual(merged.nested, { a: 'A', b: 'Bee' });
    assert.equal(DICTIONARIES.en.nested.b, 'B');
  });

  it('returns the defaults when there is nothing to merge', () => {
    assert.equal(mergeLabels(DICTIONARIES.en, undefined), DICTIONARIES.en);
  });
});

describe('resolveLabels', () => {
  it('picks the locale and applies the overrides', () => {
    assert.equal(resolveLabels(DICTIONARIES, undefined, 'es').save, 'Guardar');
    assert.equal(resolveLabels(DICTIONARIES, { save: 'Grabar' }, 'es-CO').save, 'Grabar');
    assert.equal(resolveLabels(DICTIONARIES, undefined, 'de').save, 'Save');
  });
});

describe('describeError', () => {
  it('says nothing when there is no error', () => {
    assert.equal(describeError(null, { fallback: 'Failed' }), '');
  });

  it('uses the app reader, then the error message, then the fallback', () => {
    const error = new Error('Boom');
    assert.equal(describeError(error, { errorMessage: () => 'Custom' }), 'Custom');
    assert.equal(describeError(error), 'Boom');
    assert.equal(describeError({}, { fallback: 'Failed' }), 'Failed');
    assert.equal(describeError(error, { errorMessage: () => '', fallback: 'Failed' }), 'Failed');
  });
});
