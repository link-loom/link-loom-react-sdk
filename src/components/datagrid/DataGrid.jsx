import React, { useState } from 'react';
import {
  DataGrid as MuiDataGrid,
  GridToolbarQuickFilter,
  enUS,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem, ListItemText } from '@mui/material';

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
    localeText = enUS.components.MuiDataGrid.defaultProps.localeText,
    disableRowSelectionOnClick = true,
    slots = {},
    slotProps = {},
    initialState = { pagination: { paginationModel: { pageSize: 5 } } },
    pageSizeOptions = [5, 10, 20, 50],
    showExport = false,
    onMenuItemClick,
    actions = [],
    enableActions = false,
    ...rest
  } = props;

  const [menuActionsAnchorElement, setMenuActionsAnchorElement] = useState(null);
  const [menuActionsSelected, setActionsSelected] = useState(null);

  const actionsMenuOnClick = (selector, anchorElement) => {
    setActionsSelected(selector || null);
    setMenuActionsAnchorElement(anchorElement || null);
  };

  const closeMenuActions = () => {
    setActionsSelected(null);
    setMenuActionsAnchorElement(null);
  };

  const handleMenuItemClick = (event, action, params) => {
    event.stopPropagation();
    closeMenuActions();
    if (onMenuItemClick) {
      onMenuItemClick(action, params?.row ?? {});
    }
  };

  const CustomSearchToolbar = () => {
    return (
      <GridToolbarContainer>
        <section className="col-12 d-flex flex-column mt-3">
          <div className="d-flex justify-content-between mb-3">
            <section>
              <GridToolbarColumnsButton />
              <GridToolbarFilterButton />
              <GridToolbarDensitySelector />

              {showExport && <GridToolbarExport />}
            </section>

            <GridToolbarQuickFilter className="me-3 border-1" placeholder="Search..." />
          </div>
        </section>
      </GridToolbarContainer>
    );
  };

  const enhancedColumns = columns.map((column) => {
    if (column.field === 'actions' && enableActions) {
      return {
        ...column,
        renderCell: (params) => (
          <>
            <IconButton
              disableRipple
              data-testid="user-action-menu-btn"
              aria-label="actions button"
              id={`list-item-menu-${params.row?.id}`}
              aria-haspopup="true"
              onClick={(event) =>
                actionsMenuOnClick(`list-item-menu-${params.row?.id}`, event.currentTarget)
              }
            >
              <i className="mdi mdi-dots-vertical fs-4"></i>
            </IconButton>
            <Menu
              elevation={1}
              id={'list-item-menu-' + params.row?.id}
              anchorEl={menuActionsAnchorElement}
              open={menuActionsSelected === `list-item-menu-${params.row?.id}`}
              onClose={closeMenuActions}
              MenuListProps={{
                'aria-labelledby': 'user-action-menu-btn',
              }}
            >
              {actions.map((action, index) => (
                <MenuItem
                  key={index}
                  onClick={(event) => handleMenuItemClick(event, action.id, params)}
                  data-testid={`user-${action.id}-action-btn`}
                >
                  {action.icon}
                  <ListItemText>{action.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </>
        ),
      };
    }
    return column;
  });

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
    columns: enhancedColumns,
    localeText,
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
