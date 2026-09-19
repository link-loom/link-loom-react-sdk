import React, { useContext, useState } from 'react';
import { Box, ButtonBase, Popover, Typography } from '@mui/material';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import RibbonItem, { RibbonContext } from './RibbonItem.component.jsx';

const SMALL_ROWS = 2;

// Consecutive small items stack into columns of two; large items stand alone.
const toColumns = (items = []) =>
  items.reduce((columns, item) => {
    const last = columns[columns.length - 1];
    const isLarge = item.size === 'large';

    if (isLarge) {
      columns.push({ key: item.id, large: true, items: [item] });
      return columns;
    }

    if (last && !last.large && last.items.length < SMALL_ROWS) {
      last.items.push(item);
      return columns;
    }

    columns.push({ key: item.id, large: false, items: [item] });
    return columns;
  }, []);

export function RibbonGroupItems({ group }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, flex: 1 }}>
      {toColumns(group.items).map((column) => (
        <Box
          key={column.key}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: column.large ? 'flex-start' : 'center',
            gap: '2px',
            height: 66,
          }}
        >
          {column.items.map((item) => (
            <RibbonItem key={item.id} item={item} size={column.large ? 'large' : 'small'} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

function GroupLabel({ label }) {
  return (
    <Typography
      variant="caption"
      noWrap
      sx={{ display: 'block', textAlign: 'center', color: 'text.tertiary', lineHeight: '16px' }}
    >
      {label}
    </Typography>
  );
}

export function RibbonGroup({ group, separator }) {
  return (
    <Box
      data-ribbon-group={group.id}
      role="group"
      aria-label={group.label}
      sx={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        px: 1,
        borderLeft: separator ? 1 : 0,
        borderColor: 'divider',
      }}
    >
      <RibbonGroupItems group={group} />
      <GroupLabel label={group.label} />
    </Box>
  );
}

// A group that no longer fits: one dropdown button labelled with the group name.
export function RibbonCollapsedGroup({ group, separator }) {
  const { inOverlay } = useContext(RibbonContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const leadIcon = group.icon || group.items?.find((item) => item.icon)?.icon;

  const close = () => setAnchorEl(null);

  return (
    <Box
      data-ribbon-group={group.id}
      sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        height: '100%',
        px: 1,
        borderLeft: separator ? 1 : 0,
        borderColor: 'divider',
      }}
    >
      <ButtonBase
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={anchorEl ? 'true' : undefined}
        sx={{
          flexDirection: 'column',
          gap: 0.5,
          minWidth: 56,
          height: 82,
          px: 0.75,
          pt: 0.75,
          borderRadius: 1,
          color: 'text.primary',
          backgroundColor: anchorEl ? 'var(--stos-bg-selected)' : 'transparent',
          transition: 'background-color 120ms ease-in-out',
          '&:hover': { backgroundColor: 'action.hover' },
          '& svg': { fontSize: 20 },
        }}
      >
        {leadIcon}
        <Box component="span" sx={{ fontSize: 12, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          {group.label}
        </Box>
        <KeyboardArrowDownOutlined sx={{ fontSize: '14px !important', color: 'text.tertiary' }} />
      </ButtonBase>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        disablePortal={inOverlay}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <RibbonContext.Consumer>
          {(context) => (
            <RibbonContext.Provider
              value={{
                ...context,
                inOverlay: true,
                onAfterAction: () => {
                  close();
                  context.onAfterAction();
                },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', height: 92, px: 1, pt: 0.75 }}>
                <RibbonGroupItems group={group} />
                <GroupLabel label={group.label} />
              </Box>
            </RibbonContext.Provider>
          )}
        </RibbonContext.Consumer>
      </Popover>
    </Box>
  );
}
