export const DEFAULT_LOCALE = 'en';

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

// 'es-CO' and 'ES' read the Spanish dictionary; a language the kit has no copy for reads English.
export const normalizeLocale = (locale, dictionaries) => {
  const language = String(locale || '')
    .toLowerCase()
    .split(/[-_]/)[0];

  return hasOwn(dictionaries, language) ? language : DEFAULT_LOCALE;
};

// Fills `{name}` placeholders; a placeholder without a value stays as written.
export const interpolate = (text, params) => {
  if (!params) {
    return text;
  }

  return String(text).replace(/\{(\w+)\}/g, (placeholder, key) =>
    hasOwn(params, key) ? String(params[key]) : placeholder,
  );
};

// Overrides win over the defaults; `undefined` and `null` entries are ignored and nested objects merge
// key by key, so an app overrides one sentence without restating the rest.
export const mergeLabels = (base, overrides) => {
  if (!isPlainObject(overrides)) {
    return base;
  }

  const merged = { ...base };
  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (isPlainObject(value) && isPlainObject(base[key])) {
      merged[key] = mergeLabels(base[key], value);
      return;
    }
    merged[key] = value;
  });

  return merged;
};

// The labels of a locale ({ en: {...}, es: {...} }) with the app's overrides on top.
export const resolveLabels = (dictionaries, overrides, locale) =>
  mergeLabels(dictionaries[normalizeLocale(locale, dictionaries)], overrides);

// The sentence for a failed call: the app's own reader when it gave one, else the error's message, else
// the fallback.
export const describeError = (error, { errorMessage, fallback = '' } = {}) => {
  if (!error) {
    return '';
  }

  const message = typeof errorMessage === 'function' ? errorMessage(error) : error.message;
  return message || fallback;
};
