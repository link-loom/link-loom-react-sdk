import React from 'react';
import { Avatar, Box, Tooltip } from '@mui/material';
import { colorFromString } from '../theme/stoneos.constants.js';
import EmptyValue from '../empty-value/EmptyValue.component.jsx';

const SURFACE_RING = '2px solid var(--stos-bg-surface, #ffffff)';

const initialsOf = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

// Stacked avatars. `people: [{ name, identity, avatarUrl }]`. Nobody → the dashed ghost avatar.
function AssigneeAvatars({
  people = [],
  max = 3,
  size = 24,
  showName = false,
  interactive = false,
  onAdd,
  emptyLabel,
  peopleLabel = (count) => `${count} people`,
  sx = {},
}) {
  const list = (Array.isArray(people) ? people : [people]).filter(
    (person) => person && (person.name || person.identity),
  );

  if (!list.length) {
    return (
      <EmptyValue
        kind="assignee"
        label={emptyLabel}
        interactive={interactive}
        onClick={onAdd}
        showLabel={showName}
        size={size <= 20 ? 'sm' : 'md'}
      />
    );
  }

  const visible = list.slice(0, max);
  const overflow = list.length - visible.length;

  return (
    <Box
      component="span"
      onClick={interactive ? onAdd : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showName ? 0.75 : 0,
        cursor: interactive ? 'pointer' : 'default',
        borderRadius: 1,
        '&:hover': interactive ? { backgroundColor: 'action.hover' } : undefined,
        ...sx,
      }}
    >
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {visible.map((person, index) => (
          <Tooltip key={person.identity || person.name || index} title={person.name || person.identity}>
            <Avatar
              src={person.avatarUrl || undefined}
              alt={person.name || ''}
              sx={{
                width: size,
                height: size,
                fontSize: Math.max(9, Math.round(size * 0.42)),
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: colorFromString(person.identity || person.name),
                border: SURFACE_RING,
                marginLeft: index === 0 ? 0 : `-${Math.round(size * 0.28)}px`,
                zIndex: visible.length - index,
              }}
            >
              {initialsOf(person.name || person.identity)}
            </Avatar>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <Avatar
            sx={{
              width: size,
              height: size,
              fontSize: Math.max(9, Math.round(size * 0.4)),
              fontWeight: 600,
              backgroundColor: 'action.selected',
              color: 'text.secondary',
              border: SURFACE_RING,
              marginLeft: `-${Math.round(size * 0.28)}px`,
            }}
          >
            +{overflow}
          </Avatar>
        )}
      </Box>

      {showName && (
        <Box
          component="span"
          sx={{
            fontSize: 12,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {visible.length === 1 ? visible[0].name || visible[0].identity : peopleLabel(list.length)}
        </Box>
      )}
    </Box>
  );
}

export default AssigneeAvatars;
