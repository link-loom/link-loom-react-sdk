import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import EmptyState from '../empty-state/EmptyState.component.jsx';
import FilterBar from '../filter-bar/FilterBar.component.jsx';
import PageShell from '../page-shell/PageShell.component.jsx';
import { describeError } from '../shared/labels.helpers.js';
import EntityTable from './EntityTable.component.jsx';
import ListActionButton from './ListActionButton.component.jsx';
import ListPageHeader from './ListPageHeader.component.jsx';
import SavedCopyNotice from './SavedCopyNotice.component.jsx';
import ViewModeSwitch from './ViewModeSwitch.component.jsx';
import { PAGE_SIZE_OPTIONS, resolveListLabels } from './listSurface.labels.js';

// The frame every list of an app shares: header with the one primary action (and the secondary ones),
// filters in the URL, the table or grid, and the four states a list has: loading, error with Retry,
// empty (what the screen is for and how to start) and empty because of the filters (with Remove
// filters). `children` are the dialogs that open over the list.
//
// query: { items, totalItems, loading, error, fromCache, refresh } (see useDataQuery)
// empty: { title, description, illustration, filteredTitle }
// errorMessage(error): the sentence for a failed load; without it the error's own message is shown.
function ListSurface({
  icon,
  title,
  description,
  primaryAction,
  secondaryActions = [],
  offlineReason,
  chips = [],
  search,
  viewMode,
  viewModes,
  onViewModeChange,
  query,
  pagination,
  columns,
  getActions,
  onOpen,
  card,
  body,
  filtersActive = false,
  onClearFilters,
  empty = {},
  untitledLabel,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  errorMessage,
  labels,
  locale = 'en',
  children,
}) {
  // -----------------------------------------------------
  // 1. Hooks
  // -----------------------------------------------------
  const text = resolveListLabels(labels, locale);

  // -----------------------------------------------------
  // 4. Configs / Constants
  // -----------------------------------------------------
  const { items, totalItems, loading, error, fromCache, refresh } = query;
  const emptyActions = [primaryAction, ...secondaryActions].filter((action) => action && !action.disabled);

  // -----------------------------------------------------
  // 7. Render
  // -----------------------------------------------------
  const renderBody = () => {
    if (error) {
      return (
        <EmptyState
          variant="error"
          title={text.loadErrorTitle}
          description={describeError(error, { errorMessage })}
          action={{ label: text.retry, onClick: refresh }}
        />
      );
    }

    if (!loading && items.length === 0 && filtersActive) {
      return (
        <EmptyState
          illustration="search"
          title={empty.filteredTitle || text.filteredEmptyTitle}
          description={text.filteredEmptyDescription}
          action={{ label: text.clearFilters, onClick: onClearFilters }}
        />
      );
    }

    if (!loading && items.length === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <EmptyState
            illustration={empty.illustration || 'inbox'}
            title={empty.title || text.emptyTitle}
            description={empty.description}
            action={
              emptyActions[0] && {
                label: emptyActions[0].label,
                onClick: emptyActions[0].onClick,
                icon: emptyActions[0].icon,
              }
            }
          />
          {emptyActions[1] && (
            <Button variant="text" onClick={emptyActions[1].onClick} sx={{ mt: -3, mb: 3 }}>
              {emptyActions[1].label}
            </Button>
          )}
        </Box>
      );
    }

    // A custom body (a tree, a calendar) has no loading state of its own: the list holds it until the
    // first page arrives, so it never shows an empty tree that fills in later.
    if (body && loading && items.length === 0) {
      return (
        <Box className="stos-tab-state" role="status" aria-label={text.loading}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (body) {
      return body;
    }

    return (
      <EntityTable
        rows={items}
        columns={columns}
        loading={loading}
        viewMode={viewMode}
        pagination={pagination && { ...pagination, totalItems }}
        getActions={getActions}
        onOpen={onOpen}
        card={card}
        untitledLabel={untitledLabel}
        pageSizeOptions={pageSizeOptions}
        labels={labels}
        locale={locale}
      />
    );
  };

  return (
    <PageShell width="default">
      <ListPageHeader
        icon={icon}
        title={title}
        count={loading ? undefined : totalItems}
        description={description}
        actions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {secondaryActions.map((action) => (
              <ListActionButton key={action.id} action={action} variant="outlined" offlineReason={offlineReason} />
            ))}
            {primaryAction && <ListActionButton action={primaryAction} offlineReason={offlineReason} />}
          </Box>
        }
      />
      <FilterBar
        chips={chips}
        search={search}
        trailing={
          onViewModeChange && (
            <ViewModeSwitch
              value={viewMode}
              onChange={onViewModeChange}
              modes={viewModes}
              labels={labels}
              locale={locale}
            />
          )
        }
      />
      <Box sx={{ mt: 1.5 }}>
        <SavedCopyNotice visible={fromCache} labels={labels} locale={locale} />
        {renderBody()}
      </Box>
      {children}
    </PageShell>
  );
}

export default ListSurface;
