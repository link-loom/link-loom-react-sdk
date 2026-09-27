const HTTP_UNAUTHORIZED = 401;

const statusOf = (source) => Number(source?.status ?? source?.response?.status) || null;

const failure = (source) => ({ ok: false, items: [], totalPages: 0, status: statusOf(source) });

// What a kit loader (`loadPage`, `searchOrganizations`, `loadWorkspaces`) may answer: the page itself
// (`{ items, totalPages }`), a Link Loom envelope (`{ success, result: { items, totalPages } }`) or a
// plain list. Anything else is a failed load, never an empty one: "could not load" and "nothing here"
// are different answers.
export const readCollection = (response) => {
  if (Array.isArray(response)) {
    return { ok: true, items: response, totalPages: 1, status: null };
  }

  if (!response || typeof response !== 'object' || response.success === false) {
    return failure(response);
  }

  const page = response.result && typeof response.result === 'object' ? response.result : response;
  const items = Array.isArray(page) ? page : page.items;

  if (!Array.isArray(items)) {
    return failure(response);
  }

  return { ok: true, items, totalPages: Number(page.totalPages) || 1, status: null };
};

// Calls a loader and reads its answer; a rejected promise is a failed load that keeps its HTTP status.
export const loadCollection = async (loader, params) => {
  if (typeof loader !== 'function') {
    return failure(null);
  }

  try {
    return readCollection(await loader(params));
  } catch (error) {
    return failure(error);
  }
};

export const isUnauthorized = (collection) => collection?.status === HTTP_UNAUTHORIZED;
