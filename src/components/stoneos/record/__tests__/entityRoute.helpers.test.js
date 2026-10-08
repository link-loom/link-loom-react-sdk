import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ENTITY_ROUTE_PARAMS,
  clearActionParams,
  clearOpenParams,
  closeEntityParams,
  createEntityParams,
  openEntityParams,
  readEntityRoute,
  resolveEntityRouteParams,
} from '../entityRoute.helpers.js';

const NAMES = resolveEntityRouteParams();
const read = (search, names = NAMES) => readEntityRoute(new URLSearchParams(search), names);

describe('entity route params', () => {
  it('default to id, new, open and action', () => {
    assert.deepEqual({ ...ENTITY_ROUTE_PARAMS }, { id: 'id', create: 'new', open: 'open', action: 'action' });
    assert.deepEqual(NAMES, ENTITY_ROUTE_PARAMS);
    assert.equal(Object.isFrozen(ENTITY_ROUTE_PARAMS), true);
  });

  it('can be renamed one by one, and ignore what is not a name', () => {
    const names = resolveEntityRouteParams({ id: 'record', create: '', open: 42, action: 'do' });
    assert.deepEqual(names, { id: 'record', create: 'new', open: 'open', action: 'do' });
  });

  it('never change the defaults', () => {
    resolveEntityRouteParams({ id: 'record' });
    assert.equal(ENTITY_ROUTE_PARAMS.id, 'id');
  });
});

describe('readEntityRoute', () => {
  it('reads the open record and its action', () => {
    assert.deepEqual(read('?id=abc&action=approve'), {
      openId: 'abc',
      creating: false,
      openValue: null,
      action: 'approve',
    });
  });

  it('opens the create form only for new=1, and an open record wins over it', () => {
    assert.equal(read('?new=1').creating, true);
    assert.equal(read('?new=true').creating, false);
    assert.equal(read('?id=abc&new=1').creating, false);
  });

  it('reads the value to resolve only while no record is open', () => {
    assert.equal(read('?open=ABC-1').openValue, 'ABC-1');
    assert.equal(read('?id=abc&open=ABC-1').openValue, null);
  });

  it('reads an empty action as an empty string and nothing as nulls', () => {
    assert.deepEqual(read(''), { openId: null, creating: false, openValue: null, action: '' });
  });

  it('follows renamed params', () => {
    const names = resolveEntityRouteParams({ id: 'record', create: 'add' });
    assert.equal(read('?record=7', names).openId, '7');
    assert.equal(read('?id=7', names).openId, null);
    assert.equal(read('?add=1', names).creating, true);
  });
});

describe('address after a move', () => {
  it('opening drops the create form, the value and the old action, keeps the rest', () => {
    const params = openEntityParams('?new=1&open=x&action=old&text=ana&view=grid', NAMES, 'abc');
    assert.equal(params.toString(), 'text=ana&view=grid&id=abc');
  });

  it('opening can carry an action', () => {
    assert.equal(openEntityParams('', NAMES, 'abc', 'approve').toString(), 'id=abc&action=approve');
  });

  it('opening replaces the record that was open', () => {
    assert.equal(openEntityParams('?id=old&text=ana', NAMES, 'abc').toString(), 'id=abc&text=ana');
  });

  it('creating drops the record, the value and the action', () => {
    assert.equal(createEntityParams('?id=abc&open=x&action=a&text=ana', NAMES).toString(), 'text=ana&new=1');
  });

  it('closing drops all four and keeps the filters', () => {
    assert.equal(closeEntityParams('?id=abc&new=1&open=x&action=a&text=ana', NAMES).toString(), 'text=ana');
  });

  it('clearing the action keeps the record open, clearing the value keeps the action', () => {
    assert.equal(clearActionParams('?id=abc&action=a', NAMES).toString(), 'id=abc');
    assert.equal(clearOpenParams('?open=x&action=a', NAMES).toString(), 'action=a');
  });

  it('does not change the params it was given', () => {
    const base = new URLSearchParams('?id=abc');
    closeEntityParams(base, NAMES);
    assert.equal(base.toString(), 'id=abc');
  });

  it('works on renamed params', () => {
    const names = resolveEntityRouteParams({ id: 'record', create: 'add', action: 'do' });
    assert.equal(openEntityParams('', names, '7', 'approve').toString(), 'record=7&do=approve');
    assert.equal(createEntityParams('?record=7', names).toString(), 'add=1');
    assert.equal(closeEntityParams('?record=7&add=1&do=x&id=untouched', names).toString(), 'id=untouched');
  });
});
