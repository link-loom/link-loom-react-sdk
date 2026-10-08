import { useCallback, useEffect, useRef, useState } from 'react';

const EMPTY_RESULT = { items: [], totalItems: 0, fromCache: false };

// Runs a list loader (`() → Promise<{ items, totalItems, fromCache }>`) and runs it again when `deps`
// change, when `refresh` is called and, with a stable `subscribe(callback) → unsubscribe`, whenever the
// data layer reports a change. A stale answer never overwrites a newer one.
export default function useDataQuery(loader, deps = [], { enabled = true, subscribe } = {}) {
  const [result, setResult] = useState(EMPTY_RESULT);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const loaderRef = useRef(loader);
  const requestIdRef = useRef(0);
  loaderRef.current = loader;

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      const next = await loaderRef.current();
      if (requestId !== requestIdRef.current) {
        return;
      }
      setResult({
        items: Array.isArray(next?.items) ? next.items : [],
        totalItems: Number(next?.totalItems) || 0,
        fromCache: Boolean(next?.fromCache),
      });
      setError(null);
    } catch (queryError) {
      if (requestId === requestIdRef.current) {
        setError(queryError);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, ...deps]);

  useEffect(() => {
    setLoading(enabled);
    refresh();
  }, [refresh, enabled]);

  useEffect(() => {
    if (!enabled || typeof subscribe !== 'function') {
      return undefined;
    }
    return subscribe(() => refresh());
  }, [subscribe, refresh, enabled]);

  return { ...result, loading, error, refresh };
}
