import React, { useState } from 'react';
import { Box } from '@mui/material';

// An organization's mark: its logo when the directory has one, its initial on a neutral tile when it
// does not. Neutral on purpose: the coloured squares are workspaces, and an organization must never be
// mistaken for one.
function OrganizationAvatar({ organization, size = 20, sx = {} }) {
  // -----------------------------------------------------
  // 1. UI States
  // -----------------------------------------------------
  const [hasImageFailed, setHasImageFailed] = useState(false);

  // -----------------------------------------------------
  // 2. Configs / Constants
  // -----------------------------------------------------
  const name = String(organization?.display_name || organization?.slug || '?').trim();
  const initial = name.charAt(0).toUpperCase() || '?';
  const showsLogo = Boolean(organization?.logo_url) && !hasImageFailed;

  // -----------------------------------------------------
  // 3. Render
  // -----------------------------------------------------
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: `${Math.max(4, Math.round(size * 0.25))}px`,
        border: 1,
        borderColor: 'divider',
        backgroundColor: showsLogo ? 'background.paper' : 'var(--stos-bg-muted)',
        color: 'text.secondary',
        fontSize: Math.max(9, Math.round(size * 0.5)),
        fontWeight: 600,
        lineHeight: 1,
        ...sx,
      }}
    >
      {showsLogo ? (
        <Box
          component="img"
          src={organization.logo_url}
          alt=""
          onError={() => setHasImageFailed(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        initial
      )}
    </Box>
  );
}

export default OrganizationAvatar;
