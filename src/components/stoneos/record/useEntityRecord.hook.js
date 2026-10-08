import { useCallback, useEffect, useRef, useState } from 'react';

// Loads one record through a loader (`id → Promise<{ record, fromCache }>`) and reloads it on demand.
// `record` is null while loading and when the record does not exist or cannot be seen.
export default function useEntityRecord(loader, id) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const activeIdRef = useRef(id);
  const loaderRef = useRef(loader);
  activeIdRef.current = id;
  loaderRef.current = loader;

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return null;
    }

    try {
      const loaded = await loaderRef.current(id);
      if (activeIdRef.current !== id) {
        return null;
      }
      setRecord(loaded?.record || null);
      setError(null);
      return loaded?.record || null;
    } catch (loadError) {
      if (activeIdRef.current === id) {
        setError(loadError);
      }
      return null;
    } finally {
      if (activeIdRef.current === id) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    setLoading(Boolean(id));
    setRecord(null);
    setError(null);
    load();
  }, [load, id]);

  return { record, loading, error, reload: load };
}
