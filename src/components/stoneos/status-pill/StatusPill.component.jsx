import React, { useEffect, useMemo, useState } from 'react';
import { Box, ClickAwayListener, InputBase, Paper, Popper, Tooltip, Typography } from '@mui/material';
import { LockOutlined as LockIcon, KeyboardArrowDown as ArrowIcon } from '@mui/icons-material';
import { STOS_COLORS, STOS_STATE_COLORS } from '../theme/stoneos.constants.js';
import {
  STOS_STATE_GROUP_ORDER,
  STOS_STATE_LABELS,
  resolveStatePresentation,
} from '../theme/presentation.js';

const POPPER_MODIFIERS = [{ name: 'preventOverflow', options: { padding: 8 } }];

// Accent- and case-insensitive, so "revision" finds "Revisión".
const fold = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * `tint`: dot + 14% tint, text in the colour. `solid`: colour background, white overline.
 * `interactive` turns it into a searchable picker over `stages`, grouped by normalized state;
 * `canMoveTo(stage)` → `{ allowed, reason }`; `readOnly` shows a lock.
 */
function StatusPill({
  stage,
  status,
  variant = 'tint',
  size = 'md',
  label,
  showDot = true,
  compact = false,
  minWidth,
  interactive = false,
  readOnly = false,
  readOnlyReason,
  stages = [],
  canMoveTo,
  onSelect,
  labels = STOS_STATE_LABELS,
  groupOrder = STOS_STATE_GROUP_ORDER,
  emptyLabel = 'No status',
  searchPlaceholder = 'Search status…',
  noMatchesLabel = 'No status matches.',
  sx = {},
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [query, setQuery] = useState('');
  const presentation = resolveStatePresentation(stage, status, labels);
  const isSolid = variant === 'solid';
  const isSmall = size === 'sm';
  const isMenu = interactive && !readOnly && stages.length > 0;

  const color = presentation?.color || STOS_COLORS.textTertiary;
  const text = label || presentation?.title || emptyLabel;
  const isCompact = compact && !isSolid;

  const pill = (
    <Box
      component={isMenu ? 'button' : 'span'}
      type={isMenu ? 'button' : undefined}
      onClick={
        isMenu
          ? (event) => {
              event.stopPropagation();
              setAnchorEl(event.currentTarget);
            }
          : undefined
      }
      aria-haspopup={isMenu ? 'menu' : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minWidth: isCompact ? undefined : minWidth,
        gap: isCompact ? 0.25 : isSmall ? 0.5 : 0.75,
        height: isSolid ? (isSmall ? 18 : 20) : isSmall ? 20 : 22,
        px: isCompact ? 0.5 : isSmall ? 0.75 : 1,
        borderRadius: 1,
        border: 0,
        fontFamily: 'inherit',
        fontSize: isSolid ? 11 : 12,
        fontWeight: isSolid ? 600 : 500,
        letterSpacing: isSolid ? '0.06em' : 0,
        textTransform: isSolid ? 'uppercase' : 'none',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color: isSolid ? '#ffffff' : color,
        backgroundColor: isSolid
          ? color
          : `color-mix(in srgb, ${color} 14%, var(--stos-bg-surface, white))`,
        cursor: isMenu ? 'pointer' : 'default',
        outline: 'none',
        '&:hover': isMenu ? { boxShadow: `0 0 0 1px ${color}` } : undefined,
        '&:focus-visible': { boxShadow: '0 0 0 2px var(--stos-brand-tint)' },
        ...sx,
      }}
    >
      {showDot && !isSolid && (
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            flexShrink: 0,
          }}
        />
      )}
      {!isCompact && (
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </Box>
      )}
      {readOnly && <LockIcon sx={{ fontSize: 12, opacity: 0.8 }} />}
      {isMenu && !isCompact && (
        <ArrowIcon sx={{ fontSize: 14, opacity: 0.7, ml: 'auto', mr: -0.25 }} />
      )}
    </Box>
  );

  const tooltip = readOnly && readOnlyReason ? readOnlyReason : isCompact ? text : null;
  const wrapped = tooltip ? (
    <Tooltip title={tooltip} arrow>
      {pill}
    </Tooltip>
  ) : (
    pill
  );

  if (!isMenu) return wrapped;

  const close = () => {
    setAnchorEl(null);
    setQuery('');
  };

  const handleSelect = (item) => {
    close();
    onSelect?.(item);
  };

  return (
    <>
      {wrapped}
      <StatePicker
        anchorEl={anchorEl}
        stages={stages}
        currentKey={presentation?.key}
        fallbackColor={color}
        canMoveTo={canMoveTo}
        query={query}
        labels={labels}
        groupOrder={groupOrder}
        searchPlaceholder={searchPlaceholder}
        noMatchesLabel={noMatchesLabel}
        onQueryChange={setQuery}
        onSelect={handleSelect}
        onClose={close}
      />
    </>
  );
}

// A Popper and not a Menu: a menu is modal and would steal focus from the filter field.
function StatePicker({
  anchorEl,
  stages,
  currentKey,
  fallbackColor,
  canMoveTo,
  query,
  labels,
  groupOrder,
  searchPlaceholder,
  noMatchesLabel,
  onQueryChange,
  onSelect,
  onClose,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const open = Boolean(anchorEl);

  const groups = useMemo(() => {
    const needle = fold(query);
    return groupOrder
      .map((normalized) => ({
        normalized,
        label: labels[normalized] || normalized,
        items: stages
          .filter((item) => (item.normalized_state || item.key) === normalized)
          .filter(
            (item) =>
              !needle ||
              fold(item.title || item.key).includes(needle) ||
              fold(labels[normalized]).includes(needle),
          ),
      }))
      .filter((group) => group.items.length > 0);
  }, [stages, query, labels, groupOrder]);

  const selectable = useMemo(
    () =>
      groups
        .flatMap((group) => group.items)
        .filter(
          (item) =>
            item.key !== currentKey && (canMoveTo ? canMoveTo(item)?.allowed !== false : true),
        ),
    [groups, currentKey, canMoveTo],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  if (!open) return null;

  const onKeyDown = (event) => {
    event.stopPropagation();

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (selectable.length ? (index + 1) % selectable.length : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        selectable.length ? (index - 1 + selectable.length) % selectable.length : 0,
      );
      return;
    }
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    const choice = selectable[activeIndex];
    if (choice) onSelect(choice);
  };

  return (
    <Popper
      open
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={POPPER_MODIFIERS}
      sx={{ zIndex: 1300 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={0}
          onClick={(event) => event.stopPropagation()}
          sx={{
            mt: 0.5,
            minWidth: 240,
            maxHeight: 360,
            display: 'flex',
            flexDirection: 'column',
            border: 1,
            borderColor: 'divider',
            borderRadius: 'var(--stos-radius-md, 8px)',
            boxShadow: 'var(--stos-shadow-md)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 1.25, py: 0.75, borderBottom: 1, borderColor: 'divider' }}>
            <InputBase
              autoFocus
              fullWidth
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              sx={{ fontSize: 13 }}
            />
          </Box>

          <Box sx={{ overflowY: 'auto', py: 0.5 }}>
            {groups.length === 0 && (
              <Typography variant="body2" sx={{ px: 1.5, py: 1, color: 'text.tertiary' }}>
                {noMatchesLabel}
              </Typography>
            )}

            {groups.map((group) => (
              <Box key={group.normalized}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    px: 1.5,
                    pt: 0.75,
                    pb: 0.25,
                    color: 'text.tertiary',
                    lineHeight: 1.6,
                  }}
                >
                  {group.label}
                </Typography>

                {group.items.map((item) => {
                  const verdict = canMoveTo ? canMoveTo(item) : { allowed: true };
                  const isCurrent = item.key === currentKey;
                  const disabled = isCurrent || verdict?.allowed === false;
                  const itemColor =
                    item.color || STOS_STATE_COLORS[item.normalized_state] || fallbackColor;
                  const isActive = !disabled && selectable[activeIndex]?.key === item.key;

                  const row = (
                    <Box
                      component="button"
                      type="button"
                      key={item.key}
                      disabled={disabled}
                      onMouseEnter={() => {
                        const index = selectable.findIndex((option) => option.key === item.key);
                        if (index >= 0) setActiveIndex(index);
                      }}
                      onClick={() => !disabled && onSelect(item)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                        border: 0,
                        px: 1.5,
                        py: 0.75,
                        background: isActive ? 'var(--stos-bg-hover)' : 'transparent',
                        color: disabled ? 'text.disabled' : 'text.primary',
                        fontFamily: 'inherit',
                        fontSize: 13,
                        textAlign: 'left',
                        cursor: disabled ? 'default' : 'pointer',
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: itemColor,
                          flexShrink: 0,
                        }}
                      />
                      <Box
                        component="span"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {item.title || labels[item.key] || item.key}
                      </Box>
                    </Box>
                  );

                  return verdict?.allowed === false && verdict?.reason ? (
                    <Tooltip key={item.key} title={verdict.reason} placement="right">
                      <span>{row}</span>
                    </Tooltip>
                  ) : (
                    row
                  );
                })}
              </Box>
            ))}
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}

export default StatusPill;
