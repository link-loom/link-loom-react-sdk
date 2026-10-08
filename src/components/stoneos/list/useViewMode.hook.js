import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VIEW_MODES } from './listSurface.labels.js';
import { VIEW_MODE_PARAM, resolveViewMode, viewModeParams } from './viewMode.helpers.js';

// The view mode lives in the query string (?view=list|grid) and falls back to `defaultMode`, the one the
// app persisted. With `onDefaultChange` a change made from the list also becomes the new default (the
// lists that share the default pass it); a list with other modes (locations also show a tree) passes
// them in `modes` and keeps its own choice in the URL without it.
export default function useViewMode({ modes = VIEW_MODES, defaultMode, onDefaultChange } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const modesKey = modes.join(',');

  const viewMode = resolveViewMode({ requested: searchParams.get(VIEW_MODE_PARAM), modes, defaultMode });

  const setViewMode = useCallback(
    (nextMode) => {
      if (!modes.includes(nextMode)) {
        return;
      }
      setSearchParams((previous) => viewModeParams(previous, nextMode), { replace: true });
      onDefaultChange?.(nextMode);
    },
    [modesKey, setSearchParams, onDefaultChange],
  );

  return { viewMode, setViewMode };
}
