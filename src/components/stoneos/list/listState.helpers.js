export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_SEARCH_DEBOUNCE_MS = 300;

const isEmptyFilter = (value) =>
  value === '' ||
  value === false ||
  value === null ||
  value === undefined ||
  (Array.isArray(value) && value.length === 0);

// The values of the filters a list declares, read from the address. A filter is 'text', 'list' (a comma
// list) or 'flag' (true when the address says `true`).
export const readListValues = (searchParams, definition) =>
  Object.fromEntries(
    Object.keys(definition).map((name) => {
      const raw = searchParams.get(name);
      if (definition[name] === 'list') {
        return [name, raw ? raw.split(',').filter(Boolean) : []];
      }
      if (definition[name] === 'flag') {
        return [name, raw === 'true'];
      }
      return [name, raw || ''];
    }),
  );

// The address after a change of filters; an emptied filter leaves the address.
export const applyListPatch = (searchParams, patch) => {
  const next = new URLSearchParams(searchParams);
  Object.entries(patch).forEach(([name, value]) => {
    if (isEmptyFilter(value)) {
      next.delete(name);
      return;
    }
    next.set(name, Array.isArray(value) ? value.join(',') : String(value));
  });

  return next;
};

// The address without the filters of the list; everything else (the view mode, the open record) stays.
export const clearListParams = (searchParams, names) => {
  const next = new URLSearchParams(searchParams);
  names.forEach((name) => next.delete(name));
  return next;
};

export const hasActiveFilters = (values) =>
  Object.values(values).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));
