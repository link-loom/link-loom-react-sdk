import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isUnauthorized, loadCollection, readCollection } from '../readCollection.js';

describe('readCollection', () => {
  it('reads a page, an envelope and a plain list', () => {
    assert.deepEqual(readCollection({ items: [1], totalPages: 3 }), {
      ok: true,
      items: [1],
      totalPages: 3,
      status: null,
    });
    assert.deepEqual(readCollection({ success: true, result: { items: [2], totalPages: 2 } }), {
      ok: true,
      items: [2],
      totalPages: 2,
      status: null,
    });
    assert.deepEqual(readCollection({ success: true, result: [3] }), {
      ok: true,
      items: [3],
      totalPages: 1,
      status: null,
    });
    assert.deepEqual(readCollection([4]), { ok: true, items: [4], totalPages: 1, status: null });
  });

  it('reads anything else as a failed load, never as an empty one', () => {
    assert.equal(readCollection(null).ok, false);
    assert.equal(readCollection({ success: false, status: 500 }).status, 500);
    assert.equal(readCollection({ result: { total: 0 } }).ok, false);
    assert.equal(readCollection('nope').ok, false);
  });
});

describe('loadCollection', () => {
  it('passes the parameters to the loader and reads its answer', async () => {
    const collection = await loadCollection(async (params) => ({ items: [params.page] }), {
      page: 2,
    });
    assert.deepEqual(collection.items, [2]);
  });

  it('keeps the status of a rejected load, and fails without a loader', async () => {
    const rejected = await loadCollection(async () => {
      throw Object.assign(new Error('expired'), { status: 401 });
    });
    assert.equal(rejected.ok, false);
    assert.equal(isUnauthorized(rejected), true);
    assert.equal((await loadCollection(undefined)).ok, false);
  });
});
