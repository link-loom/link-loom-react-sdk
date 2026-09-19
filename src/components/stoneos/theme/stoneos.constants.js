export const STOS_COLORS = {
  brandPrimary: '#3c4876',
  brandPrimaryDark: '#2f3a5f',
  brandTint: 'color-mix(in srgb, #3c4876 10%, white)',
  accent: '#37b6e0',
  accentTint: 'color-mix(in srgb, #37b6e0 14%, white)',
  secondary: '#54c5eb',
  success: '#2fb673',
  successDark: '#25915c',
  error: '#e5484d',
  errorDark: '#b8383c',
  warning: '#ffb020',
  warningDark: '#cc8d1a',
  info: '#37b6e0',
  purple: '#8b5cf6',

  textPrimary: '#1b2233',
  textSecondary: '#515d72',
  // Light tertiary measured 3.4-4.0:1 at 11px on the tinted bubble and hover-row surfaces, so it
  // only ever passed on flat white. Darkened to clear 4.5:1 across those surfaces too.
  textTertiary: '#596378',
  textDisabled: '#b3bac7',
  textInverse: '#ffffff',

  bgPage: '#eff3f9',
  bgSurface: '#ffffff',
  bgMuted: '#f2f4f8',
  bgHover: '#f2f4f8',
  bgSelected: '#eceff5',
  border: '#e4e8ef',
  borderStrong: '#d3d9e3',

  shadowMd: '0 8px 24px -8px rgba(19, 19, 22, 0.16), 0 2px 6px -2px rgba(19, 19, 22, 0.06)',
};

export const STOS_DARK_COLORS = {
  ...STOS_COLORS,
  brandPrimary: '#8b9bd6',
  brandPrimaryDark: '#a3b0e0',
  brandTint: 'color-mix(in srgb, #8b9bd6 14%, #161b27)',
  accent: '#4fc3ea',
  accentTint: 'color-mix(in srgb, #4fc3ea 16%, #161b27)',
  secondary: '#6fd0f0',
  success: '#3cc985',
  successDark: '#2fb673',
  error: '#f0676b',
  errorDark: '#e5484d',
  warning: '#ffbe45',
  warningDark: '#ffb020',
  info: '#4fc3ea',
  purple: '#a07cf8',

  textPrimary: '#e7ebf3',
  textSecondary: '#aab3c5',
  // Dark tertiary and disabled were set for looks, not for contrast: at 11-12px they measured
  // 4.0-4.1:1 and 2.7:1 on the dark surfaces, under AA. Lifted to clear 4.5:1 against bg-page,
  // bg-surface and bg-muted. Keep CSS tokens in tokens.css in step with these.
  textTertiary: '#96a1b6',
  textDisabled: '#828da3',
  textInverse: '#11151f',

  bgPage: '#11151f',
  bgSurface: '#161b27',
  bgMuted: '#1d2330',
  bgHover: '#1d2330',
  bgSelected: '#232a3a',
  border: '#2a3142',
  borderStrong: '#353d51',

  shadowMd: '0 8px 24px -8px rgba(0, 0, 0, 0.6), 0 2px 6px -2px rgba(0, 0, 0, 0.4)',
};

export const STOS_STATE_COLORS = {
  new: '#8a94a6',
  ready: '#4f8df5',
  in_progress: '#37b6e0',
  waiting: '#ffb020',
  blocked: '#e5484d',
  review: '#8b5cf6',
  completed: '#2fb673',
  cancelled: '#9a9da3',
};

export const STOS_PRIORITY_COLORS = {
  low: '#8a94a6',
  medium: '#4f8df5',
  high: '#ffb020',
  critical: '#e5484d',
};

export const STOS_CARD_COLORS = {
  indigo: '#3c4876',
  cyan: '#37b6e0',
  coral: '#f0655c',
  green: '#2fb673',
  amber: '#ffb020',
  purple: '#8b5cf6',
  blue: '#4f8df5',
  pink: '#ef5ba1',
};

export const colorFromString = (input = '') => {
  const palette = Object.values(STOS_CARD_COLORS);
  let hash = 0;
  for (let index = 0; index < String(input).length; index += 1) {
    hash = (hash * 31 + String(input).charCodeAt(index)) >>> 0;
  }
  return palette[hash % palette.length];
};

// The pill recipe: the colour at 14% over the surface, text in the colour itself.
export const tintStyles = (colorOrKey) => {
  const color = STOS_STATE_COLORS[colorOrKey] || colorOrKey || STOS_COLORS.textTertiary;

  return {
    color,
    backgroundColor: `color-mix(in srgb, ${color} 14%, var(--stos-bg-surface, white))`,
  };
};

export const STOS_PAGE_WIDTHS = {
  narrow: 1040,
  default: 1280,
  wide: 1440,
  full: 'none',
};

export const STOS_MODAL_SHELL_STYLES = {
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: 'var(--stos-shadow-lg)',
};

export const STOS_MODAL_SHELL_STYLES_WIDE = {
  ...STOS_MODAL_SHELL_STYLES,
  width: 'min(1120px, 94vw)',
};

export const STOS_TOPBAR_HEIGHT = 70;

export const STOS_TABLE_PRESET = 'list';

export const STOS_TABLE_STYLE = {
  header: {
    color: 'var(--stos-text-tertiary, #737f94)',
    bg: 'var(--stos-table-surface, #eff3f9)',
    bottomBorder: 'var(--stos-border, #e4e8ef)',
  },
  cell: { color: 'var(--stos-text-primary, #1b2233)' },
  borders: { rowDivider: 'var(--stos-border, #e4e8ef)' },
  hoverBg: 'var(--stos-bg-hover, #f2f4f8)',
  selectedBg: 'var(--stos-bg-selected, #eceff5)',
};
