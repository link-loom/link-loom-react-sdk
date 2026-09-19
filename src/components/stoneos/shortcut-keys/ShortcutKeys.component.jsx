import React from 'react';
import { Box } from '@mui/material';

const MAC_SYMBOLS = {
  mod: '⌘',
  cmd: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  control: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
};

const PC_NAMES = {
  mod: 'Ctrl',
  cmd: 'Ctrl',
  meta: 'Win',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
};

const KEY_NAMES = {
  enter: '↵',
  return: '↵',
  escape: 'Esc',
  esc: 'Esc',
  backspace: '⌫',
  delete: 'Del',
  tab: 'Tab',
  space: 'Space',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
};

export const isApplePlatform = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(String(platform));
};

// "mod+shift+k" → "⌘⇧K" on Apple platforms, "Ctrl+Shift+K" elsewhere.
export const formatShortcut = (combo, apple = isApplePlatform()) => {
  if (!combo) {
    return '';
  }

  const parts = String(combo)
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      const modifier = apple ? MAC_SYMBOLS[lower] : PC_NAMES[lower];
      if (modifier) {
        return modifier;
      }
      return KEY_NAMES[lower] || (part.length === 1 ? part.toUpperCase() : part);
    });

  return parts.join(apple ? '' : '+');
};

// One continuous <kbd> per combo. `combo` may be a string or an array of alternative combos.
function ShortcutKeys({ combo, sx = {} }) {
  const combos = (Array.isArray(combo) ? combo : [combo]).filter(Boolean);

  if (!combos.length) {
    return null;
  }

  const apple = isApplePlatform();

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {combos.map((item) => (
        <Box
          key={item}
          component="kbd"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 18,
            px: '5px',
            borderRadius: '4px',
            fontFamily: 'var(--stos-font-ui, inherit)',
            fontSize: '11.5px',
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            color: 'var(--stos-kbd-text, #111827)',
            backgroundColor: 'var(--stos-kbd-bg, #F3F4F6)',
            ...sx,
          }}
        >
          {formatShortcut(item, apple)}
        </Box>
      ))}
    </Box>
  );
}

export default ShortcutKeys;
