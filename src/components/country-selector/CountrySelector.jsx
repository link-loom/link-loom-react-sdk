import React, { useEffect, useState, useRef } from 'react';
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

  useEffect(() => {
    onChange({
      country: transformToDatabaseFormat(selectedCountry),
    });
  }, [selectedCountry, onChange]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
  };

  useEffect(() => {
    if (value) {
      setSelectedCountry(transformNormalizedData(value?.country ?? null));
    }
  }, [value]);

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
