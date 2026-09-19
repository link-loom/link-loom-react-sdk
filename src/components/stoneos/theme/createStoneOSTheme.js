import { createTheme, alpha, lighten, darken } from '@mui/material/styles';
import { STOS_COLORS, STOS_DARK_COLORS } from './stoneos.constants.js';

const FONT_UI = "var(--stos-font-ui, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif)";
const FONT_DISPLAY = 'var(--stos-font-display, var(--stos-font-ui))';

// Apps render inside hosts that already float overlays (Command Center, launcher); app overlays stack above them.
const OVERLAY_Z_INDEX = { appBar: 1100, drawer: 9000, modal: 9000, snackbar: 9000, tooltip: 9100 };

const parseAddition = (input) => {
  if (!Number.isNaN(Number(input))) {
    return Number(input);
  }
  const numbers = String(input).match(/\d*\.?\d+/g);
  if (!numbers) {
    return 0;
  }
  return numbers.reduce((sum, value) => sum + Number(value), 0);
};

const coefficientToPercentage = (coefficient) =>
  typeof coefficient === 'string' ? `calc(${coefficient} * 100%)` : `${coefficient * 100}%`;

// MUI v7 bundles (e.g. @link-loom/cloud-sdk) call theme.alpha/lighten/darken; a v6 theme has none.
const attachColorManipulators = (theme) =>
  Object.assign(theme, {
    alpha(color, coefficient) {
      const target = this || theme;
      if (target.colorSpace) {
        const amount = typeof coefficient === 'string' ? `calc(${coefficient})` : coefficient;
        return `oklch(from ${color} l c h / ${amount})`;
      }
      if (target.vars) {
        const channel = color.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, 'var(--$1Channel)');
        const amount = typeof coefficient === 'string' ? `calc(${coefficient})` : coefficient;
        return `rgba(${channel} / ${amount})`;
      }
      return alpha(color, parseAddition(coefficient));
    },
    lighten(color, coefficient) {
      const target = this || theme;
      if (target.colorSpace) {
        return `color-mix(in ${target.colorSpace}, ${color}, #fff ${coefficientToPercentage(coefficient)})`;
      }
      return lighten(color, coefficient);
    },
    darken(color, coefficient) {
      const target = this || theme;
      if (target.colorSpace) {
        return `color-mix(in ${target.colorSpace}, ${color}, #000 ${coefficientToPercentage(coefficient)})`;
      }
      return darken(color, coefficient);
    },
  });

export default function createStoneOSTheme({ mode = 'light' } = {}) {
  const isDark = mode === 'dark';
  const colors = isDark ? STOS_DARK_COLORS : STOS_COLORS;
  const border = colors.border;
  const themeMode = isDark ? 'dark' : 'light';

  // Portaled surfaces live outside `.stos-app`, so they carry the token scope themselves —
  // tokens, ink and typeface all hang off `[data-stos-theme]` in tokens.css. Every component
  // that mounts through a React portal has to be listed here; one that is missing renders with
  // the host page's typography and silently ignores dark mode, which is exactly how the storage
  // share dialog ended up in the host's typeface (it mounts through `PopUp`, i.e. MuiModal).
  const portalScope = { 'data-stos-theme': themeMode };

  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: colors.brandPrimary,
        dark: colors.brandPrimaryDark,
        contrastText: isDark ? colors.textInverse : '#ffffff',
      },
      secondary: { main: colors.secondary, contrastText: '#101828' },
      success: { main: colors.success },
      warning: { main: colors.warning },
      error: { main: colors.error },
      info: { main: colors.info },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
        tertiary: colors.textTertiary,
        disabled: colors.textDisabled,
      },
      background: { default: colors.bgPage, paper: colors.bgSurface },
      divider: border,
      action: {
        hover: colors.bgHover,
        selected: colors.bgSelected,
        hoverOpacity: 0.04,
      },
    },
    shape: { borderRadius: 6 },
    zIndex: OVERLAY_Z_INDEX,
    typography: {
      htmlFontSize: 16,
      fontSize: 13,
      fontFamily: FONT_UI,
      fontWeightLight: 400,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: { fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 600, lineHeight: 1.2 },
      h2: { fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, lineHeight: 1.25 },
      h3: { fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
      h4: { fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, lineHeight: 1.35 },
      h5: { fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
      h6: { fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, lineHeight: 1.4 },
      subtitle1: { fontSize: 13, fontWeight: 500, lineHeight: 1.45 },
      subtitle2: { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },
      body1: { fontSize: 13, fontWeight: 400, lineHeight: 1.5 },
      body2: { fontSize: 12, fontWeight: 400, lineHeight: 1.45 },
      caption: { fontSize: 11, fontWeight: 400, lineHeight: 1.35 },
      overline: {
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      },
      button: { fontSize: 13, fontWeight: 500, lineHeight: 1.2, textTransform: 'none' },
    },
    components: {
      MuiTypography: {
        defaultProps: {
          variantMapping: { subtitle1: 'p', subtitle2: 'p', overline: 'span' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true, size: 'small' },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 13,
            minHeight: 32,
            borderRadius: 6,
            padding: '5px 12px',
            '& .MuiButton-startIcon > svg, & .MuiButton-endIcon > svg': { fontSize: 16 },
          },
          containedPrimary: {
            backgroundColor: colors.brandPrimary,
            '&:hover': { backgroundColor: colors.brandPrimaryDark },
          },
          outlined: { borderColor: border, color: colors.textSecondary },
          text: { color: colors.textSecondary },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 6, color: colors.textTertiary },
          sizeSmall: { padding: 4, '& svg': { fontSize: 18 } },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, borderRadius: 999 },
          sizeSmall: { height: 22, fontSize: 12 },
          label: { paddingLeft: 8, paddingRight: 8 },
          outlined: { borderColor: border },
          filledDefault: { backgroundColor: colors.bgMuted, color: colors.textSecondary },
          clickable: { '&.MuiChip-colorDefault:hover': { backgroundColor: colors.bgHover } },
          deleteIcon: { fontSize: 14 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 36 },
          indicator: { height: 2, borderRadius: 1 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 500,
            minHeight: 36,
            minWidth: 0,
            padding: '6px 12px',
            color: colors.textSecondary,
            '&.Mui-selected': { color: colors.textPrimary },
            '& svg': { fontSize: 16 },
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: false, enterDelay: 400 },
        styleOverrides: {
          tooltip: {
            fontSize: 12,
            backgroundColor: isDark ? colors.bgSelected : colors.textPrimary,
            color: isDark ? colors.textPrimary : '#ffffff',
            borderRadius: 4,
            padding: '4px 8px',
          },
        },
      },
      MuiMenu: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${border}`,
            boxShadow: colors.shadowMd,
            paddingTop: 4,
            paddingBottom: 4,
          },
        },
      },
      MuiPopover: {
        defaultProps: { elevation: 0, ...portalScope },
        styleOverrides: {
          paper: { borderRadius: 8, border: `1px solid ${border}`, boxShadow: colors.shadowMd },
        },
      },
      MuiPopper: { defaultProps: portalScope },
      MuiDialog: { defaultProps: portalScope },
      MuiDrawer: { defaultProps: portalScope },
      // Modal is the base every dialog-shaped portal mounts through, and the one surface the kit
      // exposes directly (`PopUp`), which renders a bare Box rather than a Paper.
      MuiModal: { defaultProps: portalScope },
      MuiSnackbar: { defaultProps: portalScope },
      // A Tooltip's visible surface lives in its popper, not on the element it wraps.
      MuiTooltip: { defaultProps: { slotProps: { popper: portalScope } } },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13,
            minHeight: 32,
            borderRadius: 4,
            marginLeft: 4,
            marginRight: 4,
            gap: 8,
            '& .MuiListItemIcon-root': { minWidth: 26, '& svg': { fontSize: 18 } },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: 13,
            borderRadius: 6,
            backgroundColor: colors.bgSurface,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderStrong },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
              borderColor: colors.brandPrimary,
            },
            '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
          },
          notchedOutline: { borderColor: border, transition: 'border-color 120ms ease-in-out' },
          input: { paddingTop: 7, paddingBottom: 7 },
        },
      },
      MuiAutocomplete: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          inputRoot: { paddingTop: 2, paddingBottom: 2 },
          option: { fontSize: 13, minHeight: 32 },
          paper: { border: `1px solid ${border}` },
        },
      },
      MuiSelect: { defaultProps: { size: 'small' } },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiPickersOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: 13,
            borderRadius: 6,
            backgroundColor: colors.bgSurface,
            '&:hover .MuiPickersOutlinedInput-notchedOutline': { borderColor: colors.borderStrong },
            '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
              borderWidth: 1,
              borderColor: colors.brandPrimary,
            },
          },
          notchedOutline: { borderColor: border },
        },
      },
      MuiPickersSectionList: { styleOverrides: { root: { fontSize: 13 } } },
      MuiInputLabel: { styleOverrides: { root: { fontSize: 13 } } },
      MuiFormHelperText: {
        styleOverrides: { root: { fontSize: 11, marginLeft: 0, marginRight: 0 } },
      },
      MuiAvatar: { styleOverrides: { root: { fontSize: 11, fontWeight: 600 } } },
      MuiCheckbox: { styleOverrides: { root: { padding: 4, '& svg': { fontSize: 18 } } } },
      MuiSvgIcon: { styleOverrides: { fontSizeSmall: { fontSize: 18 } } },
      MuiSkeleton: { styleOverrides: { root: { borderRadius: 4 } } },
      MuiListItemText: {
        styleOverrides: { primary: { fontSize: 13 }, secondary: { fontSize: 12 } },
      },
      MuiBreadcrumbs: { styleOverrides: { root: { fontSize: 12 } } },
      MuiTablePagination: {
        styleOverrides: {
          root: { fontSize: 12, color: colors.textSecondary },
          toolbar: { minHeight: 44 },
          selectLabel: { fontSize: 12, marginBottom: 0 },
          displayedRows: { fontSize: 12, marginBottom: 0 },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiDivider: { styleOverrides: { root: { borderColor: border } } },
    },
  });

  return attachColorManipulators(theme);
}
