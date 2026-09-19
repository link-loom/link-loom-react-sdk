import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
  ArrowBackOutlined as BackIcon,
  CheckOutlined as CheckIcon,
  CloseOutlined as CloseIcon,
  EditOutlined as EditIcon,
  LinkOutlined as LinkIcon,
} from '@mui/icons-material';

const DEFAULT_LABELS = {
  untitled: 'Untitled',
  copyLink: 'Copy link',
  linkCopied: 'Link copied',
  edit: 'Edit',
  back: 'Back',
  close: 'Close',
};

// `[Section] / [name]` breadcrumb on the left, preceded by the back affordance that leaves edit mode;
// copy-link + edit + extra + close on the right.
function EntityModalTopBar({
  breadcrumbSection,
  title,
  copyLinkPath,
  onEdit,
  onBack = null,
  onClose = null,
  rightExtra = null,
  labels = {},
}) {
  const copy = { ...DEFAULT_LABELS, ...labels };
  const [linkCopied, setLinkCopied] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopyLink = () => {
    if (!copyLinkPath) {
      return;
    }
    try {
      navigator.clipboard?.writeText(`${window.location.origin}${copyLinkPath}`);
    } catch {
      return;
    }
    setLinkCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        flexShrink: 0,
        minHeight: 44,
        padding: `0 ${onClose ? 12 : 60}px 0 ${onBack ? 8 : 24}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {onBack && (
        <Tooltip title={copy.back} arrow>
          <IconButton size="small" onClick={onBack} aria-label={copy.back} sx={{ color: 'text.tertiary', flexShrink: 0 }}>
            <BackIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}

      <Typography variant="body2" noWrap sx={{ color: 'text.tertiary', minWidth: 0, mr: 'auto' }}>
        {breadcrumbSection} /{' '}
        <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
          {title || copy.untitled}
        </Box>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
        {copyLinkPath && (
          <Tooltip title={linkCopied ? copy.linkCopied : copy.copyLink} arrow>
            <IconButton
              size="small"
              onClick={handleCopyLink}
              aria-label={copy.copyLink}
              sx={{ color: linkCopied ? 'success.main' : 'text.tertiary' }}
            >
              {linkCopied ? <CheckIcon sx={{ fontSize: 16 }} /> : <LinkIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title={copy.edit} arrow>
            <IconButton
              size="small"
              onClick={onEdit}
              aria-label={copy.edit}
              sx={{ color: 'text.tertiary' }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        {rightExtra}
        {onClose && (
          <Tooltip title={copy.close} arrow>
            <IconButton
              size="small"
              onClick={onClose}
              aria-label={copy.close}
              sx={{ color: 'text.tertiary' }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

export default EntityModalTopBar;
