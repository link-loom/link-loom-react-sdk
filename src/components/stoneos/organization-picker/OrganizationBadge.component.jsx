import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { VerifiedOutlined as VerifiedIcon } from '@mui/icons-material';
import OrganizationAvatar from './OrganizationAvatar.component.jsx';
import { ORGANIZATION_PICKER_LABELS } from './organizationPicker.helpers.js';

// An organization the way every screen shows it: its mark, its name and, when Veripass verified it, the
// verified seal. `caption` adds a quiet second line (the slug in the picker, "Your organization").
function OrganizationBadge({
  organization,
  size = 20,
  variant = 'body2',
  caption = null,
  strong = false,
  labels,
  sx = {},
}) {
  // -----------------------------------------------------
  // 1. Configs / Constants
  // -----------------------------------------------------
  const resolvedLabels = { ...ORGANIZATION_PICKER_LABELS, ...labels };

  // -----------------------------------------------------
  // 2. Render
  // -----------------------------------------------------
  if (!organization) {
    return null;
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
        maxWidth: '100%',
        ...sx,
      }}
    >
      <OrganizationAvatar organization={organization} size={size} />
      <Box component="span" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}
        >
          <Typography
            component="span"
            variant={variant}
            noWrap
            title={organization.display_name}
            sx={{ minWidth: 0, fontWeight: strong ? 600 : undefined, color: 'inherit' }}
          >
            {organization.display_name || resolvedLabels.unknown}
          </Typography>
          {organization.is_verified && (
            <Tooltip title={resolvedLabels.verified} arrow>
              <VerifiedIcon
                aria-label={resolvedLabels.verified}
                sx={{
                  fontSize: Math.max(13, Math.round(size * 0.7)),
                  color: 'var(--stos-accent)',
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          )}
        </Box>
        {caption && (
          <Typography
            component="span"
            variant="caption"
            noWrap
            title={caption}
            sx={{ color: 'text.tertiary' }}
          >
            {caption}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default OrganizationBadge;
