// Where a field's own text begins inside its box. The property band's labels take the same inset, so a
// label and its value share one left edge whatever control the value happens to be.
export const STOS_FIELD_TEXT_INSET = '6px';

// Every control in a property band is the same field: at rest it reads as the value itself (no box, no
// frame, on the band's own surface) and only takes the shape of an input when it is reached for. The
// detail and the create form share it, so the two bands are one band in two moments.
export const STOS_QUIET_FIELD_SX = {
  '& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
    backgroundColor: 'transparent',
    transition: 'background-color var(--stos-motion-fast, 120ms) ease-in-out',
    '& .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
    '&:hover': { backgroundColor: 'background.paper' },
    '&:hover .MuiOutlinedInput-notchedOutline, &:hover .MuiPickersOutlinedInput-notchedOutline': {
      borderColor: 'var(--stos-border)',
    },
    '&.Mui-focused': { backgroundColor: 'background.paper' },
    '&.Mui-disabled': { backgroundColor: 'transparent' },
    '&.Mui-disabled .MuiOutlinedInput-notchedOutline, &.Mui-disabled .MuiPickersOutlinedInput-notchedOutline':
      {
        borderColor: 'transparent',
      },
  },
  // The clear and expand affordances are noise until the field is in play.
  '& .MuiAutocomplete-endAdornment, & .MuiInputAdornment-root': {
    opacity: 0,
    transition: 'opacity var(--stos-motion-fast, 120ms) ease-in-out',
  },
  '&:hover .MuiAutocomplete-endAdornment, &:hover .MuiInputAdornment-root, & .Mui-focused .MuiAutocomplete-endAdornment, & .Mui-focused .MuiInputAdornment-root':
    {
      opacity: 1,
    },
};

// What a band field is handed: quiet, small and full width (`<TextField {...STOS_QUIET_FIELD} />`).
export const STOS_QUIET_FIELD = { size: 'small', fullWidth: true, sx: STOS_QUIET_FIELD_SX };

// A property band cell brings the text of whatever field it holds to the band's inset, so the value
// starts exactly under its label: a text field through its input, an autocomplete, a multiline field or
// a field with a leading adornment through its root, a date picker through its root. MUI pads each of
// them differently (14px, 6 + 8px), which left the values 8px right of their labels. `&&` outranks the
// fields' own padding rules whatever order the styles were inserted in.
export const STOS_BAND_FIELD_SX = {
  '&& .MuiOutlinedInput-root .MuiOutlinedInput-input': { paddingLeft: STOS_FIELD_TEXT_INSET },
  '&& .MuiOutlinedInput-root.MuiInputBase-multiline, && .MuiOutlinedInput-root.MuiInputBase-adornedStart, && .MuiOutlinedInput-root.MuiAutocomplete-inputRoot, && .MuiPickersOutlinedInput-root':
    { paddingLeft: STOS_FIELD_TEXT_INSET },
  '&& .MuiOutlinedInput-root.MuiInputBase-multiline .MuiOutlinedInput-input, && .MuiOutlinedInput-root.MuiInputBase-adornedStart .MuiOutlinedInput-input, && .MuiOutlinedInput-root.MuiAutocomplete-inputRoot .MuiOutlinedInput-input':
    { paddingLeft: 0 },
};
