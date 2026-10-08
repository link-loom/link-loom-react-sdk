import { useEffect, useRef, useState } from 'react';
import useDebouncedValue from './useDebouncedValue.hook.js';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from './listState.helpers.js';

// The text box of a list: what the person types goes to the URL filter once they pause, and a filter
// cleared from outside (Remove filters) empties the box.
export default function useListSearch(list, name = 'text', { debounceMs = DEFAULT_SEARCH_DEBOUNCE_MS } = {}) {
  const urlValue = list.values[name];
  const [typed, setTyped] = useState(urlValue);
  const debounced = useDebouncedValue(typed, debounceMs);
  const debouncedRef = useRef(debounced);
  debouncedRef.current = debounced;

  useEffect(() => {
    if (debounced.trim() !== urlValue) {
      list.setValue(name, debounced.trim());
    }
  }, [debounced]);

  useEffect(() => {
    if (urlValue !== debouncedRef.current.trim()) {
      setTyped(urlValue);
    }
  }, [urlValue]);

  return { value: typed, onChange: setTyped };
}
