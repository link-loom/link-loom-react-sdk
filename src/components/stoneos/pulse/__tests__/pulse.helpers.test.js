import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PULSE_ACTIONS,
  PULSE_CHANGE_KINDS,
  actionOf,
  changesOf,
  formatFullTime,
  formatPulseDate,
  formatRowTime,
  groupByPeriod,
  periodOf,
  readPulseTimestamp,
  summarizePulseEntry,
  timestampOf,
  verbTitleOf,
} from '../pulse.helpers.js';
import { PULSE_LABELS, mergePulseLabels } from '../pulse.labels.js';

// Wednesday 2026-09-23, 15:00 in Bogotá (UTC-5, no daylight saving).
const NOW = Date.parse('2026-09-23T20:00:00Z');
const BOGOTA = 'America/Bogota';
const at = (iso) => Date.parse(iso);

describe('actionOf', () => {
  it('reads the action from the ending of the verb, whatever the entity', () => {
    assert.equal(actionOf({ verb: 'work_item_state_changed' }), PULSE_ACTIONS.stateChanged);
    assert.equal(actionOf({ verb: 'record.created' }), PULSE_ACTIONS.created);
    assert.equal(actionOf({ verb: 'record_review_requested' }), PULSE_ACTIONS.reviewRequested);
    assert.equal(actionOf({ verb: 'approved' }), PULSE_ACTIONS.approved);
  });

  it('does not mistake an unarchive for an archive', () => {
    assert.equal(actionOf({ verb: 'work_item_unarchived' }), PULSE_ACTIONS.unarchived);
    assert.equal(actionOf({ verb: 'work_item_archived' }), PULSE_ACTIONS.archived);
  });

  it('reads work taken from a queue by its transition, and knows nothing of other verbs', () => {
    assert.equal(
      actionOf({ verb: 'work_item_state_changed', payload: { transition_name: 'take-next' } }),
      PULSE_ACTIONS.taken,
    );
    assert.equal(actionOf({ verb: 'record_commented_upon' }), null);
    assert.equal(actionOf(null), null);
  });
});

describe('timestamps', () => {
  it('reads numbers, numeric strings, ISO strings and Link Loom log entries', () => {
    assert.equal(readPulseTimestamp(1700000000000), 1700000000000);
    assert.equal(readPulseTimestamp('1700000000000'), 1700000000000);
    assert.equal(readPulseTimestamp('2026-09-23T20:00:00Z'), NOW);
    assert.equal(readPulseTimestamp({ timestamp: '1700000000000' }), 1700000000000);
    assert.equal(readPulseTimestamp('not a date'), null);
    assert.equal(readPulseTimestamp(null), null);
  });

  it('takes the moment of an entry from occurred_at, then from created', () => {
    assert.equal(timestampOf({ occurred_at: '1700000000000' }), 1700000000000);
    assert.equal(timestampOf({ created: { timestamp: 1700000000001 } }), 1700000000001);
    assert.equal(timestampOf({}), null);
  });
});

describe('periodOf', () => {
  const options = { now: NOW, timeZone: BOGOTA };

  it('groups by calendar day in the reader time zone, weeks starting on Monday', () => {
    assert.equal(periodOf(at('2026-09-23T13:00:00Z'), options), 'today');
    assert.equal(periodOf(at('2026-09-23T04:00:00Z'), options), 'yesterday');
    assert.equal(periodOf(at('2026-09-21T15:00:00Z'), options), 'thisWeek');
    assert.equal(periodOf(at('2026-09-20T15:00:00Z'), options), 'thisMonth');
    assert.equal(periodOf(at('2026-08-31T15:00:00Z'), options), 'earlier');
  });

  it('answers the same moment differently in another time zone', () => {
    const lateEveningInBogota = at('2026-09-23T03:00:00Z');
    assert.equal(periodOf(lateEveningInBogota, { now: NOW, timeZone: BOGOTA }), 'yesterday');
    assert.equal(periodOf(lateEveningInBogota, { now: NOW, timeZone: 'UTC' }), 'today');
  });

  it('keeps yesterday on a Monday instead of calling it this week', () => {
    const monday = at('2026-09-21T20:00:00Z');
    assert.equal(
      periodOf(at('2026-09-20T20:00:00Z'), { now: monday, timeZone: BOGOTA }),
      'yesterday',
    );
  });

  it('survives an unknown time zone', () => {
    assert.equal(periodOf(NOW, { now: NOW, timeZone: 'Not/AZone' }), 'today');
  });
});

describe('groupByPeriod', () => {
  it('keeps the order of the entries and leaves empty periods out', () => {
    const entries = [
      { id: 'a', occurred_at: at('2026-09-23T19:00:00Z') },
      { id: 'b', occurred_at: at('2026-09-23T14:00:00Z') },
      { id: 'c', occurred_at: at('2026-09-20T14:00:00Z') },
    ];
    const groups = groupByPeriod(entries, { now: NOW, timeZone: BOGOTA });
    assert.deepEqual(
      groups.map((group) => [group.period, group.entries.map((entry) => entry.id)]),
      [
        ['today', ['a', 'b']],
        ['thisMonth', ['c']],
      ],
    );
  });
});

describe('formatting', () => {
  it('writes recent moments relative to now, in the reader language', () => {
    const options = { locale: 'en', timeZone: BOGOTA, now: NOW };
    assert.equal(formatRowTime(NOW - 30 * 1000, options), 'now');
    assert.equal(formatRowTime(NOW - 5 * 60 * 1000, options), '5 minutes ago');
    assert.equal(formatRowTime(NOW - 3 * 60 * 60 * 1000, options), '3 hours ago');
    assert.equal(
      formatRowTime(NOW - 5 * 60 * 1000, { ...options, locale: 'es' }),
      'hace 5 minutos',
    );
    assert.equal(formatRowTime(null, options), '');
  });

  it('adds only as much of the date as the period has not said', () => {
    const options = { locale: 'en', timeZone: BOGOTA, now: NOW };
    const lastYear = formatRowTime(at('2025-03-04T15:00:00Z'), options);
    const thisYear = formatRowTime(at('2026-03-04T15:00:00Z'), options);
    assert.match(lastYear, /2025/);
    assert.doesNotMatch(thisYear, /2026/);
  });

  it('writes the full time and date values in the reader time zone', () => {
    const full = formatFullTime(at('2026-09-23T03:00:00Z'), { locale: 'en', timeZone: BOGOTA });
    assert.match(full, /Tuesday, September 22, 2026/);
    assert.match(
      formatPulseDate('2026-09-23T03:00:00Z', { locale: 'en', timeZone: 'UTC' }),
      /Sep 23, 2026/,
    );
    assert.equal(formatPulseDate(null), '');
  });
});

describe('changesOf', () => {
  it('leaves out the fields the reader must not see', () => {
    const entry = { payload: { changes: [{ field: 'title' }, { field: 'queue' }, null] } };
    assert.deepEqual(
      changesOf(entry, ['queue']).map((change) => change.field),
      ['title'],
    );
    assert.deepEqual(changesOf({}), []);
  });
});

describe('summarizePulseEntry', () => {
  const labels = mergePulseLabels({ fields: { title: 'Title', priority: 'Priority' } });

  it('names the fields an update changed, joined in the reader language', () => {
    const entry = {
      verb: 'record_updated',
      payload: {
        changes: [
          { field: 'title', kind: PULSE_CHANGE_KINDS.text, from: 'A', to: 'B' },
          { field: 'priority', kind: PULSE_CHANGE_KINDS.catalog, from: null, to: { name: 'high' } },
        ],
      },
    };
    assert.equal(
      summarizePulseEntry(entry, labels, { locale: 'en' }),
      'Changed the Title and Priority',
    );
    assert.equal(summarizePulseEntry({ verb: 'record_updated' }, labels), 'Updated this record');
  });

  it('says where a status moved from and to', () => {
    const entry = {
      verb: 'record_state_changed',
      payload: {
        changes: [
          {
            field: 'stage',
            kind: PULSE_CHANGE_KINDS.stage,
            from: { name: 'new' },
            to: { name: 'review', title: 'Under review' },
          },
        ],
      },
    };
    assert.equal(summarizePulseEntry(entry, labels), 'Changed the status from New to Under review');
  });

  it('tells an assignment from a release', () => {
    const assigned = {
      verb: 'record_assigned',
      payload: {
        changes: [{ field: 'assignee', kind: 'person', from: null, to: { name: 'Ana' } }],
      },
    };
    const released = {
      verb: 'record_assigned',
      payload: {
        changes: [{ field: 'assignee', kind: 'person', from: { name: 'Ana' }, to: null }],
      },
    };
    assert.equal(summarizePulseEntry(assigned, labels), 'Assigned it to Ana');
    assert.equal(summarizePulseEntry(released, labels), 'Removed the assignee');
  });

  it('says where work created by another organization came from', () => {
    const entry = {
      verb: 'work_item_created',
      organization_id: 'org-b',
      payload: { issuing_organization: { id: 'org-a', display_name: 'Acme' } },
    };
    assert.equal(summarizePulseEntry(entry, labels), 'Arrived from Acme');
    assert.equal(
      summarizePulseEntry({ verb: 'record_created', organization_id: 'org-b' }, labels),
      'Created this record',
    );
  });

  it('uses the entry summary for a verb it does not know, and the action words for the rest', () => {
    assert.equal(
      summarizePulseEntry({ verb: 'record_exported', summary: 'Exported to PDF' }, labels),
      'Exported to PDF',
    );
    assert.equal(summarizePulseEntry({ verb: 'record_exported' }, labels), 'Activity');
    assert.equal(
      summarizePulseEntry({ verb: 'record_review_requested' }, labels),
      'Asked for a review',
    );
    assert.equal(summarizePulseEntry({ verb: 'record_rejected' }, labels), 'Rejected it');
  });
});

describe('labels', () => {
  it('merges an app dictionary one level deep', () => {
    const merged = mergePulseLabels({
      periods: { today: 'Hoy' },
      verbTitles: { created: 'Creación' },
    });
    assert.equal(merged.periods.today, 'Hoy');
    assert.equal(merged.periods.yesterday, PULSE_LABELS.periods.yesterday);
    assert.equal(verbTitleOf({ verb: 'record_created' }, merged), 'Creación');
    assert.equal(verbTitleOf({ verb: 'record_exported' }, merged), 'Activity');
  });

  it('titles an app verb by its full name before the action it ends with', () => {
    const merged = mergePulseLabels({
      verbTitles: {
        record_review_cancelled: 'Review cancelled',
        invoice_created: 'Invoice issued',
      },
    });
    assert.equal(verbTitleOf({ verb: 'record_review_cancelled' }, merged), 'Review cancelled');
    assert.equal(verbTitleOf({ verb: 'invoice_created' }, merged), 'Invoice issued');
    assert.equal(verbTitleOf({ verb: 'record_created' }, merged), 'Created');
  });
});
