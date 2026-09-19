import React from 'react';
import { TablePagination } from '@mui/material';

const DEFAULT_PAGE_LABELS = {
  first: 'First page',
  last: 'Last page',
  next: 'Next page',
  previous: 'Previous page',
};

const defaultDisplayedRows = ({ from, to, count }) =>
  `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;

// The single paginator under a (grouped) DataTable, bound to the shared `paginationModel`.
function TableFooter({
  count = 0,
  page = 0,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50],
  onChange,
  rowsPerPageLabel = 'Rows per page:',
  displayedRowsLabel = defaultDisplayedRows,
  pageLabels = DEFAULT_PAGE_LABELS,
  sx = {},
}) {
  const lastPage = Math.max(0, Math.ceil(count / pageSize) - 1);
  const safePage = count ? Math.min(page, lastPage) : 0;

  return (
    <TablePagination
      component="div"
      count={count}
      page={safePage}
      rowsPerPage={pageSize}
      rowsPerPageOptions={pageSizeOptions}
      onPageChange={(_event, nextPage) => onChange?.({ page: nextPage, pageSize })}
      onRowsPerPageChange={(event) =>
        onChange?.({ page: 0, pageSize: Number(event.target.value) })
      }
      labelRowsPerPage={rowsPerPageLabel}
      labelDisplayedRows={displayedRowsLabel}
      getItemAriaLabel={(type) => pageLabels[type] || pageLabels.previous}
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        color: 'text.secondary',
        minHeight: 44,
        '& .MuiTablePagination-toolbar': { minHeight: 44, pl: 1.5 },
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { m: 0 },
        ...sx,
      }}
    />
  );
}

export default TableFooter;
