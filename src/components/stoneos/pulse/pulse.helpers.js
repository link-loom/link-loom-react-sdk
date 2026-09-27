import { resolveStatePresentation } from '../theme/presentation.js';
import { PULSE_LABELS } from './pulse.labels.js';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

/** The periods a history is grouped in, newest first. Their labels live in `labels.periods`. */
export const PULSE_PERIODS = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'earlier'];

/**
 * The actions Pulse knows how to draw and summarize. A verb names one by its ending, whatever the
 * entity: `work_item_state_changed`, `record_state_changed` and `record.state_changed` are all
 * `state_changed`. Anything else is drawn as generic activity and summarized by `entry.summary`.
 */
export const PULSE_ACTIONS = Object.freeze({
  created: 'created',
  updated: 'updated',
  assigned: 'assigned',
  stateChanged: 'state_changed',
  subtaskAdded: 'subtask_added',
  archived: 'archived',
  unarchived: 'unarchived',
  restored: 'restored',
  deleted: 'deleted',
  dispatched: 'dispatched',
  transferred: 'transferred',
  referred: 'referred',
  derivedCompleted: 'derived_completed',
  taken: 'taken',
  reviewRequested: 'review_requested',
  approved: 'approved',
  rejected: 'rejected',
});

/** How a change's values are shaped, which decides how each side is drawn. */
export const PULSE_CHANGE_KINDS = Object.freeze({
  text: 'text',
  richText: 'rich_text',
  person: 'person',
  stage: 'stage',
  date: 'date',
  catalog: 'catalog',
  reference: 'reference',
  number: 'number',
  flag: 'flag',
  structured: 'structured',
});

/** The transition a state change was made with when the work was taken from a queue. */
export const PULSE_TAKE_NEXT_TRANSITION = 'take-next';

const ACTIONS_BY_LENGTH = Object.values(PULSE_ACTIONS).sort(
  (first, second) => second.length - first.length,
);

const SUMMARY_KEYS = {
  [PULSE_ACTIONS.archived]: 'archived',
  [PULSE_ACTIONS.unarchived]: 'unarchived',
  [PULSE_ACTIONS.restored]: 'restored',
  [PULSE_ACTIONS.deleted]: 'deleted',
  [PULSE_ACTIONS.taken]: 'taken',
  [PULSE_ACTIONS.reviewRequested]: 'reviewRequested',
  [PULSE_ACTIONS.approved]: 'approved',
  [PULSE_ACTIONS.rejected]: 'rejected',
};

export const actionOf = (entry) => {
  if (entry?.payload?.transition_name === PULSE_TAKE_NEXT_TRANSITION) {
    return PULSE_ACTIONS.taken;
  }

  const verb = String(entry?.verb || '');
  return (
    ACTIONS_BY_LENGTH.find(
      (action) => verb === action || verb.endsWith(`_${action}`) || verb.endsWith(`.${action}`),
    ) || null
  );
};

/** Epoch milliseconds of any stored moment: a number, a numeric string, an ISO string or `{ timestamp }`. */
export const readPulseTimestamp = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === 'object') {
    return readPulseTimestamp(value.timestamp);
  }
  const timestamp =
    typeof value === 'number'
      ? value
      : /^\d+$/.test(String(value))
        ? Number(value)
        : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const timestampOf = (entry) =>
  readPulseTimestamp(entry?.occurred_at) || readPulseTimestamp(entry?.created);

const toMilliseconds = (now) => (now instanceof Date ? now.getTime() : Number(now) || Date.now());

// An unknown time zone or language falls back to the runtime's own instead of breaking the history.
const safeOptions = (locale, timeZone) => {
  try {
    new Intl.DateTimeFormat(locale || undefined, { timeZone: timeZone || undefined });
    return { locale: locale || undefined, timeZone: timeZone || undefined };
  } catch {
    return { locale: undefined, timeZone: undefined };
  }
};

// Built per locale and time zone and cached: an Intl formatter is expensive to construct.
const formatterCache = {};
const formattersFor = (requestedLocale, requestedTimeZone) => {
  const { locale, timeZone } = safeOptions(requestedLocale, requestedTimeZone);
  const key = `${locale || ''}|${timeZone || ''}`;

  if (!formatterCache[key]) {
    formatterCache[key] = {
      calendar: new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }),
      relative: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
      time: new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit' }),
      weekdayTime: new Intl.DateTimeFormat(locale, {
        timeZone,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dayMonthTime: new Intl.DateTimeFormat(locale, {
        timeZone,
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dayMonthYear: new Intl.DateTimeFormat(locale, {
        timeZone,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      full: new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'full', timeStyle: 'short' }),
      date: new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'medium', timeStyle: 'short' }),
    };
  }
  return formatterCache[key];
};

// The calendar day a moment falls on in the reader's time zone, as a day count that subtracts cleanly.
const calendarOf = (timestamp, timeZone) => {
  const parts = Object.fromEntries(
    formattersFor(undefined, timeZone)
      .calendar.formatToParts(timestamp)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    dayNumber: Date.UTC(parts.year, parts.month - 1, parts.day) / DAY,
  };
};

/** Which period a moment falls in, seen from `now` in `timeZone`. Weeks start on Monday. */
export const periodOf = (timestamp, { now = Date.now(), timeZone } = {}) => {
  const at = calendarOf(timestamp, timeZone);
  const today = calendarOf(toMilliseconds(now), timeZone);
  const daysAgo = today.dayNumber - at.dayNumber;
  const mondayOffset = (new Date(today.dayNumber * DAY).getUTCDay() + 6) % 7;

  if (daysAgo <= 0) return 'today';
  if (daysAgo === 1) return 'yesterday';
  if (daysAgo <= mondayOffset) return 'thisWeek';
  if (at.year === today.year && at.month === today.month) return 'thisMonth';
  return 'earlier';
};

/** `[{ period, entries }]` in the order the entries came (newest first), empty periods left out. */
export const groupByPeriod = (entries = [], options = {}) =>
  entries.reduce((groups, entry) => {
    const period = periodOf(timestampOf(entry) || 0, options);
    const last = groups[groups.length - 1];
    if (last?.period === period) {
      last.entries.push(entry);
    } else {
      groups.push({ period, entries: [entry] });
    }
    return groups;
  }, []);

/** The time a row shows: relative while it is recent, then as much of the date as the period has not said. */
export const formatRowTime = (timestamp, { locale, timeZone, now = Date.now() } = {}) => {
  if (!timestamp) {
    return '';
  }

  const format = formattersFor(locale, timeZone);
  const nowMs = toMilliseconds(now);
  const elapsed = nowMs - timestamp;
  const period = periodOf(timestamp, { now: nowMs, timeZone });

  if (elapsed < MINUTE) return format.relative.format(0, 'second');
  if (elapsed < HOUR) return format.relative.format(-Math.round(elapsed / MINUTE), 'minute');
  if (period === 'today') return format.relative.format(-Math.round(elapsed / HOUR), 'hour');
  if (period === 'yesterday') return format.time.format(timestamp);
  if (period === 'thisWeek') return format.weekdayTime.format(timestamp);
  if (calendarOf(timestamp, timeZone).year === calendarOf(nowMs, timeZone).year) {
    return format.dayMonthTime.format(timestamp);
  }
  return format.dayMonthYear.format(timestamp);
};

/** The full date and time of an event, in the reader's language and time zone. */
export const formatFullTime = (timestamp, { locale, timeZone } = {}) =>
  timestamp ? formattersFor(locale, timeZone).full.format(timestamp) : '';

/** A date value of a change (a due date, a start date). */
export const formatPulseDate = (value, { locale, timeZone } = {}) => {
  const timestamp = readPulseTimestamp(value);
  return timestamp ? formattersFor(locale, timeZone).date.format(timestamp) : '';
};

export const changesOf = (entry, hiddenFields = null) =>
  (Array.isArray(entry?.payload?.changes) ? entry.payload.changes : []).filter(
    (change) => change && (!hiddenFields || !hiddenFields.includes(change.field)),
  );

export const joinPulseList = (items, locale) => {
  try {
    return new Intl.ListFormat(locale || undefined, { style: 'long', type: 'conjunction' }).format(
      items,
    );
  } catch {
    return items.join(', ');
  }
};

const stateTitleOf = (value) => resolveStatePresentation(value)?.title || null;

const personNameOf = (person) => person?.name || person?.user?.name || person?.team?.name || null;

// An app titles its own verbs by their full name (`record_review_cancelled`); the kit's actions by
// their ending.
export const verbTitleOf = (entry, labels = PULSE_LABELS) =>
  labels.verbTitles?.[entry?.verb] ||
  labels.verbTitles?.[actionOf(entry)] ||
  labels.verbTitles?.fallback ||
  PULSE_LABELS.verbTitles.fallback;

/** A line about what one event did, for the list: who is on the row, this says what they did. */
export const summarizePulseEntry = (entry, labels = PULSE_LABELS, { locale } = {}) => {
  const words = labels.summaries || PULSE_LABELS.summaries;
  const payload = entry?.payload || {};
  const changes = changesOf(entry);
  const organizationName = (organization) =>
    organization?.display_name || labels.unknownOrganization;
  const action = actionOf(entry);

  switch (action) {
    case PULSE_ACTIONS.created: {
      // Work another organization created here says where it came from.
      const issuing = payload.issuing_organization;
      if (issuing?.id && entry?.organization_id && issuing.id !== entry.organization_id) {
        return words.receivedFrom(organizationName(issuing));
      }
      return words.created;
    }
    case PULSE_ACTIONS.dispatched: {
      const place = changes
        .filter((change) => change.kind === PULSE_CHANGE_KINDS.reference)
        .map((change) => change.to?.title)
        .filter(Boolean)
        .join(' · ');
      return place ? words.dispatched(place) : words.dispatchedSomewhere;
    }
    case PULSE_ACTIONS.transferred:
      return words.transferred(organizationName(payload.target_organization));
    case PULSE_ACTIONS.referred:
      return words.referred(organizationName(payload.target_organization));
    case PULSE_ACTIONS.derivedCompleted:
      return words.derivedCompleted(organizationName(payload.target_organization));
    case PULSE_ACTIONS.stateChanged: {
      const stage = changes.find((change) => change.kind === PULSE_CHANGE_KINDS.stage);
      const from = stateTitleOf(stage?.from || payload.from_stage || payload.from_status);
      const to = stateTitleOf(stage?.to || payload.to_stage || payload.to_status);
      return to ? words.moved(from, to) : words.updatedSomething;
    }
    case PULSE_ACTIONS.assigned: {
      const assignee = changes.find((change) => change.kind === PULSE_CHANGE_KINDS.person);
      const released = assignee ? !assignee.to : !payload.assignee;
      if (released) return words.unassigned;
      const name = personNameOf(assignee?.to) || personNameOf(payload.assignee);
      return name ? words.assigned(name) : words.assignedSomeone;
    }
    case PULSE_ACTIONS.updated: {
      const fields = [...new Set(changes.map((change) => change.field).filter(Boolean))];
      if (!fields.length) return words.updatedSomething;
      return words.updated(
        joinPulseList(
          fields.map((field) => labels.fields?.[field] || field),
          locale,
        ),
      );
    }
    case PULSE_ACTIONS.subtaskAdded: {
      const title =
        payload.subtask_title || changes.find((change) => change.field === 'subtasks')?.to?.title;
      return title ? words.subtaskAdded(title) : words.subtaskAddedSomething;
    }
    default:
      return SUMMARY_KEYS[action]
        ? words[SUMMARY_KEYS[action]]
        : entry?.summary || verbTitleOf(entry, labels);
  }
};
