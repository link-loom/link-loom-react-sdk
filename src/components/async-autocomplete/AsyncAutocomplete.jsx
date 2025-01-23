import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import { useDebounce } from '@link-loom/react-sdk';

function AsyncAutocomplete({
  label,
  placeholder = '',
  value,
  onChange,
  fetchOptions,
  filters = {},
  disabled = false,
  loadingMessage = 'Loading...',
  noOptionsMessage = 'No options',
  isOptionEqualToValue,
  getOptionLabel,
  debounceTime = 300,
  ui = {},
  openOnEmptyQuery = false,
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const debouncedInputValue = useDebounce(inputValue, debounceTime);

  const fetchData = async (query = '') => {
    if ((query || openOnEmptyQuery) && fetchOptions && filters) {
      setLoading(true);

      const results = await fetchOptions(query, filters);

      setOptions(results);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(debouncedInputValue);
  }, [debouncedInputValue]);

  const handleInputChange = (_, query) => {
    setLoading(true);
    setInputValue(query);
  };

  const handleOpen = () => {
    setOpen(true);
    if (openOnEmptyQuery && inputValue === '') {
      fetchData('');
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={handleOpen}
      onClose={() => setOpen(false)}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      onInputChange={handleInputChange}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      options={options}
      disabled={disabled}
      noOptionsText={!loading ? noOptionsMessage : loadingMessage}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
            style: ui.input || {},
          }}
        />
      )}
      renderOption={(props, option, index) => {console.log(option);
        const key = option.id || `option-${index}`;
        
        if (option.title === loadingMessage) {
          return (
            <li
              key={`loading-${index}`}
              {...props}
              style={{ textAlign: 'center', fontStyle: 'italic', ...ui.loadingMessage }}
            >
              {loadingMessage}
            </li>
          );
        }
      
        return (
          <li key={key} {...props}>
            {getOptionLabel(option)}
          </li>
        );
      }}
      sx={{
        ...ui.autocomplete,
      }}
      ListboxProps={{
        style: ui.listbox || {},
      }}
    />
  );
}

export default AsyncAutocomplete;
