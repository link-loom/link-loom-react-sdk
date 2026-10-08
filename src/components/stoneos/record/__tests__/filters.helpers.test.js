import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { menuFilterChip } from '../filters.helpers.js';

const OPTIONS = [
  { id: 'customer', label: 'Customer' },
  { id: 'supplier', label: 'Supplier' },
  { id: 'carrier', label: 'Carrier' },
];

const chipOf = (overrides) =>
  menuFilterChip({ id: 'roles', label: 'Roles', icon: 'icon', options: OPTIONS, onChange: () => {}, ...overrides });

describe('menuFilterChip', () => {
  it('names the filter alone while nothing is selected', () => {
    const chip = chipOf({ value: [], multiple: true });

    assert.equal(chip.id, 'roles');
    assert.equal(chip.icon, 'icon');
    assert.equal(chip.label, 'Roles');
    assert.equal(chip.active, false);
  });

  it('names the selection of a single filter', () => {
    const chip = chipOf({ value: 'supplier' });

    assert.equal(chip.label, 'Roles: Supplier');
    assert.equal(chip.active, true);
  });

  it('names the first of several and counts the rest', () => {
    assert.equal(chipOf({ value: ['customer'], multiple: true }).label, 'Roles: Customer');
    assert.equal(chipOf({ value: ['customer', 'carrier', 'supplier'], multiple: true }).label, 'Roles: Customer +2');
  });

  it('falls back to the id of a selection that is not an option', () => {
    assert.equal(chipOf({ value: 'ghost' }).label, 'Roles: ghost');
  });

  it('opens with an item that clears, then one item per option, checked as selected', () => {
    const { menu } = chipOf({ value: ['carrier'], multiple: true });

    assert.deepEqual(
      menu.map((item) => [item.id, item.label, item.checked]),
      [
        ['roles:all', 'Any', false],
        ['customer', 'Customer', false],
        ['supplier', 'Supplier', false],
        ['carrier', 'Carrier', true],
      ],
    );
    assert.equal(chipOf({ value: [], multiple: true }).menu[0].checked, true);
  });

  it('clears a single filter with an empty string and a multiple one with an empty list', () => {
    const single = [];
    const several = [];
    chipOf({ value: 'customer', onChange: (next) => single.push(next) }).menu[0].onClick();
    chipOf({ value: ['customer'], multiple: true, onChange: (next) => several.push(next) }).menu[0].onClick();

    assert.deepEqual(single, ['']);
    assert.deepEqual(several, [[]]);
  });

  it('picks an option of a single filter and picks it off again', () => {
    const picks = [];
    chipOf({ value: '', onChange: (next) => picks.push(next) }).menu[2].onClick();
    chipOf({ value: 'supplier', onChange: (next) => picks.push(next) }).menu[2].onClick();

    assert.deepEqual(picks, ['supplier', '']);
  });

  it('toggles the options of a multiple filter', () => {
    const picks = [];
    chipOf({ value: ['customer'], multiple: true, onChange: (next) => picks.push(next) }).menu[2].onClick();
    chipOf({ value: ['customer', 'supplier'], multiple: true, onChange: (next) => picks.push(next) }).menu[1].onClick();

    assert.deepEqual(picks, [['customer', 'supplier'], ['supplier']]);
  });

  it('shows the selection of a locked filter without a menu', () => {
    const chip = chipOf({ value: 'customer', locked: true });

    assert.equal(chip.menu, undefined);
    assert.equal(chip.label, 'Roles: Customer');
    assert.equal(chip.active, true);
  });

  it('writes its sentences in the locale and lets the app override them', () => {
    const spanish = chipOf({ value: ['customer', 'carrier'], multiple: true, locale: 'es' });
    assert.equal(spanish.label, 'Roles: Customer +1');
    assert.equal(spanish.menu[0].label, 'Cualquiera');

    const custom = chipOf({ value: ['customer', 'carrier'], multiple: true, labels: { filterMany: '{label} ({more}) {value}' } });
    assert.equal(custom.label, 'Roles (1) Customer');
  });

  it('uses the translator of the app when it gives one, with the keys the app already has', () => {
    const t = (key, params) => (params ? `${key}|${JSON.stringify(params)}` : key);
    const chip = chipOf({ t, value: ['customer', 'carrier'], multiple: true });

    assert.equal(chip.label, 'list.filterMany|{"label":"Roles","value":"Customer","more":1}');
    assert.equal(chip.menu[0].label, 'list.filterAll');
    assert.equal(chipOf({ t, value: 'customer' }).label, 'list.filterOne|{"label":"Roles","value":"Customer"}');
  });
});
