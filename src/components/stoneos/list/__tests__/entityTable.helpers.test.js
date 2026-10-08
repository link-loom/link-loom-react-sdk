import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PAGE_SIZE_OPTIONS, resolveListLabels } from '../listSurface.labels.js';
import {
  NARROW_CONTAINER_WIDTH,
  columnVisibilityOf,
  footerLabelsOf,
  hasMorePagesThanOne,
  isNarrowWidth,
  pageSizeOptionsFor,
  tableColumnsOf,
} from '../entityTable.helpers.js';

const COLUMNS = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'kind', headerName: 'Kind', minContainerWidth: 560 },
  { field: 'updated', headerName: 'Updated', minContainerWidth: 720, sortable: true },
];

describe('isNarrowWidth', () => {
  it('is narrow below 480px, once measured', () => {
    assert.equal(NARROW_CONTAINER_WIDTH, 480);
    assert.equal(isNarrowWidth(0), false);
    assert.equal(isNarrowWidth(479), true);
    assert.equal(isNarrowWidth(480), false);
  });
});

describe('pageSizeOptionsFor', () => {
  const pagination = { pageSize: 50 };

  it('keeps the page size alone in a narrow table with pagination', () => {
    assert.deepEqual(pageSizeOptionsFor({ width: 400, pagination, pageSizeOptions: PAGE_SIZE_OPTIONS }), [50]);
  });

  it('offers the options otherwise', () => {
    assert.deepEqual(pageSizeOptionsFor({ width: 900, pagination, pageSizeOptions: PAGE_SIZE_OPTIONS }), PAGE_SIZE_OPTIONS);
    assert.deepEqual(pageSizeOptionsFor({ width: 400, pagination: undefined, pageSizeOptions: [10] }), [10]);
  });
});

describe('columnVisibilityOf', () => {
  it('hides nothing before the container was measured', () => {
    assert.deepEqual(columnVisibilityOf(COLUMNS, 0), { visibility: { kind: true, updated: true }, key: '' });
  });

  it('steps aside the columns that do not fit, in column order', () => {
    assert.deepEqual(columnVisibilityOf(COLUMNS, 600), { visibility: { kind: true, updated: false }, key: 'updated' });
    assert.deepEqual(columnVisibilityOf(COLUMNS, 400), { visibility: { kind: false, updated: false }, key: 'kind,updated' });
    assert.deepEqual(columnVisibilityOf(COLUMNS, 720), { visibility: { kind: true, updated: true }, key: '' });
  });

  it('has nothing to say about columns without a minimum', () => {
    assert.deepEqual(columnVisibilityOf([{ field: 'name' }], 300), { visibility: {}, key: '' });
  });
});

describe('tableColumnsOf', () => {
  it('turns sorting off unless a column asks for it and keeps the minimum width to itself', () => {
    const columns = tableColumnsOf(COLUMNS);

    assert.deepEqual(
      columns.map((column) => [column.field, column.sortable]),
      [
        ['name', false],
        ['kind', false],
        ['updated', true],
      ],
    );
    assert.equal(
      columns.some((column) => 'minContainerWidth' in column),
      false,
    );
  });
});

describe('footerLabelsOf', () => {
  it('words the paginator in the locale', () => {
    const english = footerLabelsOf(resolveListLabels());
    const spanish = footerLabelsOf(resolveListLabels(undefined, 'es'));

    assert.equal(english.rowsPerPageLabel, 'Rows per page:');
    assert.equal(english.displayedRowsLabel({ from: 1, to: 25, count: 80 }), '1–25 of 80');
    assert.deepEqual(english.pageLabels, {
      first: 'First page',
      last: 'Last page',
      next: 'Next page',
      previous: 'Previous page',
    });
    assert.equal(spanish.displayedRowsLabel({ from: 26, to: 50, count: 80 }), '26–50 de 80');
    assert.equal(spanish.pageLabels.next, 'Página siguiente');
  });
});

describe('hasMorePagesThanOne', () => {
  it('is true only when the total does not fit one page', () => {
    assert.equal(hasMorePagesThanOne(undefined), false);
    assert.equal(hasMorePagesThanOne({ totalItems: 25, pageSize: 25 }), false);
    assert.equal(hasMorePagesThanOne({ totalItems: 26, pageSize: 25 }), true);
  });
});
