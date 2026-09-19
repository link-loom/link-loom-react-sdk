import React from 'react';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// tabs: [{ id, label, icon, count, dividerAfter }]
function ViewTabs({ value, onChange, tabs = [], onAdd, addLabel = 'View', sx = {} }) {
  const current = tabs.some((tab) => tab.id === value) ? value : tabs[0]?.id || false;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderBottom: 1,
        borderColor: 'divider',
        ...sx,
      }}
    >
      <Tabs value={current} onChange={(_event, next) => onChange?.(next)} sx={{ minHeight: 36 }}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            icon={tab.icon || undefined}
            iconPosition="start"
            sx={
              tab.dividerAfter
                ? {
                    position: 'relative',
                    mr: 1,
                    pr: 2,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1px',
                      height: 16,
                      backgroundColor: 'divider',
                    },
                  }
                : undefined
            }
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                {tab.label}
                {typeof tab.count === 'number' && (
                  <Typography component="span" variant="caption" sx={{ color: 'text.tertiary' }}>
                    {tab.count}
                  </Typography>
                )}
              </Box>
            }
          />
        ))}
      </Tabs>

      {onAdd && (
        <Button
          size="small"
          variant="text"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ color: 'text.tertiary', ml: 0.5 }}
        >
          {addLabel}
        </Button>
      )}
    </Box>
  );
}

export default ViewTabs;
