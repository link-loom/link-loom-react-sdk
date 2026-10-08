import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PAGE_SIZE_OPTIONS, VIEW_MODES, resolveListLabels } from '../listSurface.labels.js';
import { VIEW_MODE_PARAM, resolveViewMode, viewModeOptions, viewModeParams } from '../viewMode.helpers.js';

describe('view modes', () => {
  it('are list and grid, frozen', () => {
    assert.deepEqual([...VIEW_MODES], ['list', 'grid']);
    assert.equal(Object.isFrozen(VIEW_MODES), true);
  });

  it('page sizes are 25, 50 and 100, frozen', () => {
    assert.deepEqual([...PAGE_SIZE_OPTIONS], [25, 50, 100]);
    assert.equal(Object.isFrozen(PAGE_SIZE_OPTIONS), true);
  });
});

describe('resolveViewMode', () => {
  it('shows the mode the address asks for when the list has it', () => {
    assert.equal(resolveViewMode({ requested: 'grid', defaultMode: 'list' }), 'grid');
  });

  it('falls back to the persisted default, then to the first mode', () => {
    assert.equal(resolveViewMode({ requested: null, defaultMode: 'grid' }), 'grid');
    assert.equal(resolveViewMode({ requested: 'tree', defaultMode: 'grid' }), 'grid');
    assert.equal(resolveViewMode({ requested: null, defaultMode: undefined }), 'list');
  });

  it('keeps to the modes of the list', () => {
    const modes = ['list', 'tree'];
    assert.equal(resolveViewMode({ requested: 'tree', modes, defaultMode: 'grid' }), 'tree');
    assert.equal(resolveViewMode({ requested: 'grid', modes, defaultMode: 'grid' }), 'list');
  });
});

describe('viewModeParams', () => {
  it('writes the mode and keeps the rest of the address', () => {
    const base = new URLSearchParams('?text=ana');
    const next = viewModeParams(base, 'grid');

    assert.equal(VIEW_MODE_PARAM, 'view');
    assert.equal(next.toString(), 'text=ana&view=grid');
    assert.equal(base.toString(), 'text=ana');
  });
});

describe('viewModeOptions', () => {
  it('names the modes in the language of the list', () => {
    const english = resolveListLabels();
    const spanish = resolveListLabels(undefined, 'es');

    assert.deepEqual(viewModeOptions(['list', 'grid', 'tree'], english), [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'tree', label: 'Tree' },
    ]);
    assert.deepEqual(
      viewModeOptions(VIEW_MODES, spanish).map((option) => option.label),
      ['Lista', 'Cuadrícula'],
    );
  });

  it('names a mode the kit does not know by its id', () => {
    assert.deepEqual(viewModeOptions(['calendar'], resolveListLabels()), [{ value: 'calendar', label: 'calendar' }]);
  });
});
