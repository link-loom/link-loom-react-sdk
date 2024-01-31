import React from 'react';
import Select from 'react-select';

const SearchableSelect = (props) => {
  const {
    options,
    onChange,
    placeholder,
    isDisabled,
    defaultValue,
    name,
    ...rest
  } = props;

  const searchDefaultValue = (value) => {
    if (!value) {
      return null;
    }

    return options.filter((_option) => _option.value === value);
  };

  const handleChange = (optionSelected) => {
    const { value, label } = optionSelected;

    const event = {
      name,
      value,
      label,
    };

    onChange(event);
  };

  return (
    <Select
      options={options}
      onChange={handleChange}
      isSearchable
      isDisabled={isDisabled}
      value={searchDefaultValue(defaultValue)}
      placeholder={placeholder}
      name={name}
      {...rest}
    />
  );
};

export default SearchableSelect;
