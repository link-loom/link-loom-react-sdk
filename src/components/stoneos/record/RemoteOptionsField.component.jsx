import React from 'react';
import OptionsField from './OptionsField.component.jsx';
import useAsyncOptions from './useAsyncOptions.hook.js';
import { mergeSelectedOptions, optionLabelOf } from './options.helpers.js';

// A picker over an asynchronous source: `loader(text)` answers the options, once when it opens and
// again, debounced (`debounceMs`), as the person types when `searchable`. The selected value stays an
// option while the list changes underneath it.
function RemoteOptionsField({
  loader,
  searchable = false,
  debounceMs,
  value,
  multiple = false,
  getOptionLabel = optionLabelOf,
  ...rest
}) {
  const { options, loading, error, setOpen, onInputChange, reload } = useAsyncOptions(loader, {
    searchable,
    debounceMs,
  });

  return (
    <OptionsField
      {...rest}
      value={value}
      multiple={multiple}
      getOptionLabel={getOptionLabel}
      options={mergeSelectedOptions({ options, value, multiple, getOptionLabel })}
      loading={loading}
      loadError={error}
      onRetry={reload}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={searchable ? onInputChange : undefined}
      filterOptions={searchable ? (items) => items : undefined}
    />
  );
}

export default RemoteOptionsField;
