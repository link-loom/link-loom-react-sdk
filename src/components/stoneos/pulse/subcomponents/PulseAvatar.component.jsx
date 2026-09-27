import React from 'react';
import { Avatar } from '@mui/material';
import { PersonOutlined as UnknownPersonIcon } from '@mui/icons-material';
import { colorFromString } from '../../theme/stoneos.constants.js';

const initialsOf = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

// One person in the history: initials on their colour, or a quiet outline when the line never learned who it was.
function PulseAvatar({ name, identity, avatarUrl, size = 28, sx = {} }) {
  if (!name) {
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          backgroundColor: 'var(--stos-bg-muted)',
          color: 'text.tertiary',
          border: 1,
          borderColor: 'divider',
          ...sx,
        }}
      >
        <UnknownPersonIcon sx={{ fontSize: Math.round(size * 0.6) }} />
      </Avatar>
    );
  }

  return (
    <Avatar
      src={avatarUrl || undefined}
      alt={name}
      sx={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.4)),
        fontWeight: 600,
        color: '#ffffff',
        backgroundColor: colorFromString(identity || name),
        ...sx,
      }}
    >
      {initialsOf(name)}
    </Avatar>
  );
}

export default PulseAvatar;
