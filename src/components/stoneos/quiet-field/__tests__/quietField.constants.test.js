import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  STOS_BAND_FIELD_SX,
  STOS_FIELD_TEXT_INSET,
  STOS_QUIET_FIELD,
  STOS_QUIET_FIELD_SX,
} from '../quietField.constants.js';

const ROOT = '& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root';
const OUTLINE = '& .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-notchedOutline';

describe('quiet field', () => {
  it('draws no frame at rest and the kit border when reached for', () => {
    assert.equal(STOS_QUIET_FIELD_SX[ROOT].backgroundColor, 'transparent');
    assert.equal(STOS_QUIET_FIELD_SX[ROOT][OUTLINE].borderColor, 'transparent');
    assert.equal(
      STOS_QUIET_FIELD_SX[ROOT][
        '&:hover .MuiOutlinedInput-notchedOutline, &:hover .MuiPickersOutlinedInput-notchedOutline'
      ].borderColor,
      'var(--stos-border)',
    );
  });

  it('stays quiet while disabled', () => {
    assert.equal(STOS_QUIET_FIELD_SX[ROOT]['&.Mui-disabled'].backgroundColor, 'transparent');
  });

  it('hides the clear and expand affordances until the field is in play', () => {
    assert.equal(
      STOS_QUIET_FIELD_SX['& .MuiAutocomplete-endAdornment, & .MuiInputAdornment-root'].opacity,
      0,
    );
  });

  it('hands a band field small, full width and quiet', () => {
    assert.deepEqual(STOS_QUIET_FIELD, { size: 'small', fullWidth: true, sx: STOS_QUIET_FIELD_SX });
    assert.equal(STOS_FIELD_TEXT_INSET, '6px');
  });

  it('brings every kind of band field to the label inset', () => {
    const insets = Object.values(STOS_BAND_FIELD_SX).map((rule) => rule.paddingLeft);
    assert.deepEqual(insets, [STOS_FIELD_TEXT_INSET, STOS_FIELD_TEXT_INSET, 0]);
    const selectors = Object.keys(STOS_BAND_FIELD_SX).join(' ');
    for (const field of [
      'MuiOutlinedInput-input',
      'MuiInputBase-multiline',
      'MuiInputBase-adornedStart',
      'MuiAutocomplete-inputRoot',
      'MuiPickersOutlinedInput-root',
    ]) {
      assert.ok(selectors.includes(field), field);
    }
  });
});
