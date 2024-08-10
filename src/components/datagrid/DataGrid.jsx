import React from 'react';
import {
  DataGrid as MuiDataGrid,
  GridToolbarQuickFilter,
  enUS,
  GridToolbar,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import { Box } from '@mui/material';

const boxStyles = {
  '.MuiTablePagination-displayedRows': {
    marginBottom: 0,
  },
  '.MuiTablePagination-selectLabel': {
    marginBottom: 0,
  },
  '.MuiTableSelect-select': {
    padding: 0,
  },
  width: '100%',
};

const DataGrid = (props) => {
  const {
    rows,
    columns,
    paginationModel,
    setPaginationModel,
    totalRows,
    localeText = enUS.components.MuiDataGrid.defaultProps.localeText,
    disableRowSelectionOnClick = true,
    slots = {},
    slotProps = {},
    initialState = { pagination: { paginationModel: { pageSize: 7 } } },
    pageSizeOptions = [5, 10, 20, 50],
    ...rest
  } = props;

  const CustomSearchToolbar = () => {
    return (
      <GridToolbarContainer>
        <div className="col-12 d-flex flex-column mt-3">
          <div className="d-flex justify-content-between mb-3">
            <GridToolbar />
            <GridToolbarQuickFilter className="me-3 border-1" placeholder="Search..." />
          </div>
        </div>
      </GridToolbarContainer>
    );
  };

  const defaultSlots = {
    toolbar: CustomSearchToolbar,
    ...slots,
  };

  const defaultSlotProps = {
    toolbar: {
      showQuickFilter: true,
    },
    ...slotProps,
  };

  const defaultDataGridProps = {
    disableRowSelectionOnClick,
    slots: defaultSlots,
    slotProps: defaultSlotProps,
    initialState,
    pageSizeOptions,
  };

  const dataGridProps = {
    rows,
    columns,
    localeText,
    ...(paginationModel &&
      setPaginationModel &&
      totalRows && {
        paginationModel,
        onPaginationModelChange: setPaginationModel,
        rowCount: totalRows,
        paginationMode: 'server',
      }),
    ...defaultDataGridProps,
    ...rest,
  };

  return (
    <Box sx={boxStyles}>
      <MuiDataGrid {...dataGridProps} />
    </Box>
  );
};

export default DataGrid;
