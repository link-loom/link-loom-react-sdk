import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { usePageMetaState } from './PageMeta.context.jsx';

const CRUMB_COLOR = 'var(--ll-navbar-crumb, #ffffff)';
const CRUMB_MUTED_COLOR = 'var(--ll-navbar-crumb-muted, rgba(255, 255, 255, 0.78))';
const CRUMB_SEPARATOR_COLOR = 'var(--ll-navbar-crumb-separator, rgba(255, 255, 255, 0.45))';

/**
 * The navbar's breadcrumb slot: the trail above the current page (`Workspaces › Operations`), never
 * the page's own title. Root pages show nothing. It sits on the brand colour of an Adminto navbar,
 * so its colours default to white; a host on another ground redefines the --ll-navbar-crumb* tokens.
 * It stands --ll-navbar-crumb-offset (32px) off the edge of the navbar's list, so every host that renders
 * `<li><NavbarBreadcrumb /></li>` lays it out the same.
 * It is as tall as the navbar (--ll-navbar-height, 70px) so it centres itself wherever the host puts it:
 * a percentage height inside Adminto's floated list items collapses below the desktop breakpoint.
 * Below 600px the navbar has no room for it and it stays out, rather than wrap under the bar and push
 * the user menu off the screen.
 */
function NavbarBreadcrumb({ ariaLabel = 'Location' }) {
  const meta = usePageMetaState();
  const crumbs = Array.isArray(meta?.breadcrumb) ? meta.breadcrumb.filter((crumb) => crumb?.label) : [];

  if (!crumbs.length) {
    return null;
  }

  return (
    <Box
      component="nav"
      aria-label={ariaLabel}
      sx={{
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        gap: 0.75,
        height: 'var(--ll-navbar-height, 70px)',
        maxWidth: 360,
        minWidth: 0,
        pl: 'var(--ll-navbar-crumb-offset, 32px)',
      }}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isLink = Boolean(crumb.to) && !isLast;

        return (
          <React.Fragment key={`${crumb.label}-${index}`}>
            <Typography
              noWrap
              component={isLink ? Link : 'span'}
              to={isLink ? crumb.to : undefined}
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: isLast ? CRUMB_COLOR : CRUMB_MUTED_COLOR,
                textDecoration: 'none',
                '&:hover': { color: CRUMB_COLOR },
              }}
            >
              {crumb.label}
            </Typography>
            {!isLast && (
              <Typography component="span" sx={{ fontSize: 13, color: CRUMB_SEPARATOR_COLOR }}>
                ›
              </Typography>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

export default NavbarBreadcrumb;
