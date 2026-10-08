export const ROW_ACTIONS = Object.freeze([
  'quickview',
  'edit',
  'open-page',
  'open-new-tab',
  'copy-id',
  'copy-link',
  'delete',
]);

export const ROW_ACTION_LABELS = Object.freeze({
  en: Object.freeze({
    quickview: 'Quick view',
    edit: 'Edit',
    'open-page': 'Open page',
    'open-new-tab': 'Open in a new tab',
    'copy-id': 'Copy ID',
    'copy-link': 'Copy link',
    delete: 'Delete',
  }),
  es: Object.freeze({
    quickview: 'Vista rápida',
    edit: 'Editar',
    'open-page': 'Abrir página',
    'open-new-tab': 'Abrir en una pestaña nueva',
    'copy-id': 'Copiar ID',
    'copy-link': 'Copiar enlace',
    delete: 'Eliminar',
  }),
});

// The handler each action asks of `handlers`.
export const ROW_ACTION_HANDLERS = Object.freeze({
  quickview: 'quickview',
  edit: 'edit',
  'open-page': 'openPage',
  'open-new-tab': 'openNewTab',
  'copy-id': 'copyId',
  'copy-link': 'copyLink',
  delete: 'remove',
});

const DESTRUCTIVE_ACTION = 'delete';

/**
 * The `items` of a RowActionsMenu for one record. The order is the one of `actions` (the catalog order by
 * default); an action without a handler, or one the catalog does not know, is left out. The destructive
 * action is marked `danger` and set apart by a divider, unless it would open the menu: the menu drops an
 * item that asks for a divider before the first one.
 */
export const buildRowActionItems = ({
  actions = ROW_ACTIONS,
  record,
  handlers = {},
  labels,
  icons = {},
}) => {
  const items = [];

  actions.forEach((action) => {
    const handler = handlers[ROW_ACTION_HANDLERS[action]];
    if (typeof handler !== 'function' || items.some((item) => item.id === action)) {
      return;
    }

    const destructive = action === DESTRUCTIVE_ACTION;
    items.push({
      id: action,
      label: labels[action],
      icon: icons[action],
      onClick: () => handler(record),
      ...(destructive ? { danger: true, dividerBefore: items.length > 0 } : {}),
    });
  });

  return items;
};
