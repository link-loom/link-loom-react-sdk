import React from 'react';
import { Box, Typography } from '@mui/material';
import { STOS_BAND_FIELD_SX, STOS_FIELD_TEXT_INSET } from '../quiet-field/quietField.constants.js';

// A missing or wrong value frames its quiet field at rest, so the person finds it without hovering.
const ERROR_FIELD_SX = {
  '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: 'error.main' },
};

// A field of a record's tab laid out as a cell of the property band: the label on top and the quiet field
// (the kit's STOS_QUIET_FIELD) under it, its text starting under the label. The band and the tabs read as
// one form. `wide` takes the whole row of the property form (`.stos-property-form`).
function PropertyField({ label, required = false, error = false, helperText, wide = false, children }) {
  return (
    <Box className={wide ? 'stos-property-field stos-property-field--wide' : 'stos-property-field'}>
      <Typography
        variant="caption"
        component="div"
        sx={{ color: error ? 'error.main' : 'text.tertiary', pl: STOS_FIELD_TEXT_INSET }}
      >
        {label}
        {required && (
          <Box component="span" aria-hidden sx={{ ml: 0.25 }}>
            *
          </Box>
        )}
      </Typography>
      <Box sx={{ minWidth: 0, ...STOS_BAND_FIELD_SX, ...(error ? ERROR_FIELD_SX : {}) }}>{children}</Box>
      {helperText && (
        <Typography
          variant="caption"
          component="div"
          sx={{ color: error ? 'error.main' : 'text.tertiary', pl: STOS_FIELD_TEXT_INSET }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default PropertyField;
