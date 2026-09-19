import { useCallback, useEffect, useRef, useState } from 'react';

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
 */
export default function useDirtyState(initialValues = {}, { onSave } = {}) {
  const [baseline, setBaseline] = useState(initialValues);
  const [values, setValuesState] = useState(initialValues);
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState(null);
  const valuesRef = useRef(values);
  const onSaveRef = useRef(onSave);

  valuesRef.current = values;
  onSaveRef.current = onSave;

  const isDirty = serialize(values) !== serialize(baseline);
  const initialKey = serialize(initialValues);

  const setValues = useCallback((next) => {
    setValuesState((previous) => (typeof next === 'function' ? next(previous) : next));
    setPhase('idle');
  }, []);

  const setField = useCallback(
    (name, value) => setValues((previous) => ({ ...previous, [name]: value })),
    [setValues],
  );

  const reset = useCallback((nextValues) => {
    const next = nextValues === undefined ? valuesRef.current : nextValues;
    setBaseline(next);
    setValuesState(next);
    setPhase('idle');
    setError(null);
  }, []);

  const discard = useCallback(() => {
    setValuesState(baseline);
    setPhase('idle');
    setError(null);
  }, [baseline]);

  const save = useCallback(async () => {
    const snapshot = valuesRef.current;

    if (typeof onSaveRef.current !== 'function') {
      setBaseline(snapshot);
      setPhase('saved');
      return snapshot;
    }

    setPhase('saving');
    setError(null);

    try {
      const result = await onSaveRef.current(snapshot);
      const nextBaseline = result && typeof result === 'object' ? result : snapshot;
      setBaseline(nextBaseline);
      setValuesState((current) => (current === snapshot ? nextBaseline : current));
      setPhase('saved');
      return nextBaseline;
    } catch (saveError) {
      setError(saveError);
      setPhase('error');
      return null;
    }
  }, []);

  useEffect(() => {
    if (isDirty) {
      return;
    }
    setBaseline(initialValues);
    setValuesState(initialValues);
    // Follow a new server snapshot only while nothing is being edited.
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

  return { values, setField, setValues, isDirty, status, error, save, discard, reset };
}
