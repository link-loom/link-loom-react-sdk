export const EVIDENCE_LIST_LABELS = {
  empty: 'No evidence attached.',
  add: 'Attach evidence',
  hint: 'What backs this record: a document, a record in another system, a note of what was checked.',
  label: 'What it is',
  link: 'Link (optional)',
  note: 'Note (optional)',
  labelRequired: 'Say what the evidence is',
  attach: 'Attach',
  open: 'Open',
  remove: 'Remove',
  addedBy: (name, date) => `Attached by ${name} · ${date}`,
};

export const EMPTY_EVIDENCE_DRAFT = { label: '', url: '', note: '' };

export const evidenceTitleOf = (piece) => piece?.label || piece?.name || piece?.url || '';

// Only web links open from a piece: a stored `javascript:` or `data:` URL is never handed to the browser.
export const isOpenableLink = (url) => /^https?:\/\/\S+$/i.test(String(url || '').trim());

export const formatEvidenceTimestamp = (value) => {
  const date = new Date(Number(value) || value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '—';
};

// One piece of evidence from the form's draft: what it is (required), where it lives, a line about it,
// and who attached it and when. Evidence with nobody's name on it is a claim, not evidence.
export const buildEvidencePiece = (draft, actor, now = Date.now()) => {
  const label = String(draft?.label || '').trim();
  if (!label) {
    return null;
  }

  return {
    id: `evid-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    label,
    url: String(draft?.url || '').trim() || null,
    note: String(draft?.note || '').trim() || null,
    added_by: actor?.identity ? { identity: actor.identity, name: actor.name || null } : null,
    added_at: String(now),
  };
};
