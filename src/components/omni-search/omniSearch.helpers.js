/**
 * The answer of a category, whatever its shape: a bare list, a Link Loom envelope
 * (`{ result: { items } }`) or `{ items }`.
 */
export const itemsOf = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.result?.items || response?.items || [];
};

/**
 * The results of one category for a query. A category either names an entity `service` that the
 * overlay asks (`getByParameters`, with the query as `payload.query.search`), or brings its own
 * `search({ query })`, for results that a host collects from somewhere else (the records of the
 * apps of an organization). A `search` that rejects answers no results instead of breaking the
 * others.
 */
export const runCategorySearch = async ({ category, query, fetchCollection }) => {
  if (typeof category.search === 'function') {
    try {
      return itemsOf(await category.search({ query }));
    } catch (error) {
      return [];
    }
  }

  return itemsOf(
    await fetchCollection({
      service: category.service,
      payload: { ...category.payload, query: { search: query } },
    }),
  );
};

/** The React key of a result: the category's `itemKey`, else the id of the item. */
export const itemKeyOf = (category, item) =>
  typeof category.itemKey === 'function' ? category.itemKey(item) : item.id || item._id;

/**
 * The value cmdk tells a result by: the category's `itemValue`, else the name of the item. Two
 * results with the same name need a category with an `itemValue` that tells them apart.
 */
export const itemValueOf = (category, item) => {
  if (typeof category.itemValue === 'function') {
    return String(category.itemValue(item));
  }

  return String(item.name || item.title || item.label || `item-${item.id || item._id}`);
};

/** The text of a result when the category does not render its own. */
export const itemLabelOf = (item) => item.name || item.title || item.label || 'Unknown Item';

/** The words OmniSearch shows, in English; a host passes `labels` with any of them in its own language. */
export const OMNISEARCH_LABELS = Object.freeze({
  search: 'Search',
  input: 'Ask AI anything or search...',
  loading: 'Loading...',
  noCommands: 'No matching commands.',
  noResults: 'No results found.',
  suggestions: 'Suggestions',
  navigation: 'Navigation',
  commandCenter: 'Command Center',
  create: 'Create "{query}"',
  navigate: 'Navigate',
  select: 'Select',
  close: 'Close',
});

export const omniSearchLabels = (labels) => ({ ...OMNISEARCH_LABELS, ...(labels || {}) });
