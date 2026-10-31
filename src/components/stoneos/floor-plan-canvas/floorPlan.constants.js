export const FLOOR_PLAN_MODES = Object.freeze({ READ: 'read', EDIT: 'edit' });

export const FLOOR_PLAN_SHAPES = Object.freeze({ RECT: 'rect', ROUNDED: 'rounded', ROUND: 'round' });

export const FLOOR_PLAN_TONES = Object.freeze({
  DEFAULT: 'default',
  BRAND: 'brand',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
  MUTED: 'muted',
});

export const FLOOR_PLAN_CHANGE_TYPES = Object.freeze({
  MOVE: 'move',
  RESIZE: 'resize',
  ROTATE: 'rotate',
  ADD: 'add',
  REMOVE: 'remove',
  UNDO: 'undo',
  REDO: 'redo',
});

export const FLOOR_PLAN_CORNERS = Object.freeze({ NW: 'nw', NE: 'ne', SE: 'se', SW: 'sw' });

export const FLOOR_PLAN_DEFAULTS = Object.freeze({
  columns: 40,
  rows: 28,
  cellSize: 32,
  minSize: 1,
  rotationStep: 15,
  longPressMs: 500,
  dragSlop: 6,
  minScale: 0.25,
  maxScale: 4,
  fitMaxScale: 1.5,
  fitPadding: 24,
  historyLimit: 100,
  // A phone: below this width the first view keeps every shape touchable and hides labels that cannot be read.
  compactWidth: 600,
  touchTarget: 44,
  labelMinScreenPx: 9,
});
