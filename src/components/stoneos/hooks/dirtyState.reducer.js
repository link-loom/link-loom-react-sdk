const serialize = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const isDirtyState = (state) => serialize(state.values) !== serialize(state.baseline);

// The baseline and the values of a view-first form change together in one reducer, so the decision to
// follow a new snapshot is made against the values of that moment: an edit queued before the snapshot is
// kept (the form is dirty), one queued after it lands on the new snapshot.
export const dirtyStateReducer = (state, action) => {
  switch (action.type) {
    case 'edit':
      return {
        ...state,
        values: typeof action.next === 'function' ? action.next(state.values) : action.next,
      };
    case 'follow':
      return isDirtyState(state) ? state : { baseline: action.snapshot, values: action.snapshot };
    case 'reset':
      return { baseline: action.next, values: action.next };
    case 'discard':
      return { ...state, values: state.baseline };
    case 'saved':
      return {
        baseline: action.baseline,
        values: state.values === action.snapshot ? action.baseline : state.values,
      };
    default:
      return state;
  }
};
