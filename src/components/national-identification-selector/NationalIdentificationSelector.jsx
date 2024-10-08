import React, { useEffect, useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import styled from 'styled-components';

import { countries } from './countries';

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

// Tipos de documentos más comunes a nivel global
const documentTypes = [
  { label: 'National ID' },
  { label: 'Passport' },
  { label: "Driver's License" },
  { label: 'Residence Permit' },
  { label: 'Social Security Number' },
  { label: 'Taxpayer Identification Number (TIN)' },
  { label: 'Voter ID' },
  { label: 'Other' },
];

export default function NationalIdentificationSelector({
  value,
  label,
  onIDChange,
  disabled,
  variant,
}) {
  // UI States
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const [idFieldClicked, setIDFieldClicked] = useState(false);
  const [idInputValue, setIDInputValue] = useState('');

  // Refs
  const idInputRef = useRef(null);

  useEffect(() => {
    if (!isEmpty(idInputValue)) {
      onIDChange({
        country: transformToDatabaseFormat(selectedCountry),
        document_type: selectedDocumentType?.label,
        identification: idInputValue,
      });
    }
  }, [idInputValue, selectedCountry, selectedDocumentType, onIDChange]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
    setIsCountrySelected(true);
  };

  const handleDocumentTypeChange = (event, newValue) => {
    setSelectedDocumentType(newValue);
  };

  const handleIDClick = () => {
    if (!isCountrySelected) {
      setSelectedCountry(null);
      setIDFieldClicked(true);
    }
  };

  const handleIDInputChange = (event) => {
    const inputValue = event?.target?.value;
    const sanitizedInputValue = sanitizeInput(inputValue);
    setIDInputValue(sanitizedInputValue);
  };

  function sanitizeInput(input) {
    return input.replace(/[^a-zA-Z0-9]/g, ''); // Permitir solo letras y números
  }

  useEffect(() => {
    if (isCountrySelected && idInputRef.current) {
      idInputRef.current.focus();
    }
  }, [isCountrySelected]);

  useEffect(() => {
    if (value && idInputValue !== value?.identification) {
      setSelectedCountry(transformNormalizedData(value?.country ?? null));
      setIDInputValue(value?.identification ?? '');
      setSelectedDocumentType({ label: value?.document_type });
      setIsCountrySelected(!!value?.country);
    }
  }, [value]);

  return (
    <section className="d-md-flex">
      <article className="col-md-4 col-12">
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
              label="Country"
              autoComplete="country-select"
              name="country-select"
              id="country-select"
              disabled={disabled}
              variant={disabled ? 'filled' : variant ? variant : 'outlined'}
              InputProps={{
                ...params.InputProps,
                autoComplete: 'country-select',
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

      <article className="col-md-4 col-12 ms-0 ms-md-1">
        <Autocomplete
          id="select-document-type"
          options={documentTypes}
          autoHighlight
          value={selectedDocumentType}
          onChange={handleDocumentTypeChange}
          disableClearable
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Document Type"
              autoComplete="document-type-select"
              name="document-type-select"
              id="document-type-select"
              disabled={disabled}
              variant={disabled ? 'filled' : variant ? variant : 'outlined'}
            />
          )}
        />
      </article>

      <article className="col-md-4 col-12 ms-0 ms-md-1">
        <TextField
          type="text"
          id="identification_number"
          name="identification_number"
          className="w-100"
          autoComplete="new-password"
          value={idInputValue}
          placeholder="Enter identification"
          label={label || 'Identification'}
          onFocus={handleIDClick}
          onChange={handleIDInputChange}
          disabled={!isCountrySelected || disabled}
          variant={!isCountrySelected || disabled ? 'filled' : variant ? variant : 'outlined'}
          inputRef={idInputRef}
        />
      </article>
    </section>
  );
}