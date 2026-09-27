import React from 'react';
import { Box } from '@mui/material';
import { pulseGlyphOf } from '../pulse.glyphs.js';

// The kind of change, as a small tinted mark. `ring` separates it from an avatar it sits on. The tint
// mixes over the surface, so the mark reads the same on the light and the dark theme.
function PulseGlyph({ entry, glyphOf = pulseGlyphOf, size = 16, ring = false, sx = {} }) {
  const { Icon, color } = glyphOf(entry) || pulseGlyphOf(entry);

  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, var(--stos-bg-surface))`,
        boxShadow: ring ? '0 0 0 2px var(--stos-bg-surface)' : 'none',
        ...sx,
      }}
    >
      <Icon sx={{ fontSize: Math.round(size * 0.68) }} />
    </Box>
  );
}

export default PulseGlyph;
