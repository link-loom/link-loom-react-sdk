import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { InsertDriveFileOutlined, PushPinOutlined } from '@mui/icons-material';
import RowActionsMenu from '../row-actions-menu/RowActionsMenu.component.jsx';

/**
 * A document in a list (`variant="row"`) or a grid (`variant="tile"`).
 * actions: RowActionsMenu items, revealed on hover/focus (always visible on touch).
 */
function DocumentCard({
  title,
  meta,
  thumbnailUrl,
  icon,
  pinned = false,
  pinnedLabel = 'Pinned',
  actions = [],
  actionsLabel = 'Options',
  selected = false,
  variant = 'row',
  untitledLabel = 'Untitled',
  onOpen,
  sx = {},
}) {
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState(null);

  const isTile = variant === 'tile';
  const clickable = typeof onOpen === 'function';
  const showThumbnail = Boolean(thumbnailUrl) && failedThumbnailUrl !== thumbnailUrl;

  const onKeyDown = (event) => {
    if (!clickable || event.target !== event.currentTarget) {
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    onOpen(event);
  };

  const visual = showThumbnail ? (
    <Box
      component="img"
      src={thumbnailUrl}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setFailedThumbnailUrl(thumbnailUrl)}
      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    icon || <InsertDriveFileOutlined />
  );

  const menu = actions.length > 0 && (
    <RowActionsMenu items={actions} label={actionsLabel} className="stos-reveal-on-hover" />
  );

  const pin = pinned && (
    <Box
      component="span"
      title={pinnedLabel}
      aria-label={pinnedLabel}
      sx={{ display: 'inline-flex', color: 'text.tertiary', '& svg': { fontSize: 14 } }}
    >
      <PushPinOutlined />
    </Box>
  );

  const titleNode = (
    <Typography variant="subtitle1" noWrap sx={{ minWidth: 0, color: 'text.primary' }}>
      {title || untitledLabel}
    </Typography>
  );

  const metaNode = meta && (
    <Typography variant="caption" noWrap component="div" sx={{ color: 'text.tertiary', minWidth: 0 }}>
      {meta}
    </Typography>
  );

  const hostSx = {
    position: 'relative',
    minWidth: 0,
    border: 1,
    borderColor: selected ? 'var(--stos-brand-edge)' : 'divider',
    borderRadius: 2,
    backgroundColor: selected ? 'var(--stos-bg-selected)' : 'background.paper',
    cursor: clickable ? 'pointer' : 'default',
    outline: 'none',
    transition: 'border-color 120ms ease-in-out, background-color 120ms ease-in-out',
    '&:hover': clickable ? { borderColor: 'var(--stos-border-strong)' } : undefined,
    '&:focus-visible': { boxShadow: '0 0 0 2px var(--stos-brand-edge)' },
  };

  if (isTile) {
    return (
      <Box
        className="stos-reveal-host"
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-pressed={clickable ? selected : undefined}
        onClick={onOpen}
        onKeyDown={onKeyDown}
        sx={{ ...hostSx, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sx }}
      >
        <Box
          sx={{
            aspectRatio: '4 / 3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--stos-bg-muted)',
            borderBottom: 1,
            borderColor: 'divider',
            color: 'text.tertiary',
            '& > svg': { fontSize: 32 },
          }}
        >
          {visual}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 1, minWidth: 0 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {titleNode}
            {metaNode}
          </Box>
          {pin}
          {menu}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="stos-reveal-host"
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-pressed={clickable ? selected : undefined}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      sx={{
        ...hostSx,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minHeight: 'var(--stos-row-h, 40px)',
        px: 1.5,
        py: 0.75,
        ...sx,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 28,
          height: 28,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 1,
          color: 'text.tertiary',
          backgroundColor: showThumbnail ? 'var(--stos-bg-muted)' : 'transparent',
          '& > svg': { fontSize: 20 },
        }}
      >
        {visual}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {titleNode}
        {metaNode}
      </Box>
      {pin}
      {menu}
    </Box>
  );
}

export default DocumentCard;
