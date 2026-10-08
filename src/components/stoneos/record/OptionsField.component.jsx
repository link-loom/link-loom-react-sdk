import React from 'react';
import { Autocomplete, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { STOS_QUIET_FIELD_SX } from '../quiet-field/quietField.constants.js';
import { optionLabelOf, optionsEqual } from './options.helpers.js';
import { autocompleteLabelsOf, resolveRecordLabels } from './record.labels.js';

// Every list a form picks from is an autocomplete: it opens on focus and narrows as the person types.
// A failed load says so, with Retry, and is never shown as "No matches". `loadError` carries the failure
// of an asynchronous source and `onRetry` loads it again. A `quiet` field lives in a PropertyField or a
// band cell, which shows its label: it reads as its value until reached for and keeps the label for
// assistive technology only.
function OptionsField({
  label,
  value,
  onChange,
  options,
  getOptionLabel = optionLabelOf,
  isOptionEqualToValue = optionsEqual,
  renderOption,
  groupBy,
  multiple = false,
  limitTags,
  freeSolo = false,
  disabled = false,
  required = false,
  disableClearable = false,
  loading = false,
  loadError = null,
  onRetry,
  onOpen,
  onClose,
  onInputChange,
  filterOptions,
  helperText,
  error = false,
  placeholder,
  size = 'small',
  fullWidth = true,
  sx,
  startAdornment,
  quiet = false,
  labels,
  locale = 'en',
}) {
  // -----------------------------------------------------
  // 1. Hooks
  // -----------------------------------------------------
  const text = resolveRecordLabels(labels, locale);

  // -----------------------------------------------------
  // 7. Render
  // -----------------------------------------------------
  const noOptionsText = loadError ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" sx={{ color: 'error.main' }}>
        {text.optionsLoadError}
      </Typography>
      {onRetry && (
        <Button size="small" onClick={onRetry}>
          {text.retry}
        </Button>
      )}
    </Box>
  ) : (
    text.noMatches
  );

  return (
    <Autocomplete
      size={size}
      fullWidth={fullWidth}
      multiple={multiple}
      limitTags={limitTags}
      freeSolo={freeSolo}
      disabled={disabled}
      disableClearable={disableClearable}
      openOnFocus
      autoHighlight
      handleHomeEndKeys
      options={options}
      value={value}
      loading={loading}
      {...autocompleteLabelsOf(text)}
      noOptionsText={noOptionsText}
      groupBy={groupBy}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      renderOption={renderOption}
      filterOptions={filterOptions}
      onOpen={onOpen}
      onClose={onClose}
      onInputChange={onInputChange ? (event, inputText, reason) => onInputChange(inputText, reason) : undefined}
      onChange={(event, next) => onChange(next)}
      sx={quiet ? { ...STOS_QUIET_FIELD_SX, ...sx } : sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={quiet ? undefined : label}
          required={required}
          placeholder={placeholder}
          error={error || Boolean(loadError && !options.length)}
          helperText={quiet ? undefined : helperText}
          inputProps={quiet ? { ...params.inputProps, 'aria-label': label } : params.inputProps}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {startAdornment}
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={14} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default OptionsField;
