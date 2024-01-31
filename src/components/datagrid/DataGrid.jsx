import {
  DataGrid,
  GridToolbarQuickFilter,
  esES,
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
  const { rows, columns, paginationModel, setPaginationModel, totalRows } =
    props;

  function CustomSearchToolbar() {
    return (
      <div className="col-12 d-flex flex-column mt-3">
        <div className="d-flex justify-content-between mb-3">
          <GridToolbarContainer>
            <GridToolbar />
          </GridToolbarContainer>

          <GridToolbarQuickFilter
            className="me-3 border-1"
            placeholder="Buscar..."
          />
        </div>
      </div>
    );
  }

  const dataGridProps = {
    rows,
    columns,
    localeText: esES.components.MuiDataGrid.defaultProps.localeText,
    ...(paginationModel &&
      setPaginationModel &&
      totalRows && {
        paginationModel,
        onPaginationModelChange: setPaginationModel,
        rowCount: totalRows,
        paginationMode: 'server',
      }),
  };

  return (
    <Box sx={boxStyles}>
      <DataGrid
        {...dataGridProps}
        disableRowSelectionOnClick
        slots={{
          toolbar: CustomSearchToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        initialState={{ pagination: { paginationModel: { pageSize: 7 } } }}
        pageSizeOptions={[7, 10, 20, 50]}
      />
    </Box>
  );
};

export default DataGrid;
