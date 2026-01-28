import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, matchPath, Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * Breadcrumb Component
 * Renders a human-readable breadcrumb based on the current URL and configuration.
 */
const Breadcrumb = ({ config }) => {
  const location = useLocation();
  const { pathname } = location;
  const {
    separator = '/',
    prefixes = {},
    fallbacks = {
      pathId: 'Path',
      courseId: 'Course',
      capsuleId: 'Micro-capsule',
    },
    routes = {},
  } = config;

  // Find matching route
  let matchedRoute = null;
  let matchResult = null;

  for (const routePattern in routes) {
    const match = matchPath({ path: routePattern, end: true }, pathname);
    if (match) {
      matchedRoute = routes[routePattern];
      matchResult = match;
      break;
    }
  }

  if (!matchedRoute || !matchResult) {
    return null;
  }

  const { segments, labels = {} } = matchedRoute;
  const { params } = matchResult;

  const renderSegment = (segment, index, isLast) => {
    let text = '';
    let isParam = false;

    if (segment.text) {
      text = segment.text;
    } else if (segment.param) {
      isParam = true;
      const paramName = segment.param;
      const paramValue = params[paramName];

      // 1. Try to get label from dictionary
      const dictionary = labels[paramName];
      if (dictionary && dictionary[paramValue]) {
        text = dictionary[paramValue];
      } else {
        // 2. Use Fallback or Default
        // Special rule: institutionSlug is rendered as-is
        if (paramName === 'institutionSlug') {
          text = paramValue;
        } else {
          text = fallbacks[paramName] || paramValue;
        }
      }

      // 3. Apply Prefix
      if (prefixes[paramName]) {
        text = `${prefixes[paramName]} ${text}`;
      }
    }

    const content = text;

    if (isLast) {
      return (
        <Typography key={index} color="text.primary">
          {content}
        </Typography>
      );
    }

    // If 'to' property is provided, render as Link
    if (segment.to) {
      return (
        <Link component={RouterLink} to={segment.to} key={index} underline="hover" color="inherit">
          {content}
        </Link>
      );
    }

    return (
      <Typography key={index} color="inherit">
        {content}
      </Typography>
    );
  };

  return (
    <Breadcrumbs
      separator={separator === '/' ? <NavigateNextIcon fontSize="small" /> : separator}
      aria-label="breadcrumb"
    >
      {segments.map((segment, index) =>
        renderSegment(segment, index, index === segments.length - 1),
      )}
    </Breadcrumbs>
  );
};

Breadcrumb.propTypes = {
  config: PropTypes.shape({
    separator: PropTypes.string,
    prefixes: PropTypes.object,
    fallbacks: PropTypes.shape({
      pathId: PropTypes.string,
      courseId: PropTypes.string,
      capsuleId: PropTypes.string,
    }),
    routes: PropTypes.objectOf(
      PropTypes.shape({
        segments: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.shape({ param: PropTypes.string }),
            PropTypes.shape({ param: PropTypes.string }),
            PropTypes.shape({ text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]) }),
            // Allow 'to' for future proofing or explicit links if config updates
            PropTypes.shape({
              text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
              to: PropTypes.string,
            }),
          ]),
        ).isRequired,
        labels: PropTypes.object,
      }),
    ).isRequired,
  }).isRequired,
};

export default Breadcrumb;
