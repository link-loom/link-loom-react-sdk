import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatDateTime, formatRelativeTime, readTimestamp } from '../timestamps.helpers.js';

const NOW = Date.parse('2026-09-23T20:00:00Z');

describe('readTimestamp', () => {
  it('reads numbers, numeric strings, ISO strings and Link Loom log entries', () => {
    assert.equal(readTimestamp(1700000000000), 1700000000000);
    assert.equal(readTimestamp('1700000000000'), 1700000000000);
    assert.equal(readTimestamp('2026-09-23T20:00:00Z'), NOW);
    assert.equal(readTimestamp({ timestamp: '1700000000000' }), 1700000000000);
  });

  it('reads nothing as null', () => {
    assert.equal(readTimestamp(null), null);
    assert.equal(readTimestamp(0), null);
    assert.equal(readTimestamp('not a date'), null);
    assert.equal(readTimestamp({}), null);
  });
});

describe('formatRelativeTime', () => {
  it('says how long ago in the language of the reader', () => {
    assert.equal(formatRelativeTime(NOW - 3 * 86400 * 1000, 'en', NOW), '3 days ago');
    assert.equal(formatRelativeTime(NOW - 3 * 86400 * 1000, 'es', NOW), 'hace 3 días');
    assert.equal(formatRelativeTime(NOW - 86400 * 1000, 'en', NOW), 'yesterday');
    assert.equal(formatRelativeTime(NOW - 2 * 3600 * 1000, 'en', NOW), '2 hours ago');
  });

  it('says now for less than a minute and nothing for no date', () => {
    assert.equal(formatRelativeTime(NOW - 5000, 'en', NOW), 'now');
    assert.equal(formatRelativeTime(null, 'en', NOW), '');
  });
});

describe('formatDateTime', () => {
  it('writes the date and time in the time zone asked for', () => {
    const text = formatDateTime(NOW, { locale: 'en', timeZone: 'America/Bogota' });

    assert.match(text, /Sep 23, 2026/);
    assert.match(text, /3:00/);
  });

  it('writes nothing for no date', () => {
    assert.equal(formatDateTime(undefined), '');
  });
});
