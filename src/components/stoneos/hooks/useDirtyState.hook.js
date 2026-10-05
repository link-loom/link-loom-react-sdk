import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { dirtyStateReducer, isDirtyState } from './dirtyState.reducer.js';

const serialize = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * View-first configuration state with an explicit save.
 * status: 'clean' | 'dirty' | 'saving' | 'saved' | 'error'
 * `onSave(values)` may return a value object that becomes the new baseline.
 * A new `initialValues` is followed only while nothing is being edited (decided in the reducer, so an
 * edit made while a new snapshot arrives is never overwritten).
 */
export default function useDirtyState(initialValues = {}, { onSave } = {}) {
  const [state, dispatch] = useReducer(dirtyStateReducer, { baseline: initialValues, values: initialValues });
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState(null);
  const valuesRef = useRef(state.values);
  const onSaveRef = useRef(onSave);

  valuesRef.current = state.values;
  onSaveRef.current = onSave;

  const isDirty = isDirtyState(state);
  const initialKey = serialize(initialValues);

  const setValues = useCallback((next) => {
    dispatch({ type: 'edit', next });
    setPhase('idle');
  }, []);

  const setField = useCallback(
    (name, value) => setValues((previous) => ({ ...previous, [name]: value })),
    [setValues],
  );

  const reset = useCallback((nextValues) => {
    dispatch({ type: 'reset', next: nextValues === undefined ? valuesRef.current : nextValues });
    setPhase('idle');
    setError(null);
  }, []);

  const discard = useCallback(() => {
    dispatch({ type: 'discard' });
    setPhase('idle');
    setError(null);
  }, []);

  const save = useCallback(async () => {
    const snapshot = valuesRef.current;

    if (typeof onSaveRef.current !== 'function') {
      dispatch({ type: 'saved', snapshot, baseline: snapshot });
      setPhase('saved');
      return snapshot;
    }

    setPhase('saving');
    setError(null);

    try {
      const result = await onSaveRef.current(snapshot);
      const nextBaseline = result && typeof result === 'object' ? result : snapshot;
      dispatch({ type: 'saved', snapshot, baseline: nextBaseline });
      setPhase('saved');
      return nextBaseline;
    } catch (saveError) {
      setError(saveError);
      setPhase('error');
      return null;
    }
  }, []);

  useEffect(() => {
    dispatch({ type: 'follow', snapshot: initialValues });
    // Follow a new server snapshot only while nothing is being edited (the reducer decides).
  }, [initialKey]);

  const status =
    phase === 'saving'
      ? 'saving'
      : phase === 'error'
        ? 'error'
        : isDirty
          ? 'dirty'
          : phase === 'saved'
            ? 'saved'
            : 'clean';

  return { values: state.values, setField, setValues, isDirty, status, error, save, discard, reset };
}
