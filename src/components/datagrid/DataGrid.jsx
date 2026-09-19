import React, { useState, useMemo } from 'react';
import { DataGrid as MuiDataGrid, GRID_CHECKBOX_SELECTION_FIELD } from '@mui/x-data-grid';
import { Box, Divider, IconButton, Menu, MenuItem, ListItemText, ButtonGroup, Button } from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  MoreHoriz as MoreHorizIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
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
/**
 * The actions a row actually shows: hidden ones removed, and then the dividers
 * that no longer separate anything — leading, trailing or doubled — removed
 * too, since which actions apply depends on the row.
 */
/**
 * One entry that opens a nested menu. Keeping the related moves behind a single
 * line is what stops a row menu from becoming a wall: the parent stays short
 * and the detail is one hover away.
 */
const SubmenuItem = ({ action, row, onSelect, testId }) => {
  const [anchor, setAnchor] = useState(null);
  // Which way it opens is decided on the spot: to the right when the window
  // has room, to the left when it does not — anything else and it lands on
  // top of the menu it came from.
  const [toLeft, setToLeft] = useState(false);
  const closeTimer = React.useRef(null);

  const items = (action.items || []).filter((item) =>
    typeof item.hidden === 'function' ? !item.hidden(row) : !item.hidden,
  );

  if (items.length === 0) return null;

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // A beat of grace, so crossing the gap between the two menus does not close
  // the one you are reaching for.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setAnchor(null), 180);
  };

  const open = (event) => {
    cancelClose();
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    setToLeft(window.innerWidth - rect.right < SUBMENU_MIN_WIDTH);
    setAnchor(element);
  };

  return (
    <>
      <MenuItem
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onClick={(event) => {
          event.stopPropagation();
          open(event);
        }}
        data-testid={testId}
      >
        {action.icon}
        <ListItemText>{action.label}</ListItemText>
        <ChevronRightIcon fontSize="small" style={{ marginLeft: 8, opacity: 0.6 }} />
      </MenuItem>
      <Menu
        elevation={1}
        disableScrollLock
        hideBackdrop
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'top', horizontal: toLeft ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: toLeft ? 'right' : 'left' }}
        // The root would otherwise sit over the parent menu and eat its hover.
        style={{ pointerEvents: 'none' }}
        MenuListProps={{
          'aria-labelledby': 'datagrid-action-menu-btn',
          onMouseEnter: cancelClose,
          onMouseLeave: scheduleClose,
          style: { pointerEvents: 'auto' },
        }}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            onClick={(event) => {
              setAnchor(null);
              onSelect(item.id, event);
            }}
            data-testid={`datagrid-${item.id}-action-btn`}
            disabled={typeof item.disabled === 'function' ? item.disabled(row) : item.disabled}
          >
            {item.icon}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const SUBMENU_MIN_WIDTH = 220;

const visibleActions = (actions, row) => {
  const shown = actions.filter((action) =>
    typeof action.hidden === 'function' ? !action.hidden(row) : !action.hidden,
  );

  const usable = shown.filter(
    (action) =>
      action.type !== 'submenu' ||
      (action.items || []).some((item) =>
        typeof item.hidden === 'function' ? !item.hidden(row) : !item.hidden,
      ),
  );

  return usable.filter((action, index) => {
    if (action.type !== 'divider') return true;
    const hasBefore = usable.slice(0, index).some((item) => item.type !== 'divider');
    const hasAfter = usable.slice(index + 1).some((item) => item.type !== 'divider');
    const previousIsDivider = usable[index - 1]?.type === 'divider';
    return hasBefore && hasAfter && !previousIsDivider;
  });
};

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
              <ActionsIcon sx={{ fontSize: '1.5rem' }} />
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
              {visibleActions(actions, params.row).map((action, index) =>
                  action.type === 'divider' ? (
                    // `component="li"` because a menu list is a <ul>: an <hr>
                    // is not a valid child of one and browsers drop it.
                    <Divider key={index} component="li" sx={{ my: 0.5 }} />
                  ) : action.type === 'submenu' ? (
                    <SubmenuItem
                      key={index}
                      action={action}
                      row={params.row}
                      testId={`datagrid-${action.id}-action-btn`}
                      onSelect={(id, event) => handleMenuItemClick(event, id, params)}
                    />
                  ) : action.type === 'group' ? (
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
                      // A class as well as the sx, so a host whose stylesheet
                      // outranks emotion can still say what destructive looks
                      // like in its own design.
                      className={action.danger ? 'datagrid-action--danger' : undefined}
                      disabled={
                        typeof action.disabled === 'function'
                          ? action.disabled(params.row)
                          : action.disabled
                      }
                      // `danger` reads as an ordinary item until the pointer is
                      // on it, so a destructive action is never the loudest
                      // thing in a menu you opened for something else.
                      sx={
                        action.danger
                          ? {
                              '&:hover': {
                                color: 'error.main',
                                backgroundColor: 'rgba(229, 72, 77, 0.08)',
                              },
                            }
                          : undefined
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
