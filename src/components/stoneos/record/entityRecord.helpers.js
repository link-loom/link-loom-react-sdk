export const defaultIdOf = (record) => record?.id;

const NEW_RECORD_KEY = 'new';

// Remounts the record when another one opens, so no state leaks from one record into the next.
export const recordKeyOf = (record, idOf = defaultIdOf) => (record && idOf(record)) || NEW_RECORD_KEY;

// The link that opens a record on its own: only a saved record has one.
export const copyLinkPathOf = ({ creating, record, linkOf }) => {
  if (creating || !record || typeof linkOf !== 'function') {
    return undefined;
  }

  return linkOf(record);
};

// "Done" answers the app that waits for the record; without one the button just closes the modal.
export const doneLabelOf = (canSubmitOutput, labels) => (canSubmitOutput ? labels.done : labels.close);

// Hands the record to the app that waits for it. Nothing happens when nobody waits, when the app gave no
// way to answer or when there is no record.
export const createReferenceSubmitter =
  ({ canSubmitOutput, onSubmitReference, entityType }) =>
  (record) => {
    if (!canSubmitOutput || !record || typeof onSubmitReference !== 'function') {
      return;
    }

    onSubmitReference(entityType, record);
  };
