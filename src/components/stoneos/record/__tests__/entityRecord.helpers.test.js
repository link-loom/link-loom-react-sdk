import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  copyLinkPathOf,
  createReferenceSubmitter,
  defaultIdOf,
  doneLabelOf,
  recordKeyOf,
} from '../entityRecord.helpers.js';
import { resolveRecordLabels } from '../record.labels.js';

describe('defaultIdOf', () => {
  it('reads the id of a record, and nothing of no record', () => {
    assert.equal(defaultIdOf({ id: 'rec-1' }), 'rec-1');
    assert.equal(defaultIdOf(null), undefined);
  });
});

describe('recordKeyOf', () => {
  it('keys a record by its id so the next one remounts', () => {
    assert.equal(recordKeyOf({ id: 'rec-1' }), 'rec-1');
    assert.equal(recordKeyOf({ code: 'USD' }, (record) => record.code), 'USD');
  });

  it('keys the creation form, which has no record, as new', () => {
    assert.equal(recordKeyOf(null), 'new');
    assert.equal(recordKeyOf({}), 'new');
  });
});

describe('copyLinkPathOf', () => {
  const linkOf = (record) => `/records/${record.id}`;

  it('gives the link of a saved record', () => {
    assert.equal(copyLinkPathOf({ creating: false, record: { id: 'rec-1' }, linkOf }), '/records/rec-1');
  });

  it('gives none while creating, without a record or without a way to link', () => {
    assert.equal(copyLinkPathOf({ creating: true, record: { id: 'rec-1' }, linkOf }), undefined);
    assert.equal(copyLinkPathOf({ creating: false, record: null, linkOf }), undefined);
    assert.equal(copyLinkPathOf({ creating: false, record: { id: 'rec-1' } }), undefined);
  });
});

describe('doneLabelOf', () => {
  it('says Done to the app that waits for the record and Close otherwise', () => {
    const english = resolveRecordLabels();
    const spanish = resolveRecordLabels(undefined, 'es');

    assert.equal(doneLabelOf(true, english), 'Done');
    assert.equal(doneLabelOf(false, english), 'Close');
    assert.equal(doneLabelOf(true, spanish), 'Listo');
    assert.equal(doneLabelOf(false, spanish), 'Cerrar');
  });
});

describe('createReferenceSubmitter', () => {
  it('hands the record to the app that waits for it', () => {
    const calls = [];
    const submit = createReferenceSubmitter({
      canSubmitOutput: true,
      entityType: 'counterparty',
      onSubmitReference: (...args) => calls.push(args),
    });
    const record = { id: 'rec-1' };

    submit(record);

    assert.deepEqual(calls, [['counterparty', record]]);
  });

  it('does nothing when nobody waits, there is no way to answer or there is no record', () => {
    const calls = [];
    const onSubmitReference = (...args) => calls.push(args);

    createReferenceSubmitter({ canSubmitOutput: false, entityType: 'x', onSubmitReference })({ id: 'a' });
    createReferenceSubmitter({ canSubmitOutput: true, entityType: 'x' })({ id: 'a' });
    createReferenceSubmitter({ canSubmitOutput: true, entityType: 'x', onSubmitReference })(null);

    assert.deepEqual(calls, []);
  });
});
