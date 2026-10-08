export const MIN_REASON_LENGTH = 5;
export const MAX_REASON_LENGTH = 500;

// A reason is enough once it has at least five characters that are not blanks around it.
export const isReasonValid = (reason, required = true) =>
  !required || String(reason || '').trim().length >= MIN_REASON_LENGTH;
