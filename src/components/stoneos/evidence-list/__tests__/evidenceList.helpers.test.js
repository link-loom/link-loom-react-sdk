import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EVIDENCE_LIST_LABELS,
  buildEvidencePiece,
  evidenceTitleOf,
  formatEvidenceTimestamp,
  isOpenableLink,
} from '../evidenceList.helpers.js';

describe('buildEvidencePiece', () => {
  it('refuses a piece that does not say what it is', () => {
    assert.equal(buildEvidencePiece({ label: '   ', url: 'https://example.com' }, null), null);
    assert.equal(buildEvidencePiece(null, null), null);
  });

  it('keeps who attached it and when, and drops empty optional fields', () => {
    const piece = buildEvidencePiece(
      { label: '  Signed contract ', url: ' ', note: '' },
      { identity: 'vp-1', name: 'Ana Ruiz' },
      1700000000000,
    );
    assert.equal(piece.label, 'Signed contract');
    assert.equal(piece.url, null);
    assert.equal(piece.note, null);
    assert.deepEqual(piece.added_by, { identity: 'vp-1', name: 'Ana Ruiz' });
    assert.equal(piece.added_at, '1700000000000');
    assert.match(piece.id, /^evid-[a-z0-9]+-[a-z0-9]{1,4}$/);
  });

  it('does not invent an author when the actor has no identity', () => {
    assert.equal(buildEvidencePiece({ label: 'Note' }, { name: 'Nobody' }).added_by, null);
  });

  it('gives two pieces attached in the same millisecond different ids', () => {
    const first = buildEvidencePiece({ label: 'A' }, null, 1700000000000);
    const second = buildEvidencePiece({ label: 'B' }, null, 1700000000000);
    assert.notEqual(first.id, second.id);
  });
});

describe('isOpenableLink', () => {
  it('opens web links only', () => {
    assert.equal(isOpenableLink('https://example.com/file.pdf'), true);
    assert.equal(isOpenableLink(' http://example.com '), true);
    assert.equal(isOpenableLink('javascript:alert(1)'), false);
    assert.equal(isOpenableLink('data:text/html,hi'), false);
    assert.equal(isOpenableLink('example.com'), false);
    assert.equal(isOpenableLink(null), false);
  });
});

describe('presentation', () => {
  it('names a piece by its label, then its name, then its link', () => {
    assert.equal(evidenceTitleOf({ label: 'Invoice', url: 'https://x' }), 'Invoice');
    assert.equal(evidenceTitleOf({ name: 'scan.pdf' }), 'scan.pdf');
    assert.equal(evidenceTitleOf({ url: 'https://x' }), 'https://x');
    assert.equal(evidenceTitleOf(null), '');
  });

  it('writes a missing moment as a dash', () => {
    assert.equal(formatEvidenceTimestamp(null), '—');
    assert.equal(formatEvidenceTimestamp('not a date'), '—');
    assert.notEqual(formatEvidenceTimestamp('1700000000000'), '—');
  });

  it('says who attached a piece and when', () => {
    assert.equal(EVIDENCE_LIST_LABELS.addedBy('Ana', 'today'), 'Attached by Ana · today');
  });
});
