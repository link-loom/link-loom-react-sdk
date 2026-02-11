import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, matchPath, Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * Breadcrumb Component
 * Renders a human-readable breadcrumb based on the current URL and configuration.
 */
const Breadcrumb = ({ config, params: extraParams = {} }) => {
  const location = useLocation();
  const { pathname } = location;
  const { separator = '/', prefixes = {}, fallbacks = {}, routes = {} } = config;

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
  const params = { ...matchResult.params, ...extraParams };

  const interpolatePath = (path, params) => {
    let result = path;
    Object.keys(params).forEach((key) => {
      result = result.replace(new RegExp(`:${key}`, 'g'), params[key]);
    });
    return result;
  };

  const renderSegment = (segment, index, isLast) => {
    let text = '';
    let isParam = false;

    if (segment.text) {
      text = segment.text;
    } else if (segment.param) {
      isParam = true;
      const paramName = segment.param;
      const paramValue = params[paramName];
      const dictionary = labels[paramName];

      if (dictionary && dictionary[paramValue]) {
        text = dictionary[paramValue];
      } else {
        text = fallbacks[paramName] || paramValue;
      }
    }

    if (isParam && prefixes[segment.param]) {
      text = `${prefixes[segment.param]} ${text}`;
    }

    const content = text;

    if (isLast) {
      return (
        <span key={index} className="text-secondary">
          {content}
        </span>
      );
    }

    if (segment.to) {
      const toPath = interpolatePath(segment.to, params);
      return (
        <Link component={RouterLink} to={toPath} key={index} underline="hover" color="inherit">
          {content}
        </Link>
      );
    }

    return (
      <span key={index} className="text-muted">
        {content}
      </span>
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
  params: PropTypes.object,
};

export default Breadcrumb;
