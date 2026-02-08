import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid ${props => props.selected ? '#3b82f6' : '#e5e7eb'} !important;
  background-color: ${props => props.selected ? '#eff6ff' : '#ffffff'} !important;
  position: relative;
  height: 100%;

  &:hover {
    border-color: #3b82f6 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const CheckIconWrapper = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: #3b82f6;
  opacity: ${props => props.selected ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const IconWrapper = styled.div`
  color: #3b82f6;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  
  svg {
    font-size: 2rem;
  }
`;

const ImageCardSelect = ({
    options = [],
    value,
    onChange,
    columns = 3
}) => {
    return (
        <div className="row g-3">
            {options.map((option) => (
                <div key={option.value} className={`col-12 col-md-${12 / columns}`}>
                    <StyledCard
                        selected={value === option.value}
                        onClick={() => onChange(option.value)}
                        className="h-100"
                        elevation={0}
                    >
                        <CheckIconWrapper selected={value === option.value}>
                            <CheckCircleIcon fontSize="small" />
                        </CheckIconWrapper>

                        <CardContent className="text-center p-4 d-flex flex-column align-items-center h-100 justify-content-center">
                            {option.icon && (
                                <IconWrapper>
                                    {option.icon}
                                </IconWrapper>
                            )}

                            <h6 className="fw-bold mb-2 text-dark">{option.title}</h6>
                            <p className="text-muted small mb-0 lh-sm">{option.description}</p>
                        </CardContent>
                    </StyledCard>
                </div>
            ))}
        </div>
    );
};

ImageCardSelect.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            icon: PropTypes.node,
        })
    ).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    columns: PropTypes.number,
};

export default ImageCardSelect;
