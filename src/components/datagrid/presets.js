import { getDataGridLocale } from './locales.js';
import { resolveToolbar } from './toolbars.jsx';

/**
 * DataGrid presets: a declarative description of how a table should look that
 * the SDK translates into MUI DataGrid props plus a single `sx` object
 * (see `buildDataGridProps`).
 *
 * Colours are hexadecimal on purpose. The host theme does not reach the MUI
 * bundled inside the SDK, so a consumer aligns them with its own tokens by
 * passing a partial `tableStyle` that is deep-merged over the chosen preset.
 *
 * `legacy` is empty: with it the DataGrid behaves exactly as it always has
 * (English toolbar, 52 px rows, page size 5). It is the default.
 */
export const DATAGRID_PRESETS = {
  legacy: {},

  list: {
    rowHeight: 40,
    columnHeaderHeight: 32,
    density: 'standard',
    header: {
      fontSize: 12,
      weight: 500,
      color: '#8b95a7',
      bg: 'transparent',
      uppercase: false,
      bottomBorder: '#e4e8ef',
    },
    cell: { fontSize: 13, weight: 400, color: '#232a3b', paddingX: 12 },
    borders: { outer: null, rowDivider: '#e4e8ef', cellVertical: false },
    radius: 0,
    hoverBg: '#f2f4f8',
    selectedBg: '#eceff5',
    focusOutline: false,
    checkbox: { onHoverOnly: true, width: 40 },
    actions: { width: 48, icon: 'horizontal' },
    rowCursor: 'pointer',
    sortIcons: 'hover',
    columnMenu: false,
    columnSeparators: false,
    toolbar: 'none',
    locale: 'es',
    footer: {
      height: 44,
      pageSizeOptions: [10, 20, 50],
      showSelectedCount: false,
      initialPageSize: 20,
    },
    emptyMinHeight: 160,
  },

  compact: {
    extends: 'list',
    rowHeight: 36,
    columnHeaderHeight: 30,
    cell: { fontSize: 12.5 },
  },

  card: {
    extends: 'list',
    borders: { outer: '#e4e8ef' },
    radius: 8,
  },

  admin: {
    extends: 'list',
    rowHeight: 44,
    columnHeaderHeight: 40,
    header: { bg: '#f7f8fa' },
    borders: { outer: '#e4e8ef' },
    radius: 8,
    columnMenu: true,
    toolbar: 'default',
    checkbox: { onHoverOnly: false, width: 48 },
  },
};

const isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

/**
 * Deep-merges `override` into `base` and returns a new object.
 * Plain objects merge recursively; arrays, `null`, functions and components
 * replace; `undefined` values are ignored so they never clobber a preset value.
 */
export const deepMerge = (base = {}, override = {}) => {
  const result = { ...(base || {}) };

  Object.keys(override || {}).forEach((key) => {
    const value = override[key];
    if (value === undefined) return;
    result[key] =
      isPlainObject(value) && isPlainObject(result[key]) ? deepMerge(result[key], value) : value;
  });

  return result;
};

const warned = new Set();
const warnOnce = (message) => {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
};

/**
 * Resolves a preset name into a flat style object:
 *
 *   legacy → …extends chain… → <name> → tableStyle
 *
 * Every step is deep-merged over the previous one, so a `tableStyle` only has
 * to carry the keys it wants to change. Unknown names are ignored with a
 * one-time warning and resolve to `legacy`.
 */
export const resolvePreset = (name = 'legacy', tableStyle = {}) => {
  const chain = [];
  const seen = new Set();
  let current = name || 'legacy';

  while (current && !seen.has(current)) {
    const preset = DATAGRID_PRESETS[current];
    if (!preset) {
      warnOnce(
        `[DataGrid] Unknown preset "${current}". Known presets: ${Object.keys(DATAGRID_PRESETS).join(', ')}.`,
      );
      break;
    }
    seen.add(current);
    chain.unshift(preset);
    current = preset.extends;
  }

  let resolved = deepMerge({}, DATAGRID_PRESETS.legacy);
  chain.forEach((preset) => {
    const { extends: _parent, ...rest } = preset;
    resolved = deepMerge(resolved, rest);
  });
  resolved = deepMerge(resolved, tableStyle || {});
  delete resolved.extends;

  return resolved;
};

const px = (value) => (typeof value === 'number' ? `${value}px` : value);
const has = (value) => value !== undefined && value !== null;

/**
 * Translates a resolved style object into MUI DataGrid props. Every key maps to
 * either a real prop or a rule inside the returned `sx` object:
 *
 *   rowHeight                → rowHeight
 *   columnHeaderHeight       → columnHeaderHeight
 *   density                  → density
 *   locale                   → localeText            (getDataGridLocale)
 *   columnMenu               → disableColumnMenu     (inverted)
 *   borders.cellVertical     → showCellVerticalBorder
 *   toolbar                  → slots.toolbar         (resolveToolbar)
 *   footer.initialPageSize   → initialState.pagination.paginationModel.pageSize
 *   footer.pageSizeOptions   → pageSizeOptions
 *   footer.showSelectedCount → hideFooterSelectedRowCount (inverted)
 *
 *   borders.outer            → sx border (null → none)
 *   borders.rowDivider       → sx --DataGrid-rowBorderColor (null → transparent)
 *   radius                   → sx borderRadius + --unstable_DataGrid-radius
 *   emptyMinHeight           → sx --DataGrid-overlayHeight (height of the "no rows" area)
 *   header.bg                → sx --DataGrid-containerBackground + .MuiDataGrid-columnHeaders
 *   header.color             → sx .MuiDataGrid-columnHeaders
 *   header.fontSize/weight/uppercase → sx .MuiDataGrid-columnHeaderTitle
 *   header.bottomBorder      → sx .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader (+ fillers)
 *   cell.fontSize/weight/color → sx .MuiDataGrid-cell
 *   cell.paddingX            → sx .MuiDataGrid-cell and .MuiDataGrid-columnHeader (checkbox column excluded)
 *   hoverBg                  → sx .MuiDataGrid-row:hover
 *   selectedBg               → sx .MuiDataGrid-row.Mui-selected (+ :hover)
 *   focusOutline: false      → sx outline none on cell / columnHeader :focus and :focus-within
 *   checkbox.onHoverOnly     → sx opacity fade on .MuiDataGrid-cellCheckbox / -columnHeaderCheckbox
 *   sortIcons                → sx .MuiDataGrid-iconButtonContainer ('hover' | 'always' | 'none')
 *   columnSeparators: false  → sx .MuiDataGrid-columnSeparator display none
 *   rowCursor                → sx .MuiDataGrid-row cursor ('pointer' on clickable lists)
 *   footer.height            → sx .MuiDataGrid-footerContainer (+ .MuiTablePagination-toolbar) minHeight
 *
 * Column-level keys are applied by the DataGrid component itself, because they
 * need the `columns` array: `checkbox.width` (a `__check__` column def when
 * `checkboxSelection` is on) and `actions.width` / `actions.icon`.
 *
 * Keys that are absent are simply not emitted, so an empty style (`legacy`)
 * produces `{ sx: {} }` and changes nothing.
 */
export const buildDataGridProps = (style = {}) => {
  const {
    rowHeight,
    columnHeaderHeight,
    density,
    locale,
    columnMenu,
    toolbar,
    borders = {},
    footer = {},
    checkbox = {},
    header = {},
    cell = {},
    sortIcons,
    columnSeparators,
    focusOutline,
    hoverBg,
    selectedBg,
    radius,
    emptyMinHeight,
    rowCursor,
  } = style || {};

  const props = {};
  const sx = {};
  const rule = (selector, declarations) => {
    sx[selector] = { ...(sx[selector] || {}), ...declarations };
  };

  // ---- direct DataGrid props ------------------------------------------------
  if (has(rowHeight)) props.rowHeight = rowHeight;
  if (has(columnHeaderHeight)) props.columnHeaderHeight = columnHeaderHeight;
  if (has(density)) props.density = density;

  if (has(locale)) {
    const localeText = getDataGridLocale(locale);
    if (localeText) props.localeText = localeText;
  }

  if (typeof columnMenu === 'boolean') props.disableColumnMenu = !columnMenu;
  if (typeof borders.cellVertical === 'boolean') props.showCellVerticalBorder = borders.cellVertical;

  const toolbarSlot = resolveToolbar(toolbar);
  if (toolbarSlot !== undefined) props.slots = { toolbar: toolbarSlot };

  if (has(footer.initialPageSize)) {
    props.initialState = { pagination: { paginationModel: { pageSize: footer.initialPageSize } } };
  }
  if (Array.isArray(footer.pageSizeOptions)) props.pageSizeOptions = footer.pageSizeOptions;
  if (typeof footer.showSelectedCount === 'boolean') {
    props.hideFooterSelectedRowCount = !footer.showSelectedCount;
  }

  // ---- sx: frame ------------------------------------------------------------
  if (borders.outer !== undefined) {
    sx.border = borders.outer ? `1px solid ${borders.outer}` : 'none';
  }
  if (has(radius)) {
    sx.borderRadius = px(radius);
    sx['--unstable_DataGrid-radius'] = px(radius);
  }
  if (borders.rowDivider !== undefined) {
    sx['--DataGrid-rowBorderColor'] = borders.rowDivider || 'transparent';
  }
  if (has(emptyMinHeight)) {
    sx['--DataGrid-overlayHeight'] = px(emptyMinHeight);
  }

  // ---- sx: header -----------------------------------------------------------
  if (header.bg !== undefined) {
    sx['--DataGrid-containerBackground'] = header.bg;
    rule('& .MuiDataGrid-columnHeaders', { backgroundColor: header.bg });
  }
  if (has(header.color)) {
    rule('& .MuiDataGrid-columnHeaders', { color: header.color });
  }

  const headerTitle = {};
  if (has(header.fontSize)) headerTitle.fontSize = px(header.fontSize);
  if (has(header.weight)) headerTitle.fontWeight = header.weight;
  if (typeof header.uppercase === 'boolean') {
    headerTitle.textTransform = header.uppercase ? 'uppercase' : 'none';
  }
  if (Object.keys(headerTitle).length) rule('& .MuiDataGrid-columnHeaderTitle', headerTitle);

  if (header.bottomBorder !== undefined) {
    rule(
      [
        '& .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader',
        '& .MuiDataGrid-row--borderBottom .MuiDataGrid-filler',
        '& .MuiDataGrid-row--borderBottom .MuiDataGrid-scrollbarFiller',
      ].join(', '),
      { borderBottom: header.bottomBorder ? `1px solid ${header.bottomBorder}` : 'none' },
    );
  }

  // ---- sx: cells ------------------------------------------------------------
  const cellRule = {};
  if (has(cell.fontSize)) cellRule.fontSize = px(cell.fontSize);
  if (has(cell.weight)) cellRule.fontWeight = cell.weight;
  if (has(cell.color)) cellRule.color = cell.color;
  if (Object.keys(cellRule).length) rule('& .MuiDataGrid-cell', cellRule);

  if (has(cell.paddingX)) {
    const padding = { paddingLeft: px(cell.paddingX), paddingRight: px(cell.paddingX) };
    rule('& .MuiDataGrid-cell:not(.MuiDataGrid-cellCheckbox)', padding);
    rule('& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeaderCheckbox)', padding);
  }

  // ---- sx: rows -------------------------------------------------------------
  if (has(hoverBg)) rule('& .MuiDataGrid-row:hover', { backgroundColor: hoverBg });
  if (has(selectedBg)) {
    rule('& .MuiDataGrid-row.Mui-selected', { backgroundColor: selectedBg });
    rule('& .MuiDataGrid-row.Mui-selected:hover', { backgroundColor: selectedBg });
  }

  if (focusOutline === false) {
    rule(
      [
        '& .MuiDataGrid-cell:focus',
        '& .MuiDataGrid-cell:focus-within',
        '& .MuiDataGrid-columnHeader:focus',
        '& .MuiDataGrid-columnHeader:focus-within',
      ].join(', '),
      { outline: 'none' },
    );
  }

  // ---- sx: checkbox column --------------------------------------------------
  if (checkbox.onHoverOnly === true) {
    rule(
      [
        '& .MuiDataGrid-cellCheckbox .MuiCheckbox-root',
        '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root',
      ].join(', '),
      { opacity: 0, transition: 'opacity 120ms ease-in-out' },
    );
    rule(
      [
        '& .MuiDataGrid-row:hover .MuiDataGrid-cellCheckbox .MuiCheckbox-root',
        '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cellCheckbox .MuiCheckbox-root',
        '& .MuiDataGrid-cellCheckbox .MuiCheckbox-root.Mui-checked',
        '& .MuiDataGrid-cellCheckbox .MuiCheckbox-root.Mui-focusVisible',
        '& .MuiDataGrid-columnHeaders:hover .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root',
        '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root.Mui-checked',
        '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root.MuiCheckbox-indeterminate',
        '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root.Mui-focusVisible',
      ].join(', '),
      { opacity: 1 },
    );
  }

  // ---- sx: sort icons -------------------------------------------------------
  if (sortIcons === 'hover') {
    rule('& .MuiDataGrid-iconButtonContainer', { visibility: 'hidden', width: 0 });
    rule(
      [
        '& .MuiDataGrid-columnHeader:hover .MuiDataGrid-iconButtonContainer',
        '& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-iconButtonContainer',
        '& .MuiDataGrid-columnHeader--filtered .MuiDataGrid-iconButtonContainer',
      ].join(', '),
      { visibility: 'visible', width: 'auto' },
    );
  } else if (sortIcons === 'always') {
    rule('& .MuiDataGrid-iconButtonContainer', { visibility: 'visible', width: 'auto' });
    rule('& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--sorted) .MuiDataGrid-sortIcon', {
      opacity: 0.4,
    });
  } else if (sortIcons === 'none' || sortIcons === false) {
    rule('& .MuiDataGrid-iconButtonContainer', { display: 'none' });
  }

  if (columnSeparators === false) {
    rule('& .MuiDataGrid-columnSeparator', { display: 'none' });
  }

  // ---- sx: row cursor -------------------------------------------------------
  // A grid whose rows open something should say so on hover.
  if (has(rowCursor)) rule('& .MuiDataGrid-row', { cursor: rowCursor });

  // ---- sx: footer -----------------------------------------------------------
  if (has(footer.height)) {
    rule('& .MuiDataGrid-footerContainer', { minHeight: px(footer.height) });
    rule('& .MuiDataGrid-footerContainer .MuiTablePagination-toolbar', {
      minHeight: px(footer.height),
    });
  }

  return { ...props, sx };
};
