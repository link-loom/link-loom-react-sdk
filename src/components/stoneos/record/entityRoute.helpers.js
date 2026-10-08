export const ENTITY_ROUTE_PARAMS = Object.freeze({
  id: 'id',
  create: 'new',
  open: 'open',
  action: 'action',
});

// Set on the history entries this session pushes, so closing pops them instead of adding one more.
export const OPENED_IN_APP = 'entityOpenedInApp';

const CREATE_FLAG = '1';

// The names of the four URL params: the defaults, with any of them replaced by a non-empty string.
export const resolveEntityRouteParams = (params) => {
  const resolved = { ...ENTITY_ROUTE_PARAMS };
  Object.keys(ENTITY_ROUTE_PARAMS).forEach((key) => {
    const name = params?.[key];
    if (typeof name === 'string' && name) {
      resolved[key] = name;
    }
  });

  return resolved;
};

// What the address says: the open record, whether the create form is open, a value to resolve and the
// action to open the record with.
export const readEntityRoute = (searchParams, names) => {
  const openId = searchParams.get(names.id);

  return {
    openId,
    creating: !openId && searchParams.get(names.create) === CREATE_FLAG,
    openValue: openId ? null : searchParams.get(names.open),
    action: searchParams.get(names.action) || '',
  };
};

const withoutParams = (base, removed) => {
  const params = new URLSearchParams(base);
  removed.forEach((name) => params.delete(name));
  return params;
};

export const openEntityParams = (base, names, id, action) => {
  const params = withoutParams(base, [names.create, names.open, names.action]);
  params.set(names.id, id);
  if (action) {
    params.set(names.action, action);
  }

  return params;
};

export const createEntityParams = (base, names) => {
  const params = withoutParams(base, [names.id, names.open, names.action]);
  params.set(names.create, CREATE_FLAG);
  return params;
};

export const closeEntityParams = (base, names) =>
  withoutParams(base, [names.id, names.create, names.open, names.action]);

export const clearActionParams = (base, names) => withoutParams(base, [names.action]);

export const clearOpenParams = (base, names) => withoutParams(base, [names.open]);
