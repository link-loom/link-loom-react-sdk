import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Stack, FormHelperText } from '@mui/material';
import styled from 'styled-components';

const StyledChip = styled(Chip)`
  &.MuiChip-root {
    border-radius: 8px;
    padding: 8px 4px;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid ${(props) => (props.selected ? '#3b82f6' : '#e5e7eb')};
    background-color: ${(props) => (props.selected ? '#eff6ff' : 'transparent')};
    color: ${(props) => (props.selected ? '#1d4ed8' : '#374151')};

    &:hover {
      background-color: ${(props) => (props.selected ? '#dbeafe' : '#f9fafb')};
      border-color: ${(props) => (props.selected ? '#2563eb' : '#d1d5db')};
    }

    &.Mui-disabled {
      opacity: 0.5;
      background-color: transparent;
      border-color: #e5e7eb;
    }
  }

  .MuiChip-label {
    white-space: normal;
    line-height: 1.4;
  }
`;

const MultiSelectChips = ({
  options = [],
  value = [],
  onChange,
  min = 0,
  max = Infinity,
  label,
  helperText,
}) => {
  const handleChange = (optionValue) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      if (value.length <= min) {
        return;
      }
      onChange(value.filter((item) => item !== optionValue));
    } else {
      if (value.length >= max) {
        return;
      }
      onChange([...value, optionValue]);
    }
  };

  const isMaxReached = value.length >= max;

  return (
    <div className="w-100">
      {label && <h6 className="fw-bold mb-2">{label}</h6>}

      <div className="d-flex align-items-center justify-content-between mb-2">
        {helperText && <small className="text-muted">{helperText}</small>}
        <small className="text-muted fw-medium">
          Selected: {value.length} / {max}
        </small>
      </div>

      <Stack direction="row" flexWrap="wrap" gap={1}>
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          const isDisabled = !isSelected && isMaxReached;

          return (
            <StyledChip
              key={option.value}
              className="h-auto text-center"
              label={option.label}
              selected={isSelected}
              onClick={() => handleChange(option.value)}
              variant={isSelected ? 'filled' : 'outlined'}
              disabled={isDisabled}
              clickable={!isDisabled}
            />
          );
        })}
      </Stack>
      {min > 0 && value.length < min && (
        <FormHelperText error>You must select at least {min} options.</FormHelperText>
      )}
    </div>
  );
};

MultiSelectChips.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    }),
  ).isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  label: PropTypes.string,
  helperText: PropTypes.string,
};

export default MultiSelectChips;
