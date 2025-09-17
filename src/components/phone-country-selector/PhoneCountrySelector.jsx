import React, { useEffect, useState, useRef, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import styled from 'styled-components';

import { countries } from '@resources/countries';

const StyledListItem = styled.li`
  & > img {
    margin-right: 6px;
    flex-shrink: 0;
  }
`;

const isEmpty = (value) => {
  return value.trim() === '';
};

// Transform data from database format to component format
const transformNormalizedData = (data) => {
  if (!data) {
    return null;
  }
  return {
    countryCode: data?.iso_code,
    dialCode: data?.dial_code,
    label: data?.name,
  };
};

// Transform data from component format to database format
const transformToDatabaseFormat = (data) => {
  if (!data) {
    return null;
  }
  return {
    iso_code: data?.countryCode,
    dial_code: data?.dialCode,
    name: data?.label,
  };
};

export default function PhoneCountrySelector({
  value,
  label,
  onPhoneChange,
  disabled,
  variant,
  ui = { inputSize: 'normal' },
}) {
  // UI States
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const [phoneInputValue, setPhoneInputValue] = useState('');

  // Refs
  const phoneInputRef = useRef(null);

  const onChangeRef = useRef(onPhoneChange);
  useEffect(() => {
    onChangeRef.current = onPhoneChange;
  }, [onPhoneChange]);

  const lastEmittedRef = useRef(null);

  useEffect(() => {
    if (isEmpty(phoneInputValue)) return;
    console.log('[selector] emit', { phoneInputValue, selectedCountry });

    const internationalPhoneNumber = `${selectedCountry?.dialCode ?? ''}${phoneInputValue}`;
    const payload = {
      country: transformToDatabaseFormat(selectedCountry),
      international_phone_number: internationalPhoneNumber,
      phone_number: phoneInputValue,
    };

    const last = lastEmittedRef.current;
    if (
      !last ||
      last.phone_number !== payload.phone_number ||
      last.country?.iso_code !== payload.country?.iso_code ||
      last.country?.dial_code !== payload.country?.dial_code
    ) {
      lastEmittedRef.current = payload;
      onChangeRef.current?.(payload);
    }
  }, [phoneInputValue, selectedCountry]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
    setIsCountrySelected(true);
  };

  const handlePhoneClick = () => {
    if (!isCountrySelected) {
      setSelectedCountry(null);
    }
  };

  const handlePhoneInputChange = (event) => {
    const inputValue = event?.target?.value;
    const sanitizedInputValue = sanitizeInput(inputValue);

    if (/^[0-9]*$/.test(sanitizedInputValue)) {
      setPhoneInputValue(sanitizedInputValue);
    }
  };

  function sanitizeInput(input) {
    return input.replace(/[^0-9]/g, '');
  }

  useEffect(() => {
    if (isCountrySelected && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [isCountrySelected]);

  useEffect(() => {
    if (value && phoneInputValue !== value?.phone_number) {
      setSelectedCountry(transformNormalizedData(value?.country ?? null));
      setPhoneInputValue(value?.phone_number ?? '');
      setIsCountrySelected(!!value?.country);
    }
  }, [value]);

  const options = useMemo(() => countries.map(transformNormalizedData), []);

  return (
    <section className="row">
      <article className="col-md-6 col-12">
        <Autocomplete
          id="select-country"
          options={options}
          autoHighlight
          value={selectedCountry}
          onChange={handleCountryChange}
          disableClearable
          isOptionEqualToValue={(option, value) => option.countryCode === value.countryCode}
          getOptionLabel={(option) => '+' + option.dialCode}
          filterOptions={(options, { inputValue }) =>
            options.filter(
              (option) =>
                option.countryCode.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.label.toLowerCase().includes(inputValue.toLowerCase()),
            )
          }
          renderOption={(props, option) => (
            <StyledListItem {...props} key={option.countryCode}>
              <img
                loading="lazy"
                width="20"
                srcSet={`https://flagcdn.com/w40/${option?.countryCode?.toLowerCase()}.png 2x`}
                src={`https://flagcdn.com/w20/${option?.countryCode?.toLowerCase()}.png`}
                alt=""
              />
              {option.label}
            </StyledListItem>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Country"
              autoComplete="link-loom-select"
              name="link-loom-select"
              id="link-loom-select"
              disabled={disabled}
              variant={disabled ? 'filled' : variant ? variant : 'outlined'}
              size={ui?.inputSize}
              InputProps={{
                ...params.InputProps,
                autoComplete: 'link-loom-select',
                startAdornment: selectedCountry && (
                  <>
                    <img
                      loading="lazy"
                      width="20"
                      src={`https://flagcdn.com/w20/${selectedCountry?.countryCode?.toLowerCase()}.png`}
                      alt=""
                    />
                  </>
                ),
              }}
            />
          )}
        />
      </article>

      <article className="col-md-6 col-12">
        <TextField
          type="tel"
          id="primary_phone_number"
          name="primary_phone_number"
          className="w-100"
          autoComplete="new-password"
          value={phoneInputValue}
          placeholder="3002355432"
          label={label || 'Phone number'}
          onFocus={handlePhoneClick}
          onChange={handlePhoneInputChange}
          disabled={!isCountrySelected || disabled}
          variant={!isCountrySelected || disabled ? 'filled' : variant ? variant : 'outlined'}
          inputRef={phoneInputRef}
          size={ui?.inputSize}
        />
      </article>
    </section>
  );
}
