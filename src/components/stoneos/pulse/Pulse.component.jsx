import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { ArrowBackOutlined as BackIcon, HistoryOutlined as HistoryIcon } from '@mui/icons-material';
import EmptyState from '../empty-state/EmptyState.component.jsx';
import { loadCollection } from '../shared/readCollection.js';
import { groupByPeriod, summarizePulseEntry } from './pulse.helpers.js';
import { pulseGlyphOf } from './pulse.glyphs.js';
import { mergePulseLabels } from './pulse.labels.js';
import PulseEventRow from './subcomponents/PulseEventRow.component.jsx';
import PulseEventDetail from './subcomponents/PulseEventDetail.component.jsx';

const PAGE_SIZE = 25;
const LIST_WIDTH = 340;
// Under this container width the detail takes the place of the list; under the compact one, each
// changed field stacks its name over its values.
const SPLIT_MIN_WIDTH = 720;
const COMPACT_MAX_WIDTH = 480;

function ListSkeleton({ rows = 6 }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1.25, py: 1 }}>
      {Array.from({ length: rows }).map((_, row) => (
        <Box key={row} sx={{ display: 'flex', gap: 1.25, alignItems: 'center', py: 0.75 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="45%" height={18} />
            <Skeleton variant="text" width="80%" height={16} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Skeleton variant="text" width="35%" height={26} />
      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
        <Skeleton variant="circular" width={36} height={36} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="text" width="50%" height={16} />
        </Box>
      </Box>
      {[0, 1, 2].map((row) => (
        <Box key={row} sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="text" width={110} height={20} />
          <Skeleton variant="rounded" width="40%" height={22} />
        </Box>
      ))}
    </Box>
  );
}

// The width of the element itself: the app runs embedded (a modal, the Command Center panel), so its
// own container, not the window, decides whether the list and the detail fit side by side.
const useContainerWidth = (ref) => {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }
    setWidth(element.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(([observed]) => setWidth(observed.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
};

/**
 * Pulse: the whole history of one record, newest first, as a list of events grouped by period with the
 * selected event in full beside it. It is a record: nothing here edits anything.
 *
 * `loadPage({ page, pageSize })` answers one page (`{ items, totalPages }`, an envelope or a list); the
 * list asks for the next page when its end scrolls into view. `subjectKey` and `refreshKey` reload it
 * (after a change made from the detail). Up and down move the selection. In a narrow container the
 * detail takes the place of the list, with a way back.
 *
 * Entries follow the Mi Retail activity shape: `{ id, verb, occurred_at, actor_identity,
 * context: { actor_display_name }, source, payload: { changes: [{ field, kind, from, to }], reason } }`.
 */
function Pulse({
  loadPage,
  subjectKey = null,
  refreshKey = 0,
  pageSize = PAGE_SIZE,
  labels,
  locale,
  timeZone,
  summarize,
  glyphOf = pulseGlyphOf,
  renderValue,
  resolveReference,
  resolvePerson,
  hiddenFields = null,
  sx,
}) {
  // -----------------------------------------------------
  // 1. Hooks
  // -----------------------------------------------------
  const rootRef = useRef(null);
  const containerWidth = useContainerWidth(rootRef);

  // -----------------------------------------------------
  // 2. Models / State
  // -----------------------------------------------------
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  // -----------------------------------------------------
  // 3. UI States
  // -----------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const listRef = useRef(null);
  const sentinelRef = useRef(null);
  // Every load carries a ticket; an answer to an older ticket is dropped, so a refresh can never be
  // overwritten by the page it replaced.
  const ticketRef = useRef(0);
  const loaderRef = useRef(loadPage);
  loaderRef.current = loadPage;

  // -----------------------------------------------------
  // 4. Configs / Constants
  // -----------------------------------------------------
  const resolvedLabels = useMemo(() => mergePulseLabels(labels), [labels]);
  const presentation = {
    labels: resolvedLabels,
    locale,
    timeZone,
    summarize: (entry) =>
      summarize ? summarize(entry) : summarizePulseEntry(entry, resolvedLabels, { locale }),
    glyphOf,
    renderValue,
    resolveReference,
    resolvePerson,
  };
  const groups = useMemo(() => groupByPeriod(entries, { timeZone }), [entries, timeZone]);
  const selected = entries.find((entry) => entry.id === selectedId) || entries[0] || null;
  const hasMore = page < totalPages;
  // An unmeasured container (width 0: not laid out yet, or no layout engine) is drawn side by side.
  const isNarrow = containerWidth > 0 && containerWidth < SPLIT_MIN_WIDTH;
  const isCompact = containerWidth > 0 && containerWidth < COMPACT_MAX_WIDTH;
  const showList = !isNarrow || !isDetailOpen;
  const showDetail = !isNarrow || isDetailOpen;

  // -----------------------------------------------------
  // 5. Component Functions
  // -----------------------------------------------------
  const fetchPage = (pageNumber) =>
    loadCollection(loaderRef.current, { page: pageNumber, pageSize });

  // Entry Point
  const initializeComponent = async () => {
    const ticket = ++ticketRef.current;
    setIsLoading(true);
    setIsLoadingMore(false);
    setHasError(false);

    const collection = await fetchPage(1);
    if (ticket !== ticketRef.current) {
      return;
    }

    if (!collection.ok) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setEntries(collection.items);
    setPage(1);
    setTotalPages(collection.totalPages);
    setSelectedId(collection.items[0]?.id || null);
    setIsLoading(false);
  };

  const loadEarlier = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }
    const ticket = ticketRef.current;
    setIsLoadingMore(true);

    const collection = await fetchPage(page + 1);
    if (ticket !== ticketRef.current) {
      return;
    }
    setIsLoadingMore(false);
    if (!collection.ok) {
      return;
    }

    setEntries((previous) => {
      const known = new Set(previous.map((entry) => entry.id));
      return [...previous, ...collection.items.filter((entry) => !known.has(entry.id))];
    });
    setPage((previous) => previous + 1);
    setTotalPages(collection.totalPages);
  }, [isLoading, isLoadingMore, hasMore, page, pageSize]);

  const revealSelection = (entryId) => {
    const row = listRef.current?.querySelector(`[data-event-id="${entryId}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  };

  const selectEntry = (entry) => {
    setSelectedId(entry.id);
    listRef.current?.focus({ preventScroll: true });
    if (isNarrow) {
      setIsDetailOpen(true);
    }
  };

  const moveSelection = (step) => {
    if (!entries.length) {
      return;
    }
    const index = Math.max(
      0,
      entries.findIndex((entry) => entry.id === selected?.id),
    );
    const next = entries[Math.min(entries.length - 1, Math.max(0, index + step))];
    setSelectedId(next.id);
    revealSelection(next.id);
  };

  const listOnKeyDown = (event) => {
    const steps = { ArrowDown: 1, ArrowUp: -1, Home: -entries.length, End: entries.length };
    if (event.key === 'Enter' && isNarrow && selected) {
      event.preventDefault();
      setIsDetailOpen(true);
      return;
    }
    if (steps[event.key] === undefined) {
      return;
    }
    event.preventDefault();
    moveSelection(steps[event.key]);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    requestAnimationFrame(() => {
      listRef.current?.focus({ preventScroll: true });
      if (selected) {
        revealSelection(selected.id);
      }
    });
  };

  // -----------------------------------------------------
  // 6. Lifecycle
  // -----------------------------------------------------
  useEffect(() => {
    initializeComponent();
  }, [subjectKey, refreshKey, attempt, pageSize]);

  // The next page loads when the end of the list scrolls into view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (observed) => observed.some((item) => item.isIntersecting) && loadEarlier(),
      { root: listRef.current, rootMargin: '120px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadEarlier, showList]);

  useEffect(() => {
    if (!isNarrow) {
      setIsDetailOpen(false);
    }
  }, [isNarrow]);

  // -----------------------------------------------------
  // 7. Render
  // -----------------------------------------------------
  const renderBody = () => {
    if (hasError) {
      return (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <EmptyState
            variant="error"
            size="inline"
            title={resolvedLabels.loadFailed}
            action={{
              label: resolvedLabels.retry,
              onClick: () => setAttempt((previous) => previous + 1),
            }}
          />
        </Box>
      );
    }

    if (!isLoading && !entries.length) {
      return (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <EmptyState
            icon={<HistoryIcon />}
            size="inline"
            title={resolvedLabels.emptyTitle}
            description={resolvedLabels.emptyHint}
          />
        </Box>
      );
    }

    return (
      <>
        {showList && (
          <Box
            ref={listRef}
            role="listbox"
            tabIndex={0}
            aria-label={resolvedLabels.listLabel}
            aria-activedescendant={selected ? `pulse-event-${selected.id}` : undefined}
            onKeyDown={listOnKeyDown}
            sx={{
              width: isNarrow ? '100%' : LIST_WIDTH,
              flexShrink: 0,
              minHeight: 0,
              minWidth: 0,
              overflowY: 'auto',
              pr: isNarrow ? 0 : 1.5,
              borderRight: isNarrow ? 0 : 1,
              borderColor: 'divider',
              outline: 'none',
              "&:focus-visible [aria-selected='true']": {
                boxShadow: 'inset 0 0 0 1px var(--stos-brand-edge)',
              },
            }}
          >
            {isLoading ? (
              <ListSkeleton />
            ) : (
              groups.map((group) => (
                <Box
                  key={group.period}
                  role="group"
                  aria-label={resolvedLabels.periods[group.period]}
                >
                  <Typography
                    variant="overline"
                    component="div"
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      px: 1.25,
                      pt: 1.5,
                      pb: 0.5,
                      color: 'text.tertiary',
                      backgroundColor: 'background.paper',
                    }}
                  >
                    {resolvedLabels.periods[group.period]}
                  </Typography>
                  {group.entries.map((entry) => (
                    <PulseEventRow
                      key={entry.id}
                      entry={entry}
                      isSelected={entry.id === selected?.id}
                      onSelect={selectEntry}
                      presentation={presentation}
                    />
                  ))}
                </Box>
              ))
            )}

            {!isLoading && (
              <Box ref={sentinelRef} sx={{ px: 1.25, py: 1.5, textAlign: 'center' }}>
                {isLoadingMore && <ListSkeleton rows={2} />}
                {!isLoadingMore && hasMore && (
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={loadEarlier}
                    sx={{ color: 'text.secondary' }}
                  >
                    {resolvedLabels.showEarlier}
                  </Button>
                )}
                {!hasMore && (
                  <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
                    {resolvedLabels.historyStart}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {showDetail && (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              overflowY: 'auto',
              px: isNarrow ? 1.25 : 3,
              py: isNarrow ? 1 : 1.5,
            }}
          >
            {isNarrow && (
              <Button
                size="small"
                variant="text"
                color="inherit"
                startIcon={<BackIcon />}
                onClick={closeDetail}
                sx={{ mb: 1.5, ml: -0.75, color: 'text.secondary' }}
              >
                {resolvedLabels.backToList}
              </Button>
            )}
            {isLoading || !selected ? (
              <DetailSkeleton />
            ) : (
              <PulseEventDetail
                entry={selected}
                presentation={presentation}
                hiddenFields={hiddenFields}
                compact={isCompact}
              />
            )}
          </Box>
        )}
      </>
    );
  };

  return (
    <Box ref={rootRef} sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', ...sx }}>
      {renderBody()}
    </Box>
  );
}

export default Pulse;
