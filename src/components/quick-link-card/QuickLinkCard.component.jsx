import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Card, CardContent, CardActions } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * HEX to RGBA
 */
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Base colors
 */
export const DEFAULT_COLORS = {
  indigo: '#4F46E5',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  red: '#EF4444',
};

const HoverableCard = styled(Card)`
  box-shadow: var(--ct-box-shadow-sm) !important;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: var(--ct-box-shadow-lg) !important;
  }
`;

const QuickLinkCard = ({
  href,
  title,
  description,
  Icon,
  colorName,
  iconColor,
  backgroundPercentage,
  className = 'd-flex col-12 col-sm-6 col-md-6 col-lg-6 mb-3',
}) => {
  const resolvedHex = iconColor || DEFAULT_COLORS[colorName] || DEFAULT_COLORS.indigo;
  const resolvedBg = hexToRgba(resolvedHex, backgroundPercentage ?? 0.15);

  return (
    <article className={className}>
      <Link to={href} className="flex-fill text-decoration-none">
        <HoverableCard className="border-0 shadow-sm h-100">
          <Card className="d-flex flex-column h-100">
            <CardContent className="d-flex flex-column justify-content-between h-100">
              <header className="mb-2">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded p-2"
                  style={{ backgroundColor: resolvedBg }}
                >
                  <Icon fontSize="small" style={{ color: resolvedHex }} />
                </span>

                <h6 className="fw-bold mt-3 mb-1">{title}</h6>
                <p className="text-muted mb-0">{description}</p>
              </header>
            </CardContent>

            <CardActions className="d-flex justify-content-end">
              <ArrowForwardIcon fontSize="small" className="text-success" />
            </CardActions>
          </Card>
        </HoverableCard>
      </Link>
    </article>
  );
};

QuickLinkCard.propTypes = {
  href: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  Icon: PropTypes.elementType.isRequired,
  colorName: PropTypes.oneOf(['indigo', 'cyan', 'amber', 'red']),
  iconColor: PropTypes.string, // HEX
  backgroundPercentage: PropTypes.number,
};

QuickLinkCard.defaultProps = {
  colorName: 'indigo',
  iconColor: undefined,
  backgroundPercentage: 0.15,
};

export default QuickLinkCard;
