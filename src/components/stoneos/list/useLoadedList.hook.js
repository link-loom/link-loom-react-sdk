import { useCallback, useEffect, useRef, useState } from 'react';

// A list loaded once when the component mounts (units, countries, jurisdictions) for the autocompletes
// of a form: `error` tells a failed load apart from an empty list and `reload` tries again. It loads again
// when one of `deps` changes.
export default function useLoadedList(loader, deps = []) {
  const [state, setState] = useState({ options: [], loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));
    try {
      setState({ options: (await loaderRef.current()) || [], loading: false, error: null });
    } catch (error) {
      setState({ options: [], loading: false, error });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, ...deps]);

  return { ...state, reload: load };
}
