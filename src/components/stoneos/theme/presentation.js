import { STOS_COLORS, STOS_PRIORITY_COLORS, STOS_STATE_COLORS } from './stoneos.constants.js';

export const STOS_STATE_GROUP_ORDER = [
  'in_progress',
  'ready',
  'new',
  'waiting',
  'blocked',
  'review',
  'completed',
  'cancelled',
];

export const STOS_STATE_LABELS = {
  new: 'New',
  ready: 'Ready',
  in_progress: 'In progress',
  waiting: 'Waiting',
  blocked: 'Blocked',
  review: 'In review',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STOS_PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Normal',
  high: 'High',
  critical: 'Urgent',
};

// A `stage` object, a `status` object or a bare key → `{ key, title, color, normalized }`.
export const resolveStatePresentation = (stage, status, labels = STOS_STATE_LABELS) => {
  const record = stage || status || null;
  if (!record) return null;

  const isObject = typeof record === 'object';
  const key = isObject ? record.key || record.name || null : record;
  const normalized = isObject ? record.normalized_state || record.name || key : record;
  const title = (isObject && record.title) || labels[normalized] || labels[key] || key;
  const color =
    (isObject && record.color) ||
    STOS_STATE_COLORS[normalized] ||
    STOS_STATE_COLORS[key] ||
    STOS_COLORS.textTertiary;

  return { key, title, color, normalized };
};

export const resolvePriorityPresentation = (priority, labels = STOS_PRIORITY_LABELS) => {
  if (!priority) return null;
  const isObject = typeof priority === 'object';
  const key = isObject ? priority.name || priority.key || null : priority;
  if (!key) return null;
  const title = (isObject && priority.title) || labels[key] || key;
  const color = (isObject && priority.color) || STOS_PRIORITY_COLORS[key] || STOS_COLORS.textTertiary;
  return { key, title, color };
};

export const resolveTypePresentation = (type) => {
  if (!type) return null;
  const isObject = typeof type === 'object';
  const key = isObject ? type.name || type.key || null : type;
  if (!key) return null;
  return { key, title: (isObject && type.title) || key };
};
