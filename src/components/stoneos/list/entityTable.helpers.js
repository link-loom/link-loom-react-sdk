import { interpolate } from '../shared/labels.helpers.js';

// Below this width the paginator keeps only the range and the arrows.
export const NARROW_CONTAINER_WIDTH = 480;

export const isNarrowWidth = (width) => width > 0 && width < NARROW_CONTAINER_WIDTH;

// A narrow table keeps the page size it has instead of offering a selector that does not fit.
export const pageSizeOptionsFor = ({ width, pagination, pageSizeOptions }) =>
  isNarrowWidth(width) && pagination ? [pagination.pageSize] : pageSizeOptions;

// Which columns fit the table's own container. A column that declares `minContainerWidth` steps aside
// below it; nothing is hidden before the container was measured. `key` names the hidden ones: the grid
// sizes its flexible column once, so a new set of visible columns mounts it again.
export const columnVisibilityOf = (columns, width) => {
  const visibility = Object.fromEntries(
    columns
      .filter((column) => column.minContainerWidth)
      .map((column) => [column.field, !width || width >= column.minContainerWidth]),
  );
  const key = Object.entries(visibility)
    .filter(([, shown]) => !shown)
    .map(([field]) => field)
    .join(',');

  return { visibility, key };
};

// DataTable columns: sorting is off unless a column asks for it, and `minContainerWidth` stays with us.
export const tableColumnsOf = (columns) =>
  columns.map(({ minContainerWidth, ...column }) => ({ sortable: false, ...column }));

export const footerLabelsOf = (labels) => ({
  rowsPerPageLabel: labels.rowsPerPage,
  displayedRowsLabel: ({ from, to, count }) => interpolate(labels.displayedRows, { from, to, count }),
  pageLabels: {
    first: labels.firstPage,
    last: labels.lastPage,
    next: labels.nextPage,
    previous: labels.previousPage,
  },
});

// The paginator below the grid of cards is for more than one page only.
export const hasMorePagesThanOne = (pagination) => Boolean(pagination) && pagination.totalItems > pagination.pageSize;
