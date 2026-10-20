import { resolveLabels } from '../shared/labels.helpers.js';

export const DATA_TABLE_LABELS = Object.freeze({
  en: Object.freeze({
    addRow: 'Add task',
    addChildPlaceholder: 'Subtask name',
    ungrouped: 'No status',
    empty: 'Nothing here',
    emptyHint: 'When there are records, they show up in this list.',
    expandGroup: 'Expand this group',
    collapseGroup: 'Collapse this group',
    groupOptions: 'Group options',
    collapseAll: 'Collapse all',
    expandAll: 'Expand all',
    editStages: 'Edit statuses',
  }),
  es: Object.freeze({
    addRow: 'Agregar tarea',
    addChildPlaceholder: 'Nombre de la subtarea',
    ungrouped: 'Sin estado',
    empty: 'Nada por aquí',
    emptyHint: 'Cuando haya registros, aparecerán en esta lista.',
    expandGroup: 'Expandir este grupo',
    collapseGroup: 'Contraer este grupo',
    groupOptions: 'Opciones del grupo',
    collapseAll: 'Contraer todo',
    expandAll: 'Expandir todo',
    editStages: 'Editar estados',
  }),
});

export const resolveDataTableLabels = (overrides, locale) => resolveLabels(DATA_TABLE_LABELS, overrides, locale);
