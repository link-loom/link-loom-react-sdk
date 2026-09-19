import React from 'react';
import { Avatar, Box, Button, IconButton, Typography } from '@mui/material';
import {
  CheckCircleOutline,
  CloseOutlined,
  ErrorOutlineOutlined,
  InfoOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';

const SEVERITY = {
  info: { Icon: InfoOutlined, tone: 'var(--stos-info, #37b6e0)' },
  success: { Icon: CheckCircleOutline, tone: 'var(--stos-success, #2fb673)' },
  warning: { Icon: WarningAmberOutlined, tone: 'var(--stos-warning, #ffb020)' },
  error: { Icon: ErrorOutlineOutlined, tone: 'var(--stos-danger, #e5484d)' },
};

const MAX_ACTIONS = 2;

// Toast / notification-center card: avatar or icon · title · body · time · up to 2 actions · close.
function NotificationCard({
  title,
  body,
  time,
  avatarUrl,
  icon,
  severity = 'info',
  actions = [],
  onAction,
  onClick,
  onClose,
  closeLabel = 'Dismiss',
  width = 320,
  sx = {},
}) {
  const { Icon, tone } = SEVERITY[severity] || SEVERITY.info;
  const visibleActions = actions.slice(0, MAX_ACTIONS);
  const clickable = typeof onClick === 'function';

  const leading = avatarUrl ? (
    <Avatar src={avatarUrl} alt="" sx={{ width: 32, height: 32 }} />
  ) : (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: tone,
        backgroundColor: `color-mix(in srgb, ${tone} 12%, var(--stos-bg-surface, white))`,
        '& svg': { fontSize: 18 },
      }}
    >
      {icon || <Icon />}
    </Box>
  );

  return (
    <Box
      component="article"
      role="alert"
      onClick={onClick}
      sx={{
        width,
        maxWidth: '100%',
        display: 'flex',
        gap: 1.25,
        p: 1.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2.5,
        backgroundColor: 'background.paper',
        boxShadow: 'var(--stos-shadow-md)',
        cursor: clickable ? 'pointer' : 'default',
        animation: 'stos-fade-in 160ms ease-out both',
        ...sx,
      }}
    >
      <Box sx={{ flexShrink: 0 }}>{leading}</Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
          <Typography variant="subtitle1" sx={{ flex: 1, minWidth: 0, color: 'text.primary' }} noWrap title={title}>
            {title}
          </Typography>
          {time && (
            <Typography variant="caption" component="time" sx={{ color: 'text.tertiary', whiteSpace: 'nowrap', lineHeight: '19px' }}>
              {time}
            </Typography>
          )}
          {onClose && (
            <IconButton
              size="small"
              aria-label={closeLabel}
              onClick={(event) => {
                event.stopPropagation();
                onClose(event);
              }}
              sx={{ p: 0.25, mt: '-1px', color: 'text.tertiary', '& svg': { fontSize: 16 } }}
            >
              <CloseOutlined />
            </IconButton>
          )}
        </Box>

        {body && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {body}
          </Typography>
        )}

        {visibleActions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
            {visibleActions.map((action, index) => (
              <Button
                key={action.id}
                size="small"
                variant={index === 0 ? 'contained' : 'outlined'}
                onClick={(event) => {
                  event.stopPropagation();
                  onAction?.(action, event);
                }}
                sx={{ minHeight: 26, py: '2px', px: 1.25, fontSize: 12 }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default NotificationCard;
