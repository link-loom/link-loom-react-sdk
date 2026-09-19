import { useCallback, useEffect, useState } from 'react';

/**
 * Client-side notification preferences (localStorage), read synchronously by toast/desktop gates.
 *
 * Shape (key `sommatic::notification-prefs`):
 *   {
 *     paused: boolean,
 *     quiet_hours: { enabled: boolean, start: "HH:MM", end: "HH:MM" },
 *     min_priority: 'low' | 'medium' | 'high' | 'critical',
 *     muted_types: string[],
 *     apps: { [appSlug]: { enabled: boolean, toast: boolean, desktop: boolean } }
 *   }
 */
export const NOTIFICATION_PREFS_KEY = 'sommatic::notification-prefs';
export const NOTIFICATION_PREFS_EVENT = 'sommatic::notification-prefs-changed';

const PRIORITY_RANK = { low: 1, medium: 2, high: 3, critical: 4 };

const DEFAULT_APP_PREFS = { enabled: true, toast: true, desktop: true };

const DEFAULT_PREFS = {
  paused: false,
  quiet_hours: { enabled: false, start: '20:00', end: '07:00' },
  min_priority: 'high',
  muted_types: [],
  apps: {},
};

const normalizeApps = (apps) => {
  if (!apps || typeof apps !== 'object' || Array.isArray(apps)) {
    return {};
  }

  return Object.keys(apps).reduce((result, slug) => {
    result[slug] = { ...DEFAULT_APP_PREFS, ...(apps[slug] || {}) };
    return result;
  }, {});
};

export function readNotificationPreferences() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      quiet_hours: { ...DEFAULT_PREFS.quiet_hours, ...(parsed.quiet_hours || {}) },
      muted_types: Array.isArray(parsed.muted_types) ? parsed.muted_types : [],
      apps: normalizeApps(parsed.apps),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writeNotificationPreferences(prefs) {
  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent(NOTIFICATION_PREFS_EVENT, { detail: prefs }));
  } catch {
    // Storage unavailable: the gates fall back to defaults.
  }
}

function minutesOfDay(hhmm) {
  const [hours, minutes] = String(hhmm || '')
    .split(':')
    .map((part) => parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

// True when `now` falls inside the quiet window (handles overnight ranges).
export function isQuietNow(quietHours, now = new Date()) {
  if (!quietHours?.enabled) return false;
  const start = minutesOfDay(quietHours.start);
  const end = minutesOfDay(quietHours.end);
  if (start == null || end == null) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  if (start > end) return current >= start || current < end;
  return current >= start && current < end;
}

const shouldToastWith = (prefs, task) => {
  if (prefs.paused) return false;
  if (isQuietNow(prefs.quiet_hours)) return false;

  const typeName = task?.type?.name;
  if (typeName && prefs.muted_types.includes(typeName)) return false;

  const rank = PRIORITY_RANK[task?.priority?.name] || 0;
  const minRank = PRIORITY_RANK[prefs.min_priority] || PRIORITY_RANK.high;
  return rank >= minRank;
};

// Pause and quiet hours apply globally; per-app flags gate each channel. `severity` is accepted and reserved.
const shouldNotifyWith = (prefs, { appSlug, channel = 'toast' } = {}) => {
  if (prefs.paused) return false;
  if (isQuietNow(prefs.quiet_hours)) return false;
  if (!appSlug) return true;

  const app = { ...DEFAULT_APP_PREFS, ...(prefs.apps?.[appSlug] || {}) };
  if (!app.enabled) return false;
  if (channel === 'desktop') return Boolean(app.desktop);
  return Boolean(app.toast);
};

export function shouldNotify(options = {}) {
  return shouldNotifyWith(readNotificationPreferences(), options);
}

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState(readNotificationPreferences);

  useEffect(() => {
    const reload = () => setPrefs(readNotificationPreferences());
    window.addEventListener(NOTIFICATION_PREFS_EVENT, reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(NOTIFICATION_PREFS_EVENT, reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const shouldToast = useCallback((task) => shouldToastWith(prefs, task), [prefs]);

  const shouldNotifyForApp = useCallback(
    (options = {}) => shouldNotifyWith(prefs, options),
    [prefs],
  );

  return { prefs, shouldToast, shouldNotify: shouldNotifyForApp };
}
