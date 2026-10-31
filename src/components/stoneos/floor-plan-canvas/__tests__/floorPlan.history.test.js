import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canRedo, canUndo, createHistory, recordHistory, redoHistory, undoHistory } from '../floorPlan.history.js';

describe('floor plan history', () => {
  it('starts empty', () => {
    const history = createHistory();
    assert.equal(canUndo(history), false);
    assert.equal(canRedo(history), false);
    assert.equal(undoHistory(history, 'now'), null);
    assert.equal(redoHistory(history, 'now'), null);
  });

  it('undoes and redoes one snapshot at a time', () => {
    const recorded = recordHistory(recordHistory(createHistory(), 'one'), 'two');
    const undone = undoHistory(recorded, 'three');
    assert.equal(undone.items, 'two');
    assert.equal(canRedo(undone.history), true);

    const redone = redoHistory(undone.history, undone.items);
    assert.equal(redone.items, 'three');
    assert.deepEqual(redone.history.past, ['one', 'two']);
  });

  it('drops what could be redone when something new is recorded', () => {
    const undone = undoHistory(recordHistory(createHistory(), 'one'), 'two');
    assert.equal(canRedo(recordHistory(undone.history, 'two')), false);
  });

  it('keeps the latest snapshots up to the limit', () => {
    const history = ['a', 'b', 'c', 'd'].reduce((current, snapshot) => recordHistory(current, snapshot, 2), createHistory());
    assert.deepEqual(history.past, ['c', 'd']);
  });
});
