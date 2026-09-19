import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, ClickAwayListener, IconButton, Popper, Tooltip } from '@mui/material';
import { ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import RibbonItem, { RibbonContext } from './RibbonItem.component.jsx';
import { RibbonCollapsedGroup, RibbonGroup } from './RibbonGroup.component.jsx';

const TABS_ROW_HEIGHT = 36;
const GROUPS_ROW_HEIGHT = 92;
const COLLAPSED_GROUP_FALLBACK_WIDTH = 76;

const DEFAULT_LABELS = {
  collapse: 'Collapse the ribbon',
  expand: 'Pin the ribbon',
  moreOptions: 'More options',
  customColor: 'Custom color',
  toolbar: 'Toolbar',
};

const tabAccent = (tab) => tab?.accent || tab?.color || null;

function useControllableState(controlled, initial, onChange) {
  const [internal, setInternal] = useState(initial);
  const value = controlled === undefined ? internal : controlled;
  const setValue = useCallback(
    (next) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [value, setValue];
}

function RibbonTab({ tab, selected, focusable, accent, onSelect, onDoubleClick, tabRef, id, panelId }) {
  return (
    <Box
      component="button"
      type="button"
      role="tab"
      id={id}
      ref={tabRef}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={focusable ? 0 : -1}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      sx={{
        position: 'relative',
        height: TABS_ROW_HEIGHT,
        px: 1.5,
        border: 0,
        borderTop: accent ? `2px solid ${accent}` : 0,
        background: 'transparent',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        color: selected ? 'text.primary' : accent || 'text.secondary',
        transition: 'color 120ms ease-in-out',
        '&:hover': { color: 'text.primary' },
        '&:focus-visible': { outline: '2px solid var(--stos-brand-edge)', outlineOffset: -2 },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 0,
          height: 2,
          borderRadius: 1,
          backgroundColor: selected ? accent || 'primary.main' : 'transparent',
        },
      }}
    >
      {tab.label}
    </Box>
  );
}

/**
 * Office-style ribbon. tabs: [{ id, label, groups: [{ id, label, icon, items: [...] }] }]
 * item: { id, type: 'button'|'split'|'toggle'|'select'|'color'|'custom', size: 'large'|'small', icon,
 *         label, tooltip, shortcut, active, disabled, onClick, options, value, onChange, render }
 */
function Ribbon({
  tabs = [],
  contextualTabs = [],
  fileTab,
  activeTab,
  onTabChange,
  collapsed,
  onCollapsedChange,
  compact = false,
  labels = {},
  sx = {},
}) {
  // -----------------------------------------------------
  // 1. State
  // -----------------------------------------------------
  const copy = { ...DEFAULT_LABELS, ...labels };
  const allTabs = useMemo(
    () => [...tabs, ...contextualTabs].filter((tab) => tab?.id),
    [tabs, contextualTabs],
  );
  const [currentTabId, setCurrentTabId] = useControllableState(activeTab, allTabs[0]?.id, onTabChange);
  const [isCollapsed, setIsCollapsed] = useControllableState(collapsed, false, onCollapsedChange);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [backstageRect, setBackstageRect] = useState(null);
  const [groupsEl, setGroupsEl] = useState(null);
  const [collapsedFrom, setCollapsedFrom] = useState(Infinity);

  const rootRef = useRef(null);
  const tabsRowRef = useRef(null);
  const tabRefs = useRef({});
  const widthCache = useRef(new Map());

  // -----------------------------------------------------
  // 2. Derived
  // -----------------------------------------------------
  const currentTab = allTabs.find((tab) => tab.id === currentTabId) || allTabs[0];
  const groups = currentTab?.groups || [];
  const baseId = `stos-ribbon-${currentTab?.id || 'tab'}`;
  const panelId = `${baseId}-panel`;
  const showGroupsInline = !isCollapsed;

  // -----------------------------------------------------
  // 3. Functions
  // -----------------------------------------------------
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);
  const onAfterAction = useCallback(() => {
    if (isCollapsed) closeOverlay();
  }, [isCollapsed, closeOverlay]);

  const contextValue = useMemo(
    () => ({ inOverlay: overlayOpen, onAfterAction, labels: copy }),
    [overlayOpen, onAfterAction, labels],
  );

  const cacheKey = (group, isGroupCollapsed) =>
    `${currentTab?.id}:${group.id}:${isGroupCollapsed ? 'collapsed' : 'expanded'}`;

  const recompute = useCallback(() => {
    if (!groupsEl) {
      return;
    }

    const style = window.getComputedStyle(groupsEl);
    const available =
      groupsEl.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const widths = groups.map((group) => widthCache.current.get(cacheKey(group, false)));

    if (widths.some((width) => width == null)) {
      setCollapsedFrom(Infinity);
      return;
    }

    let total = widths.reduce((sum, width) => sum + width, 0);
    let index = groups.length;
    while (total > available && index > 0) {
      index -= 1;
      const collapsedWidth =
        widthCache.current.get(cacheKey(groups[index], true)) || COLLAPSED_GROUP_FALLBACK_WIDTH;
      total = total - widths[index] + collapsedWidth;
    }

    setCollapsedFrom(index >= groups.length ? Infinity : index);
  }, [groupsEl, groups, currentTab?.id]);

  const selectTab = (tabId, { focus = false } = {}) => {
    setCurrentTabId(tabId);
    if (focus) tabRefs.current[tabId]?.focus();
  };

  const onTabClick = (tabId) => {
    if (!isCollapsed) {
      selectTab(tabId);
      return;
    }
    const sameTabOpen = overlayOpen && tabId === currentTab?.id;
    selectTab(tabId);
    setOverlayOpen(!sameTabOpen);
  };

  const toggleCollapsed = () => {
    setOverlayOpen(false);
    setIsCollapsed(!isCollapsed);
  };

  const onTabsKeyDown = (event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key) || !allTabs.length) {
      return;
    }
    event.preventDefault();
    const index = Math.max(
      0,
      allTabs.findIndex((tab) => tab.id === currentTab?.id),
    );
    const nextIndex = {
      ArrowLeft: (index - 1 + allTabs.length) % allTabs.length,
      ArrowRight: (index + 1) % allTabs.length,
      Home: 0,
      End: allTabs.length - 1,
    }[event.key];
    selectTab(allTabs[nextIndex].id, { focus: true });
  };

  const openBackstage = () => {
    const container = rootRef.current?.closest('.stos-app');
    const rect = container?.getBoundingClientRect();
    setOverlayOpen(false);
    setBackstageRect(
      rect
        ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
    );
  };

  const closeBackstage = useCallback(() => setBackstageRect(null), []);

  // -----------------------------------------------------
  // 4. Lifecycle
  // -----------------------------------------------------
  useLayoutEffect(() => {
    if (!groupsEl) {
      return;
    }

    let learned = false;
    groupsEl.querySelectorAll(':scope > [data-ribbon-group]').forEach((node, index) => {
      const group = groups[index];
      if (!group) return;
      const key = cacheKey(group, index >= collapsedFrom);
      if (widthCache.current.get(key) === node.offsetWidth) return;
      widthCache.current.set(key, node.offsetWidth);
      learned = true;
    });

    if (learned) recompute();
  });

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    if (!groupsEl || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => recompute());
    observer.observe(groupsEl);
    return () => observer.disconnect();
  }, [groupsEl, recompute]);

  useEffect(() => {
    if (!backstageRect) {
      return undefined;
    }
    const onKeyDown = (event) => event.key === 'Escape' && closeBackstage();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [backstageRect, closeBackstage]);

  // -----------------------------------------------------
  // 5. Render
  // -----------------------------------------------------
  const renderGroupsRow = () => (
    <Box
      id={panelId}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab`}
      ref={setGroupsEl}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        height: GROUPS_ROW_HEIGHT,
        px: 0.5,
        pt: 0.75,
        pb: 0.25,
        minWidth: 0,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
      }}
    >
      {groups.map((group, index) =>
        index >= collapsedFrom ? (
          <RibbonCollapsedGroup key={group.id} group={group} separator={index > 0} />
        ) : (
          <RibbonGroup key={group.id} group={group} separator={index > 0} />
        ),
      )}
    </Box>
  );

  if (compact) {
    const compactGroups = allTabs[0]?.groups || [];
    return (
      <RibbonContext.Provider value={contextValue}>
        <Box
          ref={rootRef}
          role="toolbar"
          aria-label={copy.toolbar}
          className="stos-ribbon stos-ribbon--compact"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            height: TABS_ROW_HEIGHT,
            px: 1,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            ...sx,
          }}
        >
          {compactGroups.map((group, index) => (
            <React.Fragment key={group.id}>
              {index > 0 && (
                <Box
                  role="separator"
                  aria-orientation="vertical"
                  sx={{ width: '1px', height: 20, mx: 0.5, flexShrink: 0, backgroundColor: 'divider' }}
                />
              )}
              {(group.items || []).map((item) => (
                <Box key={item.id} sx={{ display: 'inline-flex', flexShrink: 0 }}>
                  <RibbonItem item={item} size="small" />
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Box>
      </RibbonContext.Provider>
    );
  }

  return (
    <RibbonContext.Provider value={contextValue}>
      <Box
        ref={rootRef}
        className="stos-ribbon"
        sx={{
          position: 'relative',
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          ...sx,
        }}
      >
        <Box
          ref={tabsRowRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: TABS_ROW_HEIGHT,
            px: 0.5,
            borderBottom: showGroupsInline ? 1 : 0,
            borderColor: 'divider',
          }}
        >
          {fileTab && (
            <Box
              component="button"
              type="button"
              onClick={openBackstage}
              aria-haspopup="dialog"
              aria-expanded={backstageRect ? 'true' : undefined}
              sx={{
                height: TABS_ROW_HEIGHT,
                px: 1.5,
                border: 0,
                background: 'transparent',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                color: 'primary.main',
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'background-color 120ms ease-in-out',
                '&:hover': { backgroundColor: 'action.hover' },
                '&:focus-visible': { outline: '2px solid var(--stos-brand-edge)', outlineOffset: -2 },
              }}
            >
              {fileTab.label}
            </Box>
          )}

          <Box
            role="tablist"
            aria-orientation="horizontal"
            onKeyDown={onTabsKeyDown}
            sx={{ display: 'flex', alignItems: 'stretch', minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' }}
          >
            {allTabs.map((tab) => {
              const selected = tab.id === currentTab?.id && (!isCollapsed || overlayOpen);
              return (
                <RibbonTab
                  key={tab.id}
                  id={tab.id === currentTab?.id ? `${baseId}-tab` : undefined}
                  panelId={panelId}
                  tab={tab}
                  selected={selected}
                  focusable={tab.id === currentTab?.id}
                  accent={tabAccent(tab)}
                  tabRef={(node) => {
                    tabRefs.current[tab.id] = node;
                  }}
                  onSelect={() => onTabClick(tab.id)}
                  onDoubleClick={toggleCollapsed}
                />
              );
            })}
          </Box>

          <Tooltip title={isCollapsed ? copy.expand : copy.collapse}>
            <IconButton
              size="small"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? copy.expand : copy.collapse}
              aria-expanded={!isCollapsed}
              sx={{ ml: 'auto', '& svg': { fontSize: 18 } }}
            >
              {isCollapsed ? <ExpandMoreOutlined /> : <ExpandLessOutlined />}
            </IconButton>
          </Tooltip>
        </Box>

        {showGroupsInline && renderGroupsRow()}

        {isCollapsed && (
          <Popper
            open={overlayOpen}
            anchorEl={tabsRowRef.current}
            placement="bottom-start"
            disablePortal
            sx={{ zIndex: 1200, width: tabsRowRef.current?.offsetWidth }}
          >
            <ClickAwayListener onClickAway={closeOverlay}>
              <Box
                onKeyDown={(event) => event.key === 'Escape' && closeOverlay()}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: '0 0 8px 8px',
                  overflow: 'hidden',
                  boxShadow: 'var(--stos-shadow-md)',
                  animation: 'stos-fade-in 120ms ease-out both',
                }}
              >
                {renderGroupsRow()}
              </Box>
            </ClickAwayListener>
          </Popper>
        )}

        {fileTab && backstageRect && (
          <Box
            role="dialog"
            aria-modal="true"
            aria-label={fileTab.label}
            sx={{
              position: 'fixed',
              ...backstageRect,
              zIndex: 1250,
              overflow: 'auto',
              backgroundColor: 'background.default',
              animation: 'stos-fade-in 120ms ease-out both',
            }}
          >
            {fileTab.render?.({ close: closeBackstage })}
          </Box>
        )}
      </Box>
    </RibbonContext.Provider>
  );
}

export default Ribbon;
