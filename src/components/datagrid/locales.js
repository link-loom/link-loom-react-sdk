import { esES } from '@mui/x-data-grid/locales';

/**
 * Base `localeText` per locale, straight from MUI. `en` is intentionally
 * absent: returning `undefined` keeps the grid on MUI's built-in defaults,
 * which is exactly what every existing consumer gets today.
 */
const BASE_LOCALE_TEXT = {
  es: esES.components.MuiDataGrid.defaultProps.localeText,
};

/**
 * Wrapper-owned strings layered on top of MUI's translation.
 */
const LOCALE_OVERRIDES = {
  es: {
    noRowsLabel: 'Nada por aquí',
    noResultsOverlayLabel: 'Sin resultados',
    toolbarQuickFilterPlaceholder: 'Buscar…',
    MuiTablePagination: {
      labelRowsPerPage: 'Filas por página:',
      labelDisplayedRows: ({ from, to, count }) => `${from}–${to} de ${count}`,
    },
  },
};

export const DATAGRID_LOCALES = ['en', 'es'];

const cache = {};
const warned = new Set();

/**
 * Returns the `localeText` object for a DataGrid locale.
 *
 * - `'en'` (or nothing) → `undefined`, i.e. MUI defaults. Current behaviour.
 * - `'es'`              → MUI `esES` + the overrides above.
 *
 * Results are cached so the same object identity is handed to MUI on every render.
 */
export const getDataGridLocale = (locale = 'en') => {
  if (!locale || locale === 'en') return undefined;

  if (cache[locale]) return cache[locale];

  const base = BASE_LOCALE_TEXT[locale];
  if (!base) {
    if (!warned.has(locale)) {
      warned.add(locale);
      console.warn(
        `[DataGrid] Unknown locale "${locale}". Supported: ${DATAGRID_LOCALES.join(', ')}. Falling back to MUI defaults.`,
      );
    }
    return undefined;
  }

  const overrides = LOCALE_OVERRIDES[locale] || {};
  cache[locale] = {
    ...base,
    ...overrides,
    MuiTablePagination: {
      ...(base.MuiTablePagination || {}),
      ...(overrides.MuiTablePagination || {}),
    },
  };

  return cache[locale];
};
