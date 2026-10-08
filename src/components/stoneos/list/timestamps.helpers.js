const RELATIVE_UNITS = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'week', seconds: 604800 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
];

const toNumber = (value) => {
  if (typeof value === 'number') {
    return value;
  }
  if (/^\d+$/.test(String(value))) {
    return Number(value);
  }

  return Date.parse(value);
};

// Accepts epoch milliseconds (number or numeric string, as the backends store them), ISO strings and
// Link Loom log entries ({ timestamp }).
export const readTimestamp = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === 'object') {
    return readTimestamp(value.timestamp);
  }
  const timestamp = toNumber(value);

  return Number.isFinite(timestamp) ? timestamp : null;
};

// "3 days ago", "yesterday": Intl, in the language of the reader.
export const formatRelativeTime = (value, locale, now = Date.now()) => {
  const timestamp = readTimestamp(value);
  if (!timestamp) {
    return '';
  }

  const elapsedSeconds = Math.round((timestamp - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const match = RELATIVE_UNITS.find(({ seconds }) => Math.abs(elapsedSeconds) >= seconds);
  if (!match) {
    return formatter.format(0, 'second');
  }

  return formatter.format(Math.round(elapsedSeconds / match.seconds), match.unit);
};

export const formatDateTime = (value, { locale, timeZone } = {}) => {
  const timestamp = readTimestamp(value);
  if (!timestamp) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(timestamp);
};
