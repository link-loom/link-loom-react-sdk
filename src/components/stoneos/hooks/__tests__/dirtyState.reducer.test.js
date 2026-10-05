import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dirtyStateReducer, isDirtyState } from '../dirtyState.reducer.js';

const clean = (values) => ({ baseline: values, values });
const edit = (name, value) => ({ type: 'edit', next: (previous) => ({ ...previous, [name]: value }) });

describe('dirtyStateReducer', () => {
  it('follows a new snapshot while nothing is edited', () => {
    const next = dirtyStateReducer(clean({ name: '', country: '' }), { type: 'follow', snapshot: { name: '', country: 'CO' } });
    assert.deepEqual(next, clean({ name: '', country: 'CO' }));
  });

  it('keeps an edit queued before the snapshot arrives', () => {
    const edited = dirtyStateReducer(clean({ name: '', country: '' }), edit('name', 'Alfa'));
    const next = dirtyStateReducer(edited, { type: 'follow', snapshot: { name: '', country: 'CO' } });
    assert.equal(next.values.name, 'Alfa');
    assert.equal(isDirtyState(next), true);
  });

  it('lands an edit queued after the snapshot on the new snapshot', () => {
    const followed = dirtyStateReducer(clean({ name: '', country: '' }), { type: 'follow', snapshot: { name: '', country: 'CO' } });
    const next = dirtyStateReducer(followed, edit('name', 'Alfa'));
    assert.deepEqual(next.values, { name: 'Alfa', country: 'CO' });
  });

  it('discards back to the baseline and saves the snapshot as the new baseline', () => {
    const edited = dirtyStateReducer(clean({ name: 'A' }), edit('name', 'B'));
    assert.deepEqual(dirtyStateReducer(edited, { type: 'discard' }), clean({ name: 'A' }));
    const saved = dirtyStateReducer(edited, { type: 'saved', snapshot: edited.values, baseline: { name: 'B' } });
    assert.deepEqual(saved, clean({ name: 'B' }));
  });

  it('keeps what was typed while a save was in flight', () => {
    const edited = dirtyStateReducer(clean({ name: 'A' }), edit('name', 'B'));
    const typedMore = dirtyStateReducer(edited, edit('name', 'BC'));
    const saved = dirtyStateReducer(typedMore, { type: 'saved', snapshot: edited.values, baseline: { name: 'B' } });
    assert.equal(saved.values.name, 'BC');
    assert.equal(saved.baseline.name, 'B');
  });
});
