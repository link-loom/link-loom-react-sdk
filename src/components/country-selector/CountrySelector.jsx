import React, { useEffect, useRef, useState } from 'react';
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

// Transform data from database format to component format
const transformNormalizedData = (data) => {
  if (!data) {
    return null;
  }
  return {
    countryCode: data?.iso_code,
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
    name: data?.label,
  };
};

export default function CountrySelector({ value, label, onChange, disabled, variant }) {
  // UI States
  const [selectedCountry, setSelectedCountry] = useState(null);
  const isFirstRender = useRef(true);

  // Sync selectedCountry from incoming `value` prop without breaking referential stability:
  // only update state when the country actually changes (compared by primitive countryCode).
  useEffect(() => {
    if (!value) return;

    const next = transformNormalizedData(value?.country ?? null);
    setSelectedCountry((prev) => {
      if (prev?.countryCode === next?.countryCode) return prev;
      return next;
    });
  }, [value]);

  // Notify parent only when the selection actually changes (by primitive code),
  // and skip the initial mount to avoid a phantom onChange before user interaction.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChange({
      country: transformToDatabaseFormat(selectedCountry),
    });
  }, [selectedCountry?.countryCode]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
  };

  return (
    <section className="row">
      <article className="col-12">
        <Autocomplete
          id="select-country"
          options={countries.map(transformNormalizedData)}
          autoHighlight
          value={selectedCountry}
          onChange={handleCountryChange}
          disableClearable
          isOptionEqualToValue={(option, value) => option.countryCode === value.countryCode}
          getOptionLabel={(option) => option.label}
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
              label={label || 'Country'}
              autoComplete="off"
              name="country-select"
              id="country-select"
              disabled={disabled}
              variant={disabled ? 'filled' : variant ? variant : 'outlined'}
              InputProps={{
                ...params.InputProps,
                autoComplete: 'off',
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
    </section>
  );
}
