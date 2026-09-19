import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ViewTabs from '../view-tabs/ViewTabs.component.jsx';
import { STOS_TOPBAR_HEIGHT } from '../theme/stoneos.constants.js';

// Rows: [breadcrumb] · icon + h3 (as <h1>) + count + actions · description · view tabs · children.
function PageHeader({
  icon,
  title,
  titleAdornment,
  count,
  description,
  breadcrumb = [],
  actions,
  tabs,
  leading,
  sticky = false,
  stickyTop = STOS_TOPBAR_HEIGHT,
  divider = true,
  sx = {},
  children,
}) {
  const crumbs = breadcrumb.filter((crumb) => crumb?.label);

  return (
    <Box
      component="header"
      sx={{
        position: sticky ? 'sticky' : 'static',
        top: sticky ? stickyTop : 'auto',
        zIndex: sticky ? 5 : 'auto',
        backgroundColor: 'background.default',
        pb: tabs || children ? 0 : 1.5,
        mb: 2,
        borderBottom: divider && !tabs ? 1 : 0,
        borderColor: 'divider',
        ...sx,
      }}
    >
      {crumbs.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          {crumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.label}-${index}`}>
              <Typography
                variant="body2"
                component={crumb.to ? Link : 'span'}
                to={crumb.to}
                noWrap
                sx={{
                  color: 'text.tertiary',
                  textDecoration: 'none',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {crumb.label}
              </Typography>
              {index < crumbs.length - 1 && (
                <Typography variant="body2" component="span" sx={{ color: 'text.tertiary' }}>
                  ›
                </Typography>
              )}
            </React.Fragment>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 36 }}>
        {leading}
        {icon && (
          <Box sx={{ display: 'inline-flex', color: 'text.tertiary', '& svg': { fontSize: 20 } }}>
            {icon}
          </Box>
        )}

        <Typography variant="h3" component="h1" noWrap sx={{ minWidth: 0 }}>
          {title}
        </Typography>

        {typeof count === 'number' && (
          <Typography
            variant="caption"
            component="span"
            sx={{
              px: 0.75,
              py: '1px',
              borderRadius: '999px',
              backgroundColor: 'action.selected',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {count}
          </Typography>
        )}

        {titleAdornment}

        {actions && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>
        )}
      </Box>

      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 720 }}>
          {description}
        </Typography>
      )}

      {tabs && (
        <Box sx={{ mt: 1.5 }}>
          <ViewTabs {...tabs} />
        </Box>
      )}

      {children && <Box sx={{ mt: 1.5, pb: 1.5 }}>{children}</Box>}
    </Box>
  );
}

export default PageHeader;
