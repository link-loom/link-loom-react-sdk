import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';

/**
 * TagInputField Component
 *
 * @component
 *
 * @description
 * `TagInputField` allows users to enter one or more textual tags through a flexible input interface.
 * Users can select predefined options or enter custom values freely. Each selected tag is displayed as a removable chip.
 * This component is ideal for cases where users need to assign categories, labels, keywords or other identifiers to a resource.
 *
 * Supports:
 * - Selection from predefined options (autocomplete).
 * - Free text input (`freeSolo`).
 * - Multiple entries.
 * - Chip display with removal interaction.
 *
 * Integration:
 * - Controlled via the `value` and `onChange` props.
 * - Designed for integration into forms, filters, or content editors.
 *
 * Note:
 * - Built on top of Material UI’s Autocomplete with `multiple` and `freeSolo` modes.
 * - Uses `renderValue` to manage chip rendering (no deprecated props).
 *
 * @param {Array<string>} options - List of available suggestions for autocomplete.
 * @param {Array<string>} value - Current list of selected tags.
 * @param {Function} onChange - Called with updated tag array when the user adds or removes a tag.
 * @param {string} label - Label for the input field.
 * @param {string} placeholder - Placeholder text shown when the field is empty.
 */

function TagInputField({
  options = [],
  value = [],
  onChange,
  label = 'Tags',
  placeholder = 'Add a tag',
  textFieldProps = {},
  autocompleteProps = {},
}) {
  return (
    <Autocomplete
      fullWidth
      multiple
      freeSolo
      options={options}
      value={Array.isArray(value) ? value : []}
      onChange={(event, newValue) => onChange(newValue)}
      isOptionEqualToValue={(option, value) => option === value}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip variant="outlined" label={option} key={key} {...tagProps} />;
        })
      }
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder}  />
      )}
    />
  );
}

TagInputField.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};

export default TagInputField;
