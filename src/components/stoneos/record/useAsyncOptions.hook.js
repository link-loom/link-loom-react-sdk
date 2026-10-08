import { useCallback, useEffect, useRef, useState } from 'react';
import useDebouncedValue from '../list/useDebouncedValue.hook.js';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from '../list/listState.helpers.js';

// The options of a picker. They load when the control opens, not on the first keystroke, and narrow as
// the person types (`loader(text)` answers the options for a text, empty text included). A failed load
// is told apart from an empty result (`error` versus `options: []`), and clearing the input resets the
// loading state so the control never sticks on "Searching".
export default function useAsyncOptions(loader, { searchable = false, debounceMs = DEFAULT_SEARCH_DEBOUNCE_MS } = {}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const debouncedText = useDebouncedValue(text, debounceMs);
  const loaderRef = useRef(loader);
  const requestRef = useRef(0);
  loaderRef.current = loader;

  const load = useCallback(async (query = '') => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    try {
      const loaded = await loaderRef.current(query);
      if (requestId === requestRef.current) {
        setOptions(Array.isArray(loaded) ? loaded : []);
        setError(null);
      }
    } catch (loadError) {
      if (requestId === requestRef.current) {
        setError(loadError);
        setOptions([]);
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      load(searchable ? debouncedText : '');
    }
  }, [open, searchable, debouncedText, load]);

  const onInputChange = useCallback((nextText) => {
    setText(nextText);
    if (!nextText) {
      setLoading(false);
    }
  }, []);

  return { options, loading, error, open, setOpen, onInputChange, reload: () => load(searchable ? debouncedText : '') };
}
