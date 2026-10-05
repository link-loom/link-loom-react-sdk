import React from 'react';
import { Link } from 'react-router-dom';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ArrowBackOutlined } from '@mui/icons-material';

/**
 * 44px app chrome: back button · breadcrumb · sync indicator slot · right slot.
 * breadcrumb: [{ id, label, to, onClick }] — the last item is the current page; `breadcrumbLabel` names it for
 * assistive technology (in the app's language).
 */
function AppTopBar({
  breadcrumb = [],
  onBack,
  backLabel = 'Back',
  breadcrumbLabel = 'Breadcrumb',
  leading,
  syncIndicator,
  right,
  sticky = false,
  sx = {},
}) {
  const crumbs = breadcrumb.filter((crumb) => crumb?.label);

  return (
    <Box
      component="header"
      sx={{
        position: sticky ? 'sticky' : 'static',
        top: 0,
        zIndex: sticky ? 5 : 'auto',
        flexShrink: 0,
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        ...sx,
      }}
    >
      {onBack && (
        <Tooltip title={backLabel}>
          <IconButton size="small" onClick={onBack} aria-label={backLabel}>
            <ArrowBackOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      {leading}

      <Box
        component="nav"
        aria-label={breadcrumbLabel}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: '0 1 auto' }}
      >
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const interactive = !isLast && (crumb.to || crumb.onClick);
          return (
            <React.Fragment key={crumb.id || `${crumb.label}-${index}`}>
              <Typography
                variant="body2"
                component={interactive && crumb.to ? Link : interactive ? 'button' : 'span'}
                to={interactive ? crumb.to : undefined}
                type={interactive && !crumb.to ? 'button' : undefined}
                onClick={interactive ? crumb.onClick : undefined}
                aria-current={isLast ? 'page' : undefined}
                noWrap
                sx={{
                  minWidth: 0,
                  border: 0,
                  p: 0,
                  background: 'transparent',
                  fontFamily: 'inherit',
                  textDecoration: 'none',
                  color: isLast ? 'text.primary' : 'text.tertiary',
                  fontWeight: isLast ? 500 : 400,
                  cursor: interactive ? 'pointer' : 'default',
                  transition: 'color 120ms ease-in-out',
                  '&:hover': interactive ? { color: 'text.primary' } : undefined,
                }}
              >
                {crumb.label}
              </Typography>
              {!isLast && (
                <Typography variant="body2" component="span" sx={{ color: 'text.disabled' }}>
                  /
                </Typography>
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {syncIndicator && <Box sx={{ display: 'inline-flex', flexShrink: 0 }}>{syncIndicator}</Box>}

      {right && (
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {right}
        </Box>
      )}
    </Box>
  );
}

export default AppTopBar;
