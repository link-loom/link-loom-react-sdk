export const ORGANIZATION_PICKER_LABELS = {
  label: 'Organization',
  mine: 'Your organization',
  verified: 'Verified by Veripass',
  search: 'Search by name…',
  loading: 'Loading the directory…',
  loadFailed: 'Could not load the directory',
  sessionExpired: 'Your session expired. Sign in again to see the directory.',
  noMatch: 'No organization in the directory matches',
  empty: 'No other organization is in the directory yet',
  unknown: 'Another organization',
  retry: 'Try again',
};

export const ORGANIZATION_DIRECTORY_STATUS = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
  error: 'error',
  unauthorized: 'unauthorized',
});

// The row that says the directory failed, under your own organization (which is always offered).
export const ORGANIZATION_STATUS_OPTION_ID = '__directory_status__';

// Accent- and case-insensitive, so "bogota" finds "Bogotá".
export const normalizeSearchText = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const isFailure = (status) =>
  status === ORGANIZATION_DIRECTORY_STATUS.error ||
  status === ORGANIZATION_DIRECTORY_STATUS.unauthorized;

/**
 * The options of the picker: your own organization leads the list (listed in the directory or not,
 * because it is the default destination of what you create) while it matches the text, then the others.
 * A failed directory gets a row of its own under the list, so it never hides behind your organization.
 */
export const buildOrganizationOptions = ({
  entries = [],
  myOrganization = null,
  includeMine = true,
  text = '',
  status,
}) => {
  const query = normalizeSearchText(text.trim());
  const others = entries.filter((entry) => entry?.id && entry.id !== myOrganization?.id);
  if (!includeMine || !myOrganization?.id) {
    return others;
  }

  const listedMine = entries.find((entry) => entry?.id === myOrganization.id);
  const mine = {
    ...myOrganization,
    ...(listedMine || {}),
    display_name: listedMine?.display_name || myOrganization.display_name,
  };
  const mineMatches =
    !query ||
    normalizeSearchText(mine.display_name).includes(query) ||
    normalizeSearchText(mine.slug).includes(query);
  const list = mineMatches ? [mine, ...others] : others;

  return isFailure(status) && list.length
    ? [...list, { id: ORGANIZATION_STATUS_OPTION_ID, status }]
    : list;
};
