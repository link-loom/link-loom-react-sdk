import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeSelectedOptions,
  optionIdentityOf,
  optionLabelOf,
  optionsEqual,
  selectedOptionsOf,
} from '../options.helpers.js';

describe('option identity', () => {
  it('is the id, then the value, then the option itself', () => {
    assert.equal(optionIdentityOf({ id: 'a', value: 'b' }), 'a');
    assert.equal(optionIdentityOf({ value: 'b' }), 'b');
    assert.equal(optionIdentityOf('plain'), 'plain');
  });

  it('tells two options apart by it', () => {
    assert.equal(optionsEqual({ id: 'a', label: 'One' }, { id: 'a', label: 'Uno' }), true);
    assert.equal(optionsEqual({ id: 'a' }, { id: 'b' }), false);
    assert.equal(optionsEqual({ value: 'x' }, 'x'), true);
  });
});

describe('optionLabelOf', () => {
  it('reads the label, else the option as text, else nothing', () => {
    assert.equal(optionLabelOf({ label: 'Customer' }), 'Customer');
    assert.equal(optionLabelOf('plain'), 'plain');
    assert.equal(optionLabelOf(null), '');
  });
});

describe('selectedOptionsOf', () => {
  it('lists what is selected, whatever the mode', () => {
    assert.deepEqual(selectedOptionsOf(['a', 'b'], true), ['a', 'b']);
    assert.deepEqual(selectedOptionsOf(null, true), []);
    assert.deepEqual(selectedOptionsOf('a'), ['a']);
    assert.deepEqual(selectedOptionsOf(null), []);
  });
});

describe('mergeSelectedOptions', () => {
  const getOptionLabel = (option) => option.label;

  it('keeps the selection an option while the list narrows underneath it', () => {
    const merged = mergeSelectedOptions({
      options: [{ id: 'b', label: 'Beta' }],
      value: { id: 'a', label: 'Alpha' },
      getOptionLabel,
    });

    assert.deepEqual(merged.map(getOptionLabel), ['Beta', 'Alpha']);
  });

  it('does not repeat a selection the list already holds', () => {
    const merged = mergeSelectedOptions({
      options: [{ id: 'a', label: 'Alpha' }],
      value: [{ id: 'a', label: 'Alpha' }, { id: 'c', label: 'Gamma' }],
      multiple: true,
      getOptionLabel,
    });

    assert.deepEqual(merged.map(getOptionLabel), ['Alpha', 'Gamma']);
  });

  it('adds nothing for an empty selection', () => {
    const options = [{ id: 'a', label: 'Alpha' }];
    assert.deepEqual(mergeSelectedOptions({ options, value: null, getOptionLabel }), options);
    assert.deepEqual(mergeSelectedOptions({ options, value: [], multiple: true, getOptionLabel }), options);
  });
});
