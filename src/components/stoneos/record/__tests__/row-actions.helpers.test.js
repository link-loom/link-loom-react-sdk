import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROW_ACTIONS,
  ROW_ACTION_HANDLERS,
  ROW_ACTION_LABELS,
  buildRowActionItems,
} from '../row-actions.helpers.js';
import { resolveLabels } from '../../shared/labels.helpers.js';

const record = { id: 'rec-1' };
const labels = ROW_ACTION_LABELS.en;
const icons = Object.fromEntries(ROW_ACTIONS.map((action) => [action, `icon:${action}`]));

const handlersThat = (calls) =>
  Object.fromEntries(
    Object.values(ROW_ACTION_HANDLERS).map((name) => [name, (received) => calls.push([name, received])]),
  );

describe('row actions catalog', () => {
  it('lists the seven standard actions, frozen', () => {
    assert.deepEqual([...ROW_ACTIONS], [
      'quickview',
      'edit',
      'open-page',
      'open-new-tab',
      'copy-id',
      'copy-link',
      'delete',
    ]);
    assert.equal(Object.isFrozen(ROW_ACTIONS), true);
  });

  it('asks one handler per action', () => {
    assert.deepEqual(
      ROW_ACTIONS.map((action) => ROW_ACTION_HANDLERS[action]),
      ['quickview', 'edit', 'openPage', 'openNewTab', 'copyId', 'copyLink', 'remove'],
    );
  });

  it('has the same actions in English and Spanish', () => {
    assert.deepEqual(Object.keys(ROW_ACTION_LABELS.en).sort(), [...ROW_ACTIONS].sort());
    assert.deepEqual(Object.keys(ROW_ACTION_LABELS.es), Object.keys(ROW_ACTION_LABELS.en));
  });
});

describe('buildRowActionItems', () => {
  it('builds the items in catalog order with their label and icon', () => {
    const items = buildRowActionItems({ record, handlers: handlersThat([]), labels, icons });

    assert.deepEqual(
      items.map((item) => item.id),
      [...ROW_ACTIONS],
    );
    assert.equal(items[1].label, 'Edit');
    assert.equal(items[1].icon, 'icon:edit');
  });

  it('leaves out an action without a handler', () => {
    const items = buildRowActionItems({
      record,
      handlers: { edit: () => {}, copyLink: () => {} },
      labels,
      icons,
    });

    assert.deepEqual(
      items.map((item) => item.id),
      ['edit', 'copy-link'],
    );
  });

  it('leaves out what is not a function and what the catalog does not know', () => {
    const items = buildRowActionItems({
      actions: ['edit', 'archive', 'copy-id'],
      record,
      handlers: { edit: () => {}, copyId: 'nope', archive: () => {} },
      labels,
    });

    assert.deepEqual(
      items.map((item) => item.id),
      ['edit'],
    );
  });

  it('follows the order of `actions` and lists each once', () => {
    const items = buildRowActionItems({
      actions: ['copy-link', 'edit', 'copy-link'],
      record,
      handlers: handlersThat([]),
      labels,
    });

    assert.deepEqual(
      items.map((item) => item.id),
      ['copy-link', 'edit'],
    );
  });

  it('runs the handler with the record', () => {
    const calls = [];
    const items = buildRowActionItems({ record, handlers: handlersThat(calls), labels });

    items.forEach((item) => item.onClick());

    assert.deepEqual(
      calls.map(([name]) => name),
      ['quickview', 'edit', 'openPage', 'openNewTab', 'copyId', 'copyLink', 'remove'],
    );
    assert.equal(
      calls.every(([, received]) => received === record),
      true,
    );
  });

  it('marks delete as danger, set apart by a divider', () => {
    const items = buildRowActionItems({ record, handlers: handlersThat([]), labels });
    const remove = items.at(-1);

    assert.equal(remove.id, 'delete');
    assert.equal(remove.danger, true);
    assert.equal(remove.dividerBefore, true);
    assert.equal(
      items.slice(0, -1).some((item) => item.danger || item.dividerBefore),
      false,
    );
  });

  it('asks for no divider when delete would open the menu, which would make the menu drop it', () => {
    const items = buildRowActionItems({ record, handlers: { remove: () => {} }, labels });

    assert.equal(items.length, 1);
    assert.equal(items[0].danger, true);
    assert.equal(items[0].dividerBefore, false);
  });

  it('writes the labels of the locale, with the overrides of the app on top', () => {
    const spanish = buildRowActionItems({
      actions: ['edit', 'delete'],
      record,
      handlers: handlersThat([]),
      labels: resolveLabels(ROW_ACTION_LABELS, { delete: 'Borrar' }, 'es-CO'),
    });

    assert.deepEqual(
      spanish.map((item) => item.label),
      ['Editar', 'Borrar'],
    );
  });

  it('gives an empty menu when nothing can run', () => {
    assert.deepEqual(buildRowActionItems({ record, labels }), []);
  });
});
