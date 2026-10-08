// An option is an object with an `id` or a `value`, or a plain value; two options are the same when they
// share that identity.
export const optionIdentityOf = (option) => option?.id ?? option?.value ?? option;

export const optionsEqual = (option, value) => optionIdentityOf(option) === optionIdentityOf(value);

export const optionLabelOf = (option) => option?.label ?? String(option ?? '');

export const selectedOptionsOf = (value, multiple = false) => {
  if (multiple) {
    return value || [];
  }

  return value ? [value] : [];
};

// The selected values stay options while the list changes underneath them (a search narrowed the list
// to something that no longer holds the selection). A selected value whose label is already listed is
// not added twice.
export const mergeSelectedOptions = ({ options, value, multiple = false, getOptionLabel }) => {
  const selected = selectedOptionsOf(value, multiple);
  const known = new Set(options.map((option) => getOptionLabel?.(option)));

  return [...options, ...selected.filter((option) => option && !known.has(getOptionLabel?.(option)))];
};
