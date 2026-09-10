import React, { useState, useMemo } from 'react';
import { DataGrid as MuiDataGrid, GRID_CHECKBOX_SELECTION_FIELD } from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem, ListItemText, ButtonGroup, Button } from '@mui/material';
import { MoreVert as MoreVertIcon, MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { DefaultToolbar } from './toolbars.jsx';
import { resolvePreset, buildDataGridProps, deepMerge } from './presets.js';

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

// What the grid has always used when the consumer passes nothing.
const LEGACY_INITIAL_STATE = { pagination: { paginationModel: { pageSize: 5 } } };
const LEGACY_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const HIDE_HEADER_SX = { '& .MuiDataGrid-columnHeaders': { display: 'none' } };

const toSxArray = (value) => (Array.isArray(value) ? value : [value]);

/**
 * DataGrid
 *
 * Wraps MUI's DataGrid with a row-actions menu and a configurable look.
 *
 * Style configuration (all optional, all additive):
 *   preset       'legacy' | 'list' | 'compact' | 'card' | 'admin'   (default 'legacy' = today's behaviour)
 *   tableStyle   partial style object deep-merged over the preset
 *   locale       'en' | 'es'   overrides the preset's locale
 *   toolbar      'none' | 'default' | 'search' | Component   overrides the preset's toolbar
 *   hideHeader   boolean   collapses the column headers (for stacked grids)
 *   actionsIcon  'vertical' | 'horizontal'   icon of the row-actions button
 *
 * Any explicit MUI prop (rowHeight, columnHeaderHeight, localeText, slots,
 * slotProps, initialState, pageSizeOptions, sx, ...) passed by the consumer
 * takes precedence over whatever the preset produced.
 */
const DataGrid = (props) => {
  const {
    rows,
    columns,
    disableRowSelectionOnClick = true,
    slots = {},
    slotProps = {},
    initialState: initialStateProp,
    pageSizeOptions: pageSizeOptionsProp,
    showExport = false,
    onMenuItemClick,
    actions = [],
    enableActions = false,
    sx = {},
    preset = 'legacy',
    tableStyle = {},
    locale,
    toolbar,
    hideHeader = false,
    actionsIcon,
    ...rest
  } = props;

  const [menuActionsAnchorElement, setMenuActionsAnchorElement] = useState(null);
  const [menuActionsSelected, setActionsSelected] = useState(null);

  // preset → extends chain → tableStyle → explicit locale / toolbar props
  const style = useMemo(() => {
    const resolved = resolvePreset(preset, tableStyle);
    if (locale !== undefined) resolved.locale = locale;
    if (toolbar !== undefined) resolved.toolbar = toolbar;
    return resolved;
  }, [preset, tableStyle, locale, toolbar]);

  const {
    sx: presetSx,
    slots: presetSlots,
    initialState: presetInitialState,
    pageSizeOptions: presetPageSizeOptions,
    localeText: presetLocaleText,
    ...presetGridProps
  } = useMemo(() => buildDataGridProps(style), [style]);

  const resolvedActionsIcon = actionsIcon ?? style.actions?.icon ?? 'vertical';
  const ActionsIcon = resolvedActionsIcon === 'horizontal' ? MoreHorizIcon : MoreVertIcon;
  const actionsColumnWidth = style.actions?.width;

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

  const enhancedColumns = columns.map((column) => {
    if (column.field === 'actions' && enableActions) {
      const widthDefault =
        actionsColumnWidth && column.width === undefined && column.flex === undefined
          ? { width: actionsColumnWidth }
          : {};

      return {
        // `display: 'flex'` makes the cell a flex container, which both centres
        // the button and stops the cell's `text-overflow: ellipsis` from
        // painting a clipped ellipsis dot when the button overflows its box.
        display: 'flex',
        align: 'center',
        ...widthDefault,
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
              onClick={(event) => {
                // The grid's own onRowClick must not fire alongside the menu.
                event.stopPropagation();
                actionsMenuOnClick(`list-item-menu-${params.row?.id}`, event.currentTarget);
              }}
            >
              <ActionsIcon className="fs-4" />
            </IconButton>
            <Menu
              elevation={1}
              disableScrollLock
              onClick={(event) => event.stopPropagation()}
              id={'list-item-menu-' + params.row?.id}
              anchorEl={menuActionsAnchorElement}
              open={menuActionsSelected === `list-item-menu-${params.row?.id}`}
              onClose={closeMenuActions}
              MenuListProps={{
                'aria-labelledby': 'datagrid-action-menu-btn',
              }}
            >
              {actions
                .filter((action) => {
                  if (typeof action.hidden === 'function') {
                    return !action.hidden(params.row);
                  }
                  return !action.hidden;
                })
                .map((action, index) =>
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
                        {action.items
                          .filter((item) => {
                            if (typeof item.hidden === 'function') {
                              return !item.hidden(params.row);
                            }
                            return !item.hidden;
                          })
                          .map((item, idx) => (
                            <Button
                              key={idx}
                              onClick={(event) => handleMenuItemClick(event, item.id, params)}
                              data-testid={`datagrid-${action.id}-action-btn`}
                              disabled={
                                typeof item.disabled === 'function'
                                  ? item.disabled(params.row)
                                  : item.disabled
                              }
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
                      disabled={
                        typeof action.disabled === 'function'
                          ? action.disabled(params.row)
                          : action.disabled
                      }
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

  // checkbox.width → a `__check__` column def that MUI merges over its default
  // selection column (only when checkboxSelection is on and the consumer did
  // not declare that column themselves).
  const checkboxWidth = style.checkbox?.width;
  const finalColumns =
    rest.checkboxSelection &&
    checkboxWidth &&
    !columns.some((column) => column.field === GRID_CHECKBOX_SELECTION_FIELD)
      ? [
          {
            field: GRID_CHECKBOX_SELECTION_FIELD,
            width: checkboxWidth,
            minWidth: checkboxWidth,
            maxWidth: checkboxWidth,
          },
          ...enhancedColumns,
        ]
      : enhancedColumns;

  // toolbar: preset/explicit decision, else the toolbar this grid always had
  const toolbarSlot = presetSlots ? presetSlots.toolbar : DefaultToolbar;

  const defaultSlots = {
    toolbar: toolbarSlot,
    ...slots,
  };

  const defaultSlotProps = {
    toolbar: {
      showQuickFilter: true,
      showExport,
    },
    ...slotProps,
  };

  const initialState =
    initialStateProp !== undefined
      ? presetInitialState
        ? deepMerge(presetInitialState, initialStateProp)
        : initialStateProp
      : (presetInitialState ?? LEGACY_INITIAL_STATE);

  const pageSizeOptions = pageSizeOptionsProp ?? presetPageSizeOptions ?? LEGACY_PAGE_SIZE_OPTIONS;

  // consumer's localeText merges over the locale's, key by key
  const localeText =
    presetLocaleText || rest.localeText
      ? { ...(presetLocaleText || {}), ...(rest.localeText || {}) }
      : undefined;

  const defaultDataGridProps = {
    disableRowSelectionOnClick,
    ...presetGridProps,
    slots: defaultSlots,
    slotProps: defaultSlotProps,
    initialState,
    pageSizeOptions,
  };

  const dataGridProps = {
    rows,
    columns: finalColumns,
    ...defaultDataGridProps,
    ...rest,
    ...(localeText ? { localeText } : {}),
    ...(hideHeader ? { columnHeaderHeight: 0 } : {}),
  };

  // preset sx first, consumer sx last so it always wins
  const hasPresetSx = Object.keys(presetSx).length > 0;
  const mergedSx =
    hasPresetSx || hideHeader
      ? [presetSx, hideHeader ? HIDE_HEADER_SX : null, ...toSxArray(sx)].filter(Boolean)
      : sx;

  return (
    <Box sx={boxStyles}>
      <MuiDataGrid {...dataGridProps} sx={mergedSx} />
    </Box>
  );
};

export default DataGrid;
