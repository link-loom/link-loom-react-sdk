import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import EntityModalTopBar from './EntityModalTopBar.component.jsx';
import KeyValueRow from './KeyValueRow.component.jsx';

function NeutralTag({ label, sx = {} }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        px: 0.75,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        color: 'text.secondary',
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {label}
    </Box>
  );
}

/**
 * Entity detail modal skeleton: top bar → header (h3 title, mono slug, tags) → meta band on the
 * muted surface → tabs → fixed-height scrollable tab body → optional footer.
 * tags: strings, `{ label, sx }` or `{ node }`. meta: [{ label, value, mono, render }]. tabs: [{ id, label, icon, content }].
 */
function EntityDetailShell({
  breadcrumbSection,
  title,
  slug,
  tags = [],
  copyLinkPath,
  onEdit,
  meta = [],
  metaColumns = 3,
  tabs = [],
  topBarExtra = null,
  topBarLabels,
  onClose = null,
  renderHeader = null,
  headerExtra = null,
  footer = null,
  width = '100%',
  bodyHeight = '56vh',
  activeTab: activeTabProp,
  onTabChange,
}) {
  const [activeTabState, setActiveTab] = useState(tabs[0]?.id);
  const activeTab = activeTabProp ?? activeTabState;
  const activeTabContent =
    tabs.find((tab) => tab.id === activeTab)?.content ?? tabs[0]?.content;

  const changeTab = (next) => {
    setActiveTab(next);
    onTabChange?.(next);
  };

  return (
    <Box
      className={onClose ? 'stos-detail-shell stos-detail-shell--own-close' : 'stos-detail-shell'}
      sx={{ display: 'flex', flexDirection: 'column', width }}
    >
      <EntityModalTopBar
        breadcrumbSection={breadcrumbSection}
        title={title}
        copyLinkPath={copyLinkPath}
        onEdit={onEdit}
        onClose={onClose}
        rightExtra={topBarExtra}
        labels={topBarLabels}
      />

      <Box component="header" sx={{ px: 3, pt: 2, pb: 1.5, minWidth: 0 }}>
        {renderHeader || (
          <>
            <Typography variant="h3" component="h2">
              {title || breadcrumbSection}
            </Typography>
            {slug && (
              <Typography variant="caption" className="stos-mono" sx={{ color: 'text.tertiary' }}>
                {slug}
              </Typography>
            )}
          </>
        )}

        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
            {tags.map((tag, index) => {
              if (tag && typeof tag === 'object' && tag.node) {
                return <React.Fragment key={index}>{tag.node}</React.Fragment>;
              }
              const isObject = tag && typeof tag === 'object';
              return (
                <NeutralTag
                  key={`${isObject ? tag.label : tag}-${index}`}
                  label={isObject ? tag.label : tag}
                  sx={isObject ? tag.sx : undefined}
                />
              );
            })}
          </Box>
        )}

        {headerExtra}
      </Box>

      {meta.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: `repeat(${Math.min(metaColumns, meta.length)}, minmax(0, 1fr))`,
            },
            columnGap: 2,
            rowGap: 0.5,
            px: 3,
            pt: 1.5,
            pb: 1,
            backgroundColor: 'var(--stos-bg-muted)',
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {meta.map((item) => (
            <Box key={item.label} sx={{ minWidth: 0 }}>
              {item.render ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
                    {item.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 24, minWidth: 0 }}>
                    {item.render}
                  </Box>
                </Box>
              ) : (
                <KeyValueRow label={item.label} value={item.value} mono={item.mono} />
              )}
            </Box>
          ))}
        </Box>
      )}

      {tabs.length > 0 && (
        <>
          <Box sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(_, next) => changeTab(next)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38 } }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  label={tab.label}
                  value={tab.id}
                  icon={tab.icon}
                  iconPosition="start"
                  disableRipple
                />
              ))}
            </Tabs>
          </Box>

          <Box
            sx={{
              height: bodyHeight,
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                px: 3,
                pt: 2,
                pb: 2,
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {activeTabContent}
            </Box>
          </Box>
        </>
      )}

      {footer && (
        <Box
          component="footer"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
}

export default EntityDetailShell;
