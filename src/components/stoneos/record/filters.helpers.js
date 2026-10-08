import { interpolate } from '../shared/labels.helpers.js';
import { selectedOptionsOf } from './options.helpers.js';
import { resolveRecordLabels } from './record.labels.js';

// The three sentences of a filter chip. An app that already has them in its dictionary passes its `t`
// (keys list.filterAll, list.filterOne, list.filterMany); otherwise they come from the kit's labels.
const filterTextsOf = ({ t, labels, locale }) => {
  if (typeof t === 'function') {
    return {
      all: t('list.filterAll'),
      one: (label, value) => t('list.filterOne', { label, value }),
      many: (label, value, more) => t('list.filterMany', { label, value, more }),
    };
  }

  const dictionary = resolveRecordLabels(labels, locale);
  return {
    all: dictionary.filterAll,
    one: (label, value) => interpolate(dictionary.filterOne, { label, value }),
    many: (label, value, more) => interpolate(dictionary.filterMany, { label, value, more }),
  };
};

const summaryOf = (texts, label, names) => {
  if (names.length === 0) {
    return label;
  }
  if (names.length === 1) {
    return texts.one(label, names[0]);
  }

  return texts.many(label, names[0], names.length - 1);
};

// A filter of a list as a chip of the kit's FilterBar with its menu. The chip names what is selected
// ("Roles: Customer +1"), the first item of the menu clears it and each other item picks one option
// (or toggles it when `multiple`). `options` are [{ id, label }]; `value` is an id, or a list of ids when
// `multiple`. A `locked` filter (fixed by the app that asked for a pick) shows its selection without a menu.
export const menuFilterChip = ({
  t,
  labels,
  locale = 'en',
  id,
  label,
  icon,
  options,
  value,
  multiple = false,
  locked = false,
  onChange,
}) => {
  const texts = filterTextsOf({ t, labels, locale });
  const selected = selectedOptionsOf(value, multiple);
  const names = selected.map((optionId) => options.find((option) => option.id === optionId)?.label || optionId);

  const pick = (optionId) => {
    if (!multiple) {
      onChange(selected.includes(optionId) ? '' : optionId);
      return;
    }
    onChange(
      selected.includes(optionId) ? selected.filter((current) => current !== optionId) : [...selected, optionId],
    );
  };

  return {
    id,
    icon,
    label: summaryOf(texts, label, names),
    active: selected.length > 0,
    menu: locked
      ? undefined
      : [
          {
            id: `${id}:all`,
            label: texts.all,
            checked: selected.length === 0,
            onClick: () => onChange(multiple ? [] : ''),
          },
          ...options.map((option) => ({
            id: option.id,
            label: option.label,
            checked: selected.includes(option.id),
            onClick: () => pick(option.id),
          })),
        ],
  };
};
