import React from 'react';
import { Box } from '@mui/material';
import { InboxOutlined as IntakeIcon } from '@mui/icons-material';
import { isSystemWorkspace, resolveWorkspaceUi } from './workspacePicker.helpers.js';

/**
 * The coloured square that identifies a workspace (sidebars, pickers, headers): 16px by default, radius
 * 4, the glyph of `ui.icon` (drawn by `renderIcon(iconName, { color, fontSize })`, since the kit ships no
 * icon catalogue) or the initial letter. A system workspace (the intake) keeps the same tile and only
 * swaps the glyph: it belongs to the organization, so it wears the brand colour rather than a grey that
 * would read as something switched off.
 */
function WorkspaceSquare({ workspace, size = 16, radius = 4, renderIcon, sx = {} }) {
  // -----------------------------------------------------
  // 1. Configs / Constants
  // -----------------------------------------------------
  const { color, icon, initial } = resolveWorkspaceUi(workspace);
  const glyphSize = Math.round(size * 0.62);
  const isSystem = isSystemWorkspace(workspace);
  const customGlyph =
    !isSystem && icon && renderIcon
      ? renderIcon(icon, { color: '#ffffff', fontSize: glyphSize })
      : null;

  // -----------------------------------------------------
  // 2. Render
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
        borderRadius: `${radius}px`,
        backgroundColor: isSystem ? 'var(--stos-brand)' : color,
        color: '#ffffff',
        fontSize: Math.max(9, Math.round(size * 0.56)),
        fontWeight: 600,
        lineHeight: 1,
        flexShrink: 0,
        ...sx,
      }}
    >
      {isSystem ? <IntakeIcon style={{ fontSize: glyphSize }} /> : customGlyph || initial}
    </Box>
  );
}

export default WorkspaceSquare;
