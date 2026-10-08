import React from 'react';
import { Box } from '@mui/material';
import DataTable from '../data-table/DataTable.component.jsx';
import TableFooter from '../data-table/TableFooter.component.jsx';
import DocumentCard from '../document-card/DocumentCard.component.jsx';
import RowActionsMenu from '../row-actions-menu/RowActionsMenu.component.jsx';
import useElementWidth from './useElementWidth.hook.js';
import { PAGE_SIZE_OPTIONS, resolveListLabels } from './listSurface.labels.js';
import {
  columnVisibilityOf,
  footerLabelsOf,
  hasMorePagesThanOne,
  pageSizeOptionsFor,
  tableColumnsOf,
} from './entityTable.helpers.js';

// Rows as a DataTable (list, default) or DocumentCard tiles (grid), one page at a time. `columns` are
// DataTable columns; one may carry `minContainerWidth`: below that width of the table's own container
// (phones, the Command Center panel) the column steps aside. `pagination` is { page (1-based), pageSize,
// totalItems, onChange({ page, pageSize }) }; without it the table shows what it is given.
// `card(row)` answers { title, meta, icon, thumbnailUrl } for the grid. `getActions(row)` answers the
// items of the row's RowActionsMenu.
function EntityTable({
  rows,
  columns = [],
  loading,
  viewMode = 'list',
  pagination,
  getActions,
  onOpen,
  card,
  untitledLabel,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  labels,
  locale = 'en',
}) {
  // -----------------------------------------------------
  // 1. Hooks
  // -----------------------------------------------------
  const text = resolveListLabels(labels, locale);
  const [measureRef, width] = useElementWidth();

  // -----------------------------------------------------
  // 4. Configs / Constants
  // -----------------------------------------------------
  const sizes = pageSizeOptionsFor({ width, pagination, pageSizeOptions });
  const footerLabels = footerLabelsOf(text);
  const { visibility, key: visibilityKey } = columnVisibilityOf(columns, width);
  const tableColumns = [
    ...tableColumnsOf(columns),
    ...(getActions
      ? [
          {
            field: 'actions',
            headerName: '',
            width: 56,
            sortable: false,
            align: 'right',
            renderCell: ({ row }) => (
              <RowActionsMenu items={getActions(row)} label={text.options} className="stos-reveal-on-hover" />
            ),
          },
        ]
      : []),
  ];

  // -----------------------------------------------------
  // 7. Render
  // -----------------------------------------------------
  const renderGrid = () => (
    <>
      <Box className="stos-collection--grid">
        {rows.map((row) => {
          const info = card(row);
          return (
            <DocumentCard
              key={row.id}
              variant="tile"
              title={info.title}
              meta={info.meta}
              icon={info.icon}
              thumbnailUrl={info.thumbnailUrl}
              actions={getActions ? getActions(row) : []}
              actionsLabel={text.options}
              untitledLabel={untitledLabel || text.untitled}
              onOpen={() => onOpen(row)}
            />
          );
        })}
      </Box>
      {hasMorePagesThanOne(pagination) && (
        <TableFooter
          count={pagination.totalItems}
          page={pagination.page - 1}
          pageSize={pagination.pageSize}
          pageSizeOptions={sizes}
          onChange={({ page, pageSize }) => pagination.onChange({ page: page + 1, pageSize })}
          {...footerLabels}
        />
      )}
    </>
  );

  const renderList = () => (
    <DataTable
      // The grid sizes its flexible column once; a new set of visible columns mounts it again so the column
      // takes the width the hidden ones leave.
      key={visibilityKey}
      rows={rows}
      columns={tableColumns}
      loading={loading}
      onRowClick={(row) => onOpen(row)}
      getRowClassName={() => 'stos-reveal-host'}
      pageSizeOptions={sizes}
      hideFooter={!pagination}
      columnVisibilityModel={visibility}
      {...(pagination
        ? {
            paginationMode: 'server',
            rowCount: pagination.totalItems,
            paginationModel: { page: pagination.page - 1, pageSize: pagination.pageSize },
            onPaginationModelChange: ({ page, pageSize }) => pagination.onChange({ page: page + 1, pageSize }),
          }
        : {})}
      footerLabels={footerLabels}
    />
  );

  return (
    <Box ref={measureRef} sx={{ minWidth: 0 }}>
      {viewMode === 'grid' && card ? renderGrid() : renderList()}
    </Box>
  );
}

export default EntityTable;
