import { VIEW_MODES } from './listSurface.labels.js';

export const VIEW_MODE_PARAM = 'view';

// The mode a list shows: the one the address asks for when the list has it, else the persisted default
// when the list has it, else its first mode.
export const resolveViewMode = ({ requested, modes = VIEW_MODES, defaultMode }) => {
  if (modes.includes(requested)) {
    return requested;
  }
  if (modes.includes(defaultMode)) {
    return defaultMode;
  }

  return modes[0];
};

export const viewModeParams = (searchParams, mode) => {
  const next = new URLSearchParams(searchParams);
  next.set(VIEW_MODE_PARAM, mode);
  return next;
};

const MODE_LABEL_KEYS = Object.freeze({ list: 'viewList', grid: 'viewGrid', tree: 'viewTree' });

// The options of the toggle between the ways a list can be shown. An unknown mode is named by its id.
export const viewModeOptions = (modes, labels) =>
  modes.map((mode) => ({ value: mode, label: labels[MODE_LABEL_KEYS[mode]] || mode }));
