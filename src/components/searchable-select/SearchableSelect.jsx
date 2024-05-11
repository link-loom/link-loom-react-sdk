import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

const SearchableSelect = (props) => {
  const { onChange, placeholder, isDisabled, defaultValue, name, ...rest } = props;

  const options = Array.isArray(props.options) ? props.options : [];

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

SearchableSelect.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isDisabled: PropTypes.bool,
  defaultValue: PropTypes.any,
  name: PropTypes.string.isRequired,
};

export default SearchableSelect;
