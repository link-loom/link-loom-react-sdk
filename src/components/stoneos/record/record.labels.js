import { LIST_SURFACE_LABELS } from '../list/listSurface.labels.js';
import { resolveLabels } from '../shared/labels.helpers.js';
import { ROW_ACTION_LABELS } from './row-actions.helpers.js';

// Every default sentence of the record and list kit. `rowActions` and `list` hold the labels of the row
// actions catalog and of the list surface, so an app can hand the whole object to each piece.
export const RECORD_KIT_LABELS = Object.freeze({
  en: Object.freeze({
    done: 'Done',
    close: 'Close',
    cancel: 'Cancel',
    retry: 'Retry',
    loading: 'Loading…',
    reason: 'Reason',
    reasonHint: 'At least 5 characters. It stays in the history.',
    open: 'Open',
    clear: 'Clear',
    noMatches: 'No matches',
    optionsLoadError: 'The options could not be loaded',
    unknownError: 'The operation could not be completed.',
    loadErrorTitle: 'It could not be loaded',
    notFoundTitle: 'We did not find this record',
    notFoundDescription: 'It was deleted, or it belongs to another organization.',
    backToList: 'Back to the list',
    unsaved: 'Unsaved changes',
    saved: 'Saved',
    saveError: 'Could not save your changes',
    discard: 'Discard',
    save: 'Save',
    discardTitle: 'Discard your changes?',
    discardDescription: 'Your unsaved changes will be lost.',
    discardConfirm: 'Discard changes',
    keepEditing: 'Keep editing',
    filterAll: 'Any',
    filterOne: '{label}: {value}',
    filterMany: '{label}: {value} +{more}',
    rowActions: ROW_ACTION_LABELS.en,
    list: LIST_SURFACE_LABELS.en,
  }),
  es: Object.freeze({
    done: 'Listo',
    close: 'Cerrar',
    cancel: 'Cancelar',
    retry: 'Reintentar',
    loading: 'Cargando…',
    reason: 'Motivo',
    reasonHint: 'Mínimo 5 caracteres. Queda en el historial.',
    open: 'Abrir',
    clear: 'Limpiar',
    noMatches: 'Sin coincidencias',
    optionsLoadError: 'No se pudieron cargar las opciones',
    unknownError: 'No se pudo completar la operación.',
    loadErrorTitle: 'No se pudo cargar',
    notFoundTitle: 'No encontramos este registro',
    notFoundDescription: 'Se borró o es de otra organización.',
    backToList: 'Volver a la lista',
    unsaved: 'Cambios sin guardar',
    saved: 'Guardado',
    saveError: 'No se pudieron guardar tus cambios',
    discard: 'Descartar',
    save: 'Guardar',
    discardTitle: '¿Descartar tus cambios?',
    discardDescription: 'Se perderán los cambios que no guardaste.',
    discardConfirm: 'Descartar cambios',
    keepEditing: 'Seguir editando',
    filterAll: 'Cualquiera',
    filterOne: '{label}: {value}',
    filterMany: '{label}: {value} +{more}',
    rowActions: ROW_ACTION_LABELS.es,
    list: LIST_SURFACE_LABELS.es,
  }),
});

// The labels of a locale with the app's overrides on top.
export const resolveRecordLabels = (labels, locale = 'en') =>
  resolveLabels(RECORD_KIT_LABELS, labels, locale);

// The texts MUI's Autocomplete brings in English: its arrow, the clear button and the empty and loading lines.
export const autocompleteLabelsOf = (labels) => ({
  openText: labels.open,
  closeText: labels.close,
  clearText: labels.clear,
  loadingText: labels.loading,
  noOptionsText: labels.noMatches,
});
