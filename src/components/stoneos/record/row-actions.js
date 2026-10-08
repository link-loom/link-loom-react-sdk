import React from 'react';
import {
  ContentCopyOutlined as CopyIdIcon,
  DeleteOutlineOutlined as DeleteIcon,
  EditOutlined as EditIcon,
  LinkOutlined as CopyLinkIcon,
  OpenInFullOutlined as OpenPageIcon,
  OpenInNewOutlined as OpenNewTabIcon,
  VisibilityOutlined as QuickviewIcon,
} from '@mui/icons-material';
import { resolveLabels } from '../shared/labels.helpers.js';
import {
  ROW_ACTIONS,
  ROW_ACTION_LABELS,
  buildRowActionItems,
} from './row-actions.helpers.js';

export { ROW_ACTIONS, ROW_ACTION_LABELS };

export const ROW_ACTION_ICONS = Object.freeze({
  quickview: QuickviewIcon,
  edit: EditIcon,
  'open-page': OpenPageIcon,
  'open-new-tab': OpenNewTabIcon,
  'copy-id': CopyIdIcon,
  'copy-link': CopyLinkIcon,
  delete: DeleteIcon,
});

const ICON_ELEMENTS = Object.freeze(
  Object.fromEntries(
    Object.entries(ROW_ACTION_ICONS).map(([action, Icon]) => [action, React.createElement(Icon)]),
  ),
);

/**
 * The `items` of a RowActionsMenu for a record, from the standard catalog:
 * rowActionItems({ actions, record, handlers: { edit, openPage, copyLink, remove, ... }, labels, locale }).
 * `labels` overrides the text of single actions ({ edit: 'Change' }) over the `locale` ones.
 */
export const rowActionItems = ({ actions = ROW_ACTIONS, record, handlers, labels, locale = 'en' } = {}) =>
  buildRowActionItems({
    actions,
    record,
    handlers,
    labels: resolveLabels(ROW_ACTION_LABELS, labels, locale),
    icons: ICON_ELEMENTS,
  });
