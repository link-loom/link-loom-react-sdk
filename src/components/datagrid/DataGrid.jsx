import React, { useState, useEffect, useRef } from 'react';
import {
  DataGrid as MuiDataGrid,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem, ListItemText, ButtonGroup, Button } from '@mui/material';

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
    disableRowSelectionOnClick = true,
    slots = {},
    slotProps = {},
    initialState = { pagination: { paginationModel: { pageSize: 5 } } },
    pageSizeOptions = [5, 10, 20, 50],
    showExport = false,
    onMenuItemClick,
    actions = [],
    enableActions = false,
    sx = {},
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
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });

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

            <GridToolbarQuickFilter
              className="me-3 border-1"
              placeholder="Search..."
              inputRef={inputRef}
            />
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
              data-testid="datagrid-action-menu-btn"
              aria-label="actions button"
              id={`list-item-menu-${params.row?.id}`}
              aria-haspopup="true"
              sx={{ paddingBottom: 0, paddingTop: 0 }}
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
                'aria-labelledby': 'datagrid-action-menu-btn',
              }}
            >
              {actions.map((action, index) =>
                action.type === 'group' ? (
                  <MenuItem
                    key={index}
                    disableRipple
                    disableTouchRipple
                    sx={{
                      cursor: 'default',
                      '&:hover': {
                        backgroundColor: 'inherit',
                      },
                    }}
                  >
                    <ButtonGroup variant="outlined" aria-label="grouped actions" size="small">
                      {action.items.map((item, idx) => (
                        <Button
                          key={idx}
                          onClick={(event) => handleMenuItemClick(event, item.id, params)}
                          data-testid={`datagrid-${action.id}-action-btn`}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </MenuItem>
                ) : (
                  <MenuItem
                    key={index}
                    onClick={(event) => handleMenuItemClick(event, action.id, params)}
                    data-testid={`datagrid-${action.id}-action-btn`}
                  >
                    {action.icon}
                    <ListItemText>{action.label}</ListItemText>
                  </MenuItem>
                ),
              )}
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
    ...defaultDataGridProps,
    ...rest,
  };

  return (
    <Box sx={boxStyles}>
      <MuiDataGrid
        {...dataGridProps}
        sx={{
          ...sx,
        }}
      />
    </Box>
  );
};

export default DataGrid;
