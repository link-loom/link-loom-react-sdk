import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatFullTime, formatRowTime, timestampOf } from '../pulse.helpers.js';
import PulseAvatar from './PulseAvatar.component.jsx';
import PulseGlyph from './PulseGlyph.component.jsx';

const GLYPH_OVERHANG = 5;

// One event in the list: who, a one-line summary, when, and the kind of change on the avatar.
function PulseEventRow({ entry, isSelected, onSelect, presentation }) {
  // -----------------------------------------------------
  // 1. Configs / Constants
  // -----------------------------------------------------
  const { labels, locale, timeZone, summarize, glyphOf } = presentation;
  const actorName = entry?.context?.actor_display_name || null;
  const timestamp = timestampOf(entry);

  // -----------------------------------------------------
  // 2. Render
  // -----------------------------------------------------
  return (
    <Box
      role="option"
      id={`pulse-event-${entry.id}`}
      data-event-id={entry.id}
      aria-selected={isSelected}
      onClick={() => onSelect(entry)}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.25,
        py: 1,
        borderRadius: 1.5,
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--stos-bg-selected)' : 'transparent',
        transition: 'background-color var(--stos-motion-fast, 120ms) ease-in-out',
        '&:hover': {
          backgroundColor: isSelected ? 'var(--stos-bg-selected)' : 'var(--stos-bg-hover)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 8,
          bottom: 8,
          width: 2,
          borderRadius: 2,
          backgroundColor: isSelected ? 'var(--stos-brand)' : 'transparent',
        },
      }}
    >
      {/* The glyph hangs 5px off the avatar's corner. The box makes room for it and gives the room back
          with negative margins: the row looks the same and nothing spills out of its container. */}
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          mt: '2px',
          pr: `${GLYPH_OVERHANG}px`,
          pb: `${GLYPH_OVERHANG}px`,
          mr: `-${GLYPH_OVERHANG}px`,
          mb: `-${GLYPH_OVERHANG}px`,
        }}
      >
        <PulseAvatar name={actorName} identity={entry?.actor_identity} size={28} />
        <PulseGlyph
          entry={entry}
          glyphOf={glyphOf}
          size={16}
          ring
          sx={{ position: 'absolute', right: 0, bottom: 0 }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            variant="body1"
            noWrap
            title={actorName || labels.someone}
            sx={{
              flex: 1,
              minWidth: 0,
              fontWeight: 600,
              color: actorName ? 'text.primary' : 'text.secondary',
            }}
          >
            {actorName || labels.someone}
          </Typography>
          <Typography
            component="time"
            variant="caption"
            title={formatFullTime(timestamp, { locale, timeZone })}
            sx={{ flexShrink: 0, color: 'text.tertiary' }}
          >
            {formatRowTime(timestamp, { locale, timeZone })}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          noWrap
          title={summarize(entry)}
          sx={{ color: 'text.secondary' }}
        >
          {summarize(entry)}
        </Typography>
      </Box>
    </Box>
  );
}

export default PulseEventRow;
