import { FLOOR_PLAN_DEFAULTS } from './floorPlan.constants.js';

// Undo and redo over whole snapshots of the items: a gesture is one snapshot, taken when it is released.

export const createHistory = () => ({ past: [], future: [] });

export const canUndo = (history) => history.past.length > 0;

export const canRedo = (history) => history.future.length > 0;

// Records the snapshot that was current before a change; a new change drops what could be redone.
export const recordHistory = (history, before, limit = FLOOR_PLAN_DEFAULTS.historyLimit) => ({
  past: [...history.past, before].slice(-limit),
  future: [],
});

export const undoHistory = (history, current) => {
  if (!canUndo(history)) {
    return null;
  }

  return {
    items: history.past[history.past.length - 1],
    history: { past: history.past.slice(0, -1), future: [current, ...history.future] },
  };
};

export const redoHistory = (history, current) => {
  if (!canRedo(history)) {
    return null;
  }

  return {
    items: history.future[0],
    history: { past: [...history.past, current], future: history.future.slice(1) },
  };
};
