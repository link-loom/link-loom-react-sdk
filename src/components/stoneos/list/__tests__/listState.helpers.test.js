import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SEARCH_DEBOUNCE_MS,
  applyListPatch,
  clearListParams,
  hasActiveFilters,
  readListValues,
} from '../listState.helpers.js';

const FILTERS = { text: 'text', roles: 'list', incomplete: 'flag' };
const read = (search) => readListValues(new URLSearchParams(search), FILTERS);

describe('list defaults', () => {
  it('start on page 1 with 25 rows and wait 300ms for the search', () => {
    assert.equal(DEFAULT_PAGE, 1);
    assert.equal(DEFAULT_PAGE_SIZE, 25);
    assert.equal(DEFAULT_SEARCH_DEBOUNCE_MS, 300);
  });
});

describe('readListValues', () => {
  it('reads text, list and flag filters from the address', () => {
    assert.deepEqual(read('?text=pollo&roles=customer,supplier&incomplete=true'), {
      text: 'pollo',
      roles: ['customer', 'supplier'],
      incomplete: true,
    });
  });

  it('reads what is missing as empty', () => {
    assert.deepEqual(read(''), { text: '', roles: [], incomplete: false });
  });

  it('skips empty entries of a list and reads a flag only when it says true', () => {
    assert.deepEqual(read('?roles=a,,b&incomplete=1').roles, ['a', 'b']);
    assert.equal(read('?incomplete=1').incomplete, false);
  });

  it('reads only the filters the list declares', () => {
    assert.deepEqual(Object.keys(read('?view=grid&text=x')), ['text', 'roles', 'incomplete']);
  });
});

describe('applyListPatch', () => {
  it('writes text, lists and flags to the address', () => {
    const next = applyListPatch(new URLSearchParams(), { text: 'ana', roles: ['customer', 'supplier'], incomplete: true });
    assert.equal(next.get('text'), 'ana');
    assert.equal(next.get('roles'), 'customer,supplier');
    assert.equal(next.get('incomplete'), 'true');
  });

  it('drops a filter that was emptied', () => {
    const next = applyListPatch(new URLSearchParams('?text=ana&roles=a&incomplete=true&tag=x'), {
      text: '',
      roles: [],
      incomplete: false,
      tag: null,
    });
    assert.equal(next.toString(), '');
  });

  it('keeps a zero, which is a value', () => {
    assert.equal(applyListPatch(new URLSearchParams(), { page: 0 }).get('page'), '0');
  });

  it('keeps what it was not asked to change and does not touch the original', () => {
    const base = new URLSearchParams('?view=grid&text=ana');
    const next = applyListPatch(base, { text: 'bo' });

    assert.equal(next.toString(), 'view=grid&text=bo');
    assert.equal(base.toString(), 'view=grid&text=ana');
  });
});

describe('clearListParams', () => {
  it('clears only the filters of the list', () => {
    const next = clearListParams(new URLSearchParams('?text=x&view=grid&incomplete=true&id=abc'), Object.keys(FILTERS));
    assert.equal(next.toString(), 'view=grid&id=abc');
  });
});

describe('hasActiveFilters', () => {
  it('is true when any filter has a value', () => {
    assert.equal(hasActiveFilters({ text: '', roles: [], incomplete: false }), false);
    assert.equal(hasActiveFilters({ text: 'x', roles: [], incomplete: false }), true);
    assert.equal(hasActiveFilters({ text: '', roles: ['a'], incomplete: false }), true);
    assert.equal(hasActiveFilters({ text: '', roles: [], incomplete: true }), true);
  });
});
