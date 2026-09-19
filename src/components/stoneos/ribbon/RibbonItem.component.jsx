import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  ButtonGroup,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Select,
  Tooltip,
} from '@mui/material';
import { FormatColorResetOutlined, KeyboardArrowDownOutlined } from '@mui/icons-material';
import ShortcutKeys from '../shortcut-keys/ShortcutKeys.component.jsx';
import { STOS_CARD_COLORS } from '../theme/stoneos.constants.js';

export const RibbonContext = React.createContext({
  inOverlay: false,
  onAfterAction: () => {},
  labels: {},
});

const STOS_NEUTRAL_SWATCHES = ['#1b2233', '#515d72', '#737f94', '#b3bac7', '#e4e8ef', '#ffffff'];
const RIBBON_SWATCHES = [...STOS_NEUTRAL_SWATCHES, ...Object.values(STOS_CARD_COLORS)];

const itemTitle = (item) => item.tooltip || item.label;

function ItemTooltip({ item, children }) {
  const title = itemTitle(item);

  if (!title && !item.shortcut) {
    return children;
  }

  return (
    <Tooltip
      title={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <span>{title}</span>
          {item.shortcut && <ShortcutKeys combo={item.shortcut} />}
        </Box>
      }
    >
      <Box component="span" sx={{ display: 'inline-flex' }}>
        {children}
      </Box>
    </Tooltip>
  );
}

const baseButtonSx = (active) => ({
  borderRadius: 1,
  color: active ? 'primary.main' : 'text.primary',
  backgroundColor: active ? 'var(--stos-bg-selected)' : 'transparent',
  transition: 'background-color 120ms ease-in-out, color 120ms ease-in-out',
  '&:hover': { backgroundColor: active ? 'var(--stos-bg-selected)' : 'action.hover' },
  '&.Mui-disabled': { color: 'text.disabled' },
  '&.Mui-focusVisible': { outline: '2px solid var(--stos-brand-edge)', outlineOffset: -2 },
});

const largeSx = (active) => ({
  ...baseButtonSx(active),
  flexDirection: 'column',
  justifyContent: 'flex-start',
  gap: 0.5,
  minWidth: 48,
  maxWidth: 84,
  height: 64,
  px: 0.75,
  pt: 0.75,
  '& svg': { fontSize: 20 },
});

const smallSx = (active, hasLabel) => ({
  ...baseButtonSx(active),
  justifyContent: 'flex-start',
  gap: 0.75,
  height: 28,
  minWidth: 28,
  px: hasLabel ? 0.75 : 0.5,
  '& svg': { fontSize: 16 },
});

const largeLabelSx = {
  fontSize: 12,
  lineHeight: 1.2,
  textAlign: 'center',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const smallLabelSx = { fontSize: 12, lineHeight: 1, whiteSpace: 'nowrap' };

const showsSmallLabel = (item) => Boolean(item.label) && (!item.icon || item.showLabel === true);

function ButtonFace({ item, size }) {
  if (size === 'large') {
    return (
      <>
        {item.icon}
        {item.label && (
          <Box component="span" sx={largeLabelSx}>
            {item.label}
          </Box>
        )}
      </>
    );
  }

  return (
    <>
      {item.icon}
      {showsSmallLabel(item) && (
        <Box component="span" sx={smallLabelSx}>
          {item.label}
        </Box>
      )}
    </>
  );
}

function PlainButton({ item, size }) {
  const { onAfterAction } = useContext(RibbonContext);
  const isToggle = item.type === 'toggle';
  const active = isToggle && Boolean(item.active);

  const onClick = (event) => {
    item.onClick?.(event);
    onAfterAction();
  };

  return (
    <ItemTooltip item={item}>
      <ButtonBase
        disabled={item.disabled}
        onClick={onClick}
        aria-label={item.label || item.tooltip}
        aria-pressed={isToggle ? active : undefined}
        sx={size === 'large' ? largeSx(active) : smallSx(active, showsSmallLabel(item))}
      >
        <ButtonFace item={item} size={size} />
      </ButtonBase>
    </ItemTooltip>
  );
}

function OptionsMenu({ anchorEl, options = [], onClose, onPick }) {
  const { inOverlay } = useContext(RibbonContext);

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      disablePortal={inOverlay}
      disableScrollLock
    >
      {options.map((option) => (
        <MenuItem
          key={option.id}
          disabled={option.disabled}
          selected={Boolean(option.active)}
          onClick={() => onPick(option)}
        >
          {option.icon && <ListItemIcon>{option.icon}</ListItemIcon>}
          <ListItemText>{option.label}</ListItemText>
          {option.shortcut && <ShortcutKeys combo={option.shortcut} sx={{ ml: 2 }} />}
        </MenuItem>
      ))}
    </Menu>
  );
}

const buttonGroupSx = {
  '& .MuiButtonGroup-grouped': { minWidth: 0, borderColor: 'transparent !important' },
};

const groupButtonSx = {
  minHeight: 0,
  minWidth: 0,
  border: 0,
  p: 0,
  borderRadius: 1,
  color: 'text.primary',
  '&:hover': { border: 0, backgroundColor: 'action.hover' },
  '& svg': { fontSize: 16 },
};

function SplitButton({ item, size }) {
  const { onAfterAction, labels } = useContext(RibbonContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const isLarge = size === 'large';

  const onMain = (event) => {
    item.onClick?.(event);
    onAfterAction();
  };

  const onPick = (option) => {
    setAnchorEl(null);
    option.onClick?.();
    item.onChange?.(option.value ?? option.id);
    onAfterAction();
  };

  return (
    <>
      <ItemTooltip item={item}>
        <ButtonGroup
          variant="text"
          orientation={isLarge ? 'vertical' : 'horizontal'}
          disabled={item.disabled}
          sx={buttonGroupSx}
        >
          <Button
            onClick={onMain}
            aria-label={item.label || item.tooltip}
            sx={{
              ...groupButtonSx,
              ...(isLarge
                ? { height: 40, width: '100%', pt: 0.5, '& svg': { fontSize: 20 } }
                : { height: 28, px: showsSmallLabel(item) ? 0.75 : 0.5, gap: 0.75 }),
            }}
          >
            {isLarge ? item.icon : <ButtonFace item={item} size="small" />}
          </Button>
          <Button
            onClick={(event) => setAnchorEl(event.currentTarget)}
            aria-label={labels.moreOptions}
            aria-haspopup="menu"
            aria-expanded={anchorEl ? 'true' : undefined}
            sx={{
              ...groupButtonSx,
              ...(isLarge
                ? { flexDirection: 'column', height: 28, minWidth: 48, maxWidth: 84, px: 0.5 }
                : { height: 28, width: 16 }),
            }}
          >
            {isLarge && item.label && (
              <Box component="span" sx={{ ...largeLabelSx, WebkitLineClamp: 1 }}>
                {item.label}
              </Box>
            )}
            <KeyboardArrowDownOutlined sx={{ fontSize: '14px !important' }} />
          </Button>
        </ButtonGroup>
      </ItemTooltip>
      <OptionsMenu
        anchorEl={anchorEl}
        options={item.options}
        onClose={() => setAnchorEl(null)}
        onPick={onPick}
      />
    </>
  );
}

function SelectItem({ item }) {
  const { inOverlay, onAfterAction } = useContext(RibbonContext);

  return (
    <ItemTooltip item={item}>
      <Select
        size="small"
        value={item.value ?? ''}
        disabled={item.disabled}
        displayEmpty
        inputProps={{ 'aria-label': item.label || item.tooltip }}
        onChange={(event) => {
          item.onChange?.(event.target.value);
          onAfterAction();
        }}
        MenuProps={{ disablePortal: inOverlay, disableScrollLock: true }}
        sx={{
          width: item.width || 120,
          height: 28,
          fontSize: 12,
          '& .MuiSelect-select': { py: '4px', pl: 1, fontSize: 12 },
          '& .MuiSvgIcon-root': { fontSize: 16 },
        }}
      >
        {(item.options || []).map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ fontSize: 12 }}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </ItemTooltip>
  );
}

function ColorItem({ item, size }) {
  const { inOverlay, onAfterAction, labels } = useContext(RibbonContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const current = item.value || 'var(--stos-text-primary)';
  const isLarge = size === 'large';

  const apply = (color) => {
    setAnchorEl(null);
    item.onChange?.(color);
    onAfterAction();
  };

  // With `noneLabel` the control is a toggle: the main button applies the shown colour, or clears it
  // when the selection already carries one (`active`), and the menu offers the same "no colour" entry.
  const onMain = (event) => {
    if (item.onClick) {
      item.onClick(event);
      onAfterAction();
      return;
    }
    apply(item.noneLabel && item.active ? null : item.value);
  };

  return (
    <>
      <ItemTooltip item={item}>
        <ButtonGroup variant="text" disabled={item.disabled} sx={buttonGroupSx}>
          <Button
            onClick={onMain}
            aria-label={item.label || item.tooltip}
            aria-pressed={item.noneLabel ? Boolean(item.active) : undefined}
            sx={{
              ...groupButtonSx,
              flexDirection: 'column',
              gap: '2px',
              height: isLarge ? 64 : 28,
              px: 0.5,
              ...(item.active && { color: 'primary.main', backgroundColor: 'var(--stos-bg-selected)' }),
              '& svg': { fontSize: isLarge ? 20 : 16 },
            }}
          >
            {item.icon}
            <Box
              component="span"
              sx={{ width: isLarge ? 20 : 16, height: 3, borderRadius: '1px', backgroundColor: current }}
            />
          </Button>
          <Button
            onClick={(event) => setAnchorEl(event.currentTarget)}
            aria-label={labels.moreOptions}
            aria-haspopup="dialog"
            sx={{ ...groupButtonSx, height: isLarge ? 64 : 28, width: 16 }}
          >
            <KeyboardArrowDownOutlined sx={{ fontSize: '14px !important' }} />
          </Button>
        </ButtonGroup>
      </ItemTooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        disablePortal={inOverlay}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1, width: 188 }}>
          {item.noneLabel && (
            <Box
              component="button"
              type="button"
              data-color-none=""
              onClick={() => apply(null)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                mb: 1,
                px: 0.5,
                py: 0.5,
                border: 0,
                borderRadius: 1,
                fontSize: 12,
                color: 'text.secondary',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <FormatColorResetOutlined sx={{ fontSize: 16 }} />
              {item.noneLabel}
            </Box>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 20px)', gap: '6px' }}>
            {(item.options || RIBBON_SWATCHES).map((color) => (
              <Box
                key={color}
                component="button"
                type="button"
                aria-label={color}
                onClick={() => apply(color)}
                sx={{
                  width: 20,
                  height: 20,
                  p: 0,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: color,
                  border: 1,
                  borderColor: item.value === color ? 'primary.main' : 'divider',
                  boxShadow: item.value === color ? '0 0 0 1px var(--stos-brand)' : 'none',
                }}
              />
            ))}
          </Box>
          <Box
            component="label"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 1,
              pt: 1,
              borderTop: 1,
              borderColor: 'divider',
              fontSize: 12,
              color: 'text.secondary',
              cursor: 'pointer',
            }}
          >
            {labels.customColor}
            <Box
              component="input"
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(item.value || '') ? item.value : '#3c4876'}
              onChange={(event) => apply(event.target.value)}
              sx={{ width: 28, height: 20, p: 0, border: 0, background: 'transparent', cursor: 'pointer' }}
            />
          </Box>
        </Box>
      </Popover>
    </>
  );
}

function RibbonItem({ item, size }) {
  const { onAfterAction } = useContext(RibbonContext);
  const resolvedSize = size || item.size || 'small';

  if (item.type === 'custom') {
    return item.render ? item.render({ close: onAfterAction }) : null;
  }
  if (item.type === 'split') {
    return <SplitButton item={item} size={resolvedSize} />;
  }
  if (item.type === 'select') {
    return <SelectItem item={item} />;
  }
  if (item.type === 'color') {
    return <ColorItem item={item} size={resolvedSize} />;
  }
  return <PlainButton item={item} size={resolvedSize} />;
}

export default RibbonItem;
