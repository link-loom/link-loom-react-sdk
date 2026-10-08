import { resolveLabels } from '../shared/labels.helpers.js';

export const VIEW_MODES = Object.freeze(['list', 'grid']);

export const PAGE_SIZE_OPTIONS = Object.freeze([25, 50, 100]);

export const LIST_SURFACE_LABELS = Object.freeze({
  en: Object.freeze({
    loadErrorTitle: 'The list could not be loaded',
    retry: 'Retry',
    clearFilters: 'Remove filters',
    filteredEmptyTitle: 'No results',
    filteredEmptyDescription: 'Change or remove the filters to see more.',
    emptyTitle: 'Nothing here yet',
    loading: 'Loading…',
    options: 'Options',
    untitled: 'Untitled',
    savedCopy: 'Showing the last copy loaded on this device',
    viewMode: 'View mode',
    viewList: 'List',
    viewGrid: 'Grid',
    viewTree: 'Tree',
    rowsPerPage: 'Rows per page:',
    displayedRows: '{from}–{to} of {count}',
    firstPage: 'First page',
    lastPage: 'Last page',
    nextPage: 'Next page',
    previousPage: 'Previous page',
  }),
  es: Object.freeze({
    loadErrorTitle: 'No se pudo cargar la lista',
    retry: 'Reintentar',
    clearFilters: 'Quitar filtros',
    filteredEmptyTitle: 'Sin resultados',
    filteredEmptyDescription: 'Cambia o quita los filtros para ver más.',
    emptyTitle: 'Aún no hay nada aquí',
    loading: 'Cargando…',
    options: 'Opciones',
    untitled: 'Sin título',
    savedCopy: 'Estás viendo la última copia cargada en este dispositivo',
    viewMode: 'Modo de vista',
    viewList: 'Lista',
    viewGrid: 'Cuadrícula',
    viewTree: 'Árbol',
    rowsPerPage: 'Filas por página:',
    displayedRows: '{from}–{to} de {count}',
    firstPage: 'Primera página',
    lastPage: 'Última página',
    nextPage: 'Página siguiente',
    previousPage: 'Página anterior',
  }),
});

// The labels of a locale with the app's overrides on top.
export const resolveListLabels = (labels, locale = 'en') => resolveLabels(LIST_SURFACE_LABELS, labels, locale);
