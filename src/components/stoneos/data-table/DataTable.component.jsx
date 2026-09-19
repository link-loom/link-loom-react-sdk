import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import {
  UnfoldLess as CollapseGroupIcon,
  UnfoldMore as ExpandGroupIcon,
  SettingsOutlined as EditStagesIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DataGrid from '../../datagrid/DataGrid.jsx';
import GroupHeader from '../group-header/GroupHeader.component.jsx';
import EmptyState from '../empty-state/EmptyState.component.jsx';
import TableFooter from './TableFooter.component.jsx';
import { STOS_TABLE_PRESET, STOS_TABLE_STYLE } from '../theme/stoneos.constants.js';

const UNGROUPED = '__ungrouped__';
const ADD_ROW_PREFIX = '__add-row__';
const EMPTY_DRAFT = Object.freeze({ title: '' });
const GROUP_PAGE_SIZE = 100;
export const STOS_ROW_DRAG_MIME = 'application/x-stos-row';

const DEFAULT_LABELS = {
  addRow: 'Add task',
  addChildPlaceholder: 'Subtask name',
  ungrouped: 'No status',
  empty: 'Nothing here',
  emptyHint: 'When there are records, they show up in this list.',
  expandGroup: 'Expand this group',
  collapseGroup: 'Collapse this group',
  collapseAll: 'Collapse all',
  expandAll: 'Expand all',
  editStages: 'Edit statuses',
};

const readPath = (row, path) =>
  String(path)
    .split('.')
    .reduce((value, key) => (value == null ? value : value[key]), row);

const toSet = (value) => {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  if (value && typeof value === 'object') {
    return new Set(Object.keys(value).filter((key) => value[key]));
  }
  return new Set();
};

const readDragId = (event) =>
  event?.dataTransfer?.getData?.(STOS_ROW_DRAG_MIME) ||
  event?.dataTransfer?.getData?.('text/plain') ||
  null;

function AddRow({ label, indent = 0, onOpen }) {
  return (
    <Box
      onClick={onOpen}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        height: 36,
        pl: 1.5 + indent,
        pr: 1.5,
        color: 'text.tertiary',
        fontSize: 12,
        cursor: 'pointer',
        borderRadius: 1,
        '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
      }}
    >
      <AddIcon sx={{ fontSize: 16 }} />
      <Box component="span">{label}</Box>
    </Box>
  );
}

/**
 * N SDK DataGrids (one per group, or one) with the `list` preset, nested child rows by row order
 * (`row.__tree`: depth, canExpand, expanded, groupKey, childCount, isAdd, composer) and ONE paginator.
 * Column renderers read `row.__tree` to draw chevrons, indents and the inline composer.
 */
function DataTable({
  rows = [],
  columns = [],
  rowCount,
  loading = false,
  preset = STOS_TABLE_PRESET,
  tableStyle,
  hideHeader,
  groupBy,
  groups,
  groupCounts,
  showEmptyGroups = true,
  collapsedGroups,
  onToggleGroup,
  onAddInGroup,
  onEditStages,
  onRowDropInGroup,
  addLabel,
  labels = {},
  footerLabels = {},
  actions,
  enableActions = false,
  onMenuItemClick,
  paginationMode,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [10, 20, 50],
  hideFooter = false,
  checkboxSelection,
  rowSelectionModel,
  onRowSelectionModelChange,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  onRowClick,
  getRowId,
  emptyState,
  stickyActions = true,
  parentKey = 'parent_id',
  expandedParents,
  composerParents,
  childrenByParent = {},
  onAddSubtask,
  subtasksMode = 'flat',
  getRowClassName,
  sx = {},
  ...gridRest
}) {
  const copy = { ...DEFAULT_LABELS, ...labels };
  const addText = addLabel ?? copy.addRow;
  const [internalCollapsedGroups, setInternalCollapsedGroups] = useState([]);
  const [openGroupComposer, setOpenGroupComposer] = useState(null);
  const [groupDrafts, setGroupDrafts] = useState({});
  const [internalPagination, setInternalPagination] = useState({
    page: 0,
    pageSize: pageSizeOptions[1] || 20,
  });
  const [draggingOver, setDraggingOver] = useState(null);
  const [internalExpandedEmpty, setInternalExpandedEmpty] = useState([]);

  const collapsedGroupSet = toSet(collapsedGroups ?? internalCollapsedGroups);
  const expandedParentSet = toSet(expandedParents);
  const composerParentSet = toSet(composerParents);
  const idOf = useCallback((row) => (getRowId ? getRowId(row) : row?.id), [getRowId]);

  const groupDraftFor = (key) => groupDrafts[key] || EMPTY_DRAFT;
  const patchGroupDraft = (key, fields) =>
    setGroupDrafts((previous) => ({
      ...previous,
      [key]: { ...(previous[key] || EMPTY_DRAFT), ...fields },
    }));
  const closeGroupComposer = (key) => {
    setOpenGroupComposer(null);
    setGroupDrafts((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const submitGroupDraft = async (key) => {
    const draft = groupDraftFor(key);
    if (!String(draft.title || '').trim()) return;
    await onAddInGroup?.(key, draft);
    patchGroupDraft(key, { title: '' });
  };

  useEffect(() => {
    const clear = () => setDraggingOver(null);
    window.addEventListener('dragend', clear);
    window.addEventListener('drop', clear);
    return () => {
      window.removeEventListener('dragend', clear);
      window.removeEventListener('drop', clear);
    };
  }, []);

  const groupKeyOf = useCallback(
    (row) => {
      if (!groupBy) return UNGROUPED;
      const key = typeof groupBy === 'function' ? groupBy(row) : readPath(row, groupBy);
      return key ?? UNGROUPED;
    },
    [groupBy],
  );

  const dropOnGroup = (groupKey, event) => {
    const id = readDragId(event);
    if (!id) return;
    const row = rows.find((item) => String(idOf(item)) === String(id));
    if (!row) return;
    if (!row[parentKey] && groupKeyOf(row) === groupKey) return;
    onRowDropInGroup?.(row, groupKey);
  };

  const isGroupCollapsed = (key, isEmpty) =>
    isEmpty ? !internalExpandedEmpty.includes(key) : collapsedGroupSet.has(key);

  const toggleGroup = (key, isEmpty) => {
    if (isEmpty && !onToggleGroup) {
      return setInternalExpandedEmpty((previous) =>
        previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key],
      );
    }
    if (onToggleGroup) return onToggleGroup(key);
    return setInternalCollapsedGroups((previous) =>
      previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key],
    );
  };

  const canCollapseAll = !onToggleGroup;

  const { hideHeader: styleHideHeader, ...mergedTableStyle } = useMemo(
    () => ({
      ...STOS_TABLE_STYLE,
      rowCursor: onRowClick ? 'pointer' : 'default',
      ...(tableStyle || {}),
    }),
    [tableStyle, onRowClick],
  );
  const headerHidden = hideHeader ?? styleHideHeader ?? false;

  const isServerPaginated =
    paginationMode === 'server' ||
    (paginationMode === undefined && typeof onPaginationModelChange === 'function');
  const effectivePagination = paginationModel || internalPagination;
  const setPagination = onPaginationModelChange || setInternalPagination;

  const { orderedByGroup, groupList } = useMemo(() => {
    const rowsById = new Map(rows.map((row) => [idOf(row), row]));
    const isHidden = subtasksMode === 'hidden';

    const inlineChildren = new Map();
    rows.forEach((row) => {
      const parentId = row?.[parentKey];
      if (!parentId || !rowsById.has(parentId)) return;
      if (!inlineChildren.has(parentId)) inlineChildren.set(parentId, []);
      inlineChildren.get(parentId).push(row);
    });

    const childrenOf = (id) => {
      const onPage = inlineChildren.get(id) || [];
      const fetched = childrenByParent[id] || [];
      const seen = new Set(onPage.map(idOf));
      return [...onPage, ...fetched.filter((child) => !seen.has(idOf(child)))];
    };

    const topLevel = rows.filter((row) => {
      const parentId = row?.[parentKey];
      if (!parentId) return true;
      if (isHidden) return false;
      return !rowsById.has(parentId);
    });

    const byGroup = new Map();
    const push = (key, decorated) => {
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key).push(decorated);
    };

    topLevel.forEach((row) => {
      const id = idOf(row);
      const parentId = row?.[parentKey];
      const canExpand = !isHidden && !parentId;
      const expanded = canExpand && expandedParentSet.has(id);
      const children = expanded ? childrenOf(id) : [];
      const key = groupKeyOf(row);

      push(key, {
        ...row,
        __tree: {
          depth: 0,
          canExpand,
          expanded,
          groupKey: key,
          childCount: row?.subtasks?.total ?? (inlineChildren.get(id) || []).length,
        },
      });

      if (!expanded) return;

      children.forEach((child) =>
        push(key, {
          ...child,
          __tree: { depth: 1, canExpand: false, expanded: false, groupKey: key, childCount: 0 },
        }),
      );

      const wantsComposer = children.length === 0 || composerParentSet.has(id);
      if (!onAddSubtask || !wantsComposer) return;

      push(key, {
        id: `${ADD_ROW_PREFIX}${id}`,
        __tree: { depth: 1, isAdd: true, parent: row, placeholder: copy.addChildPlaceholder },
      });
    });

    if (openGroupComposer && byGroup.has(openGroupComposer)) {
      byGroup.get(openGroupComposer).push({
        id: `${ADD_ROW_PREFIX}group:${openGroupComposer}`,
        __tree: { depth: 0, isAdd: true, group: openGroupComposer, placeholder: `${addText}…` },
      });
    }

    const declared =
      Array.isArray(groups) && groups.length
        ? groups
        : [...byGroup.keys()]
            .filter((key) => key !== UNGROUPED)
            .map((key) => ({ key, label: String(key) }));
    const declaredKeys = new Set(declared.map((group) => group.key));
    const extra = [...byGroup.keys()].filter((key) => !declaredKeys.has(key));
    const list = groupBy
      ? [
          ...declared,
          ...extra.map((key) => ({
            key,
            label: key === UNGROUPED ? copy.ungrouped : String(key),
          })),
        ]
      : [{ key: UNGROUPED, label: null }];

    return { orderedByGroup: byGroup, groupList: list };
  }, [
    rows,
    groups,
    groupBy,
    groupKeyOf,
    idOf,
    parentKey,
    subtasksMode,
    expandedParentSet,
    childrenByParent,
    onAddSubtask,
    composerParentSet,
    openGroupComposer,
    addText,
    copy.addChildPlaceholder,
    copy.ungrouped,
  ]);

  const selectionFor = (gridRows) => {
    if (!rowSelectionModel) return undefined;
    const ids = new Set(gridRows.map(idOf));
    return rowSelectionModel.filter((id) => ids.has(id));
  };

  const handleSelection = (gridRows) => (next) => {
    if (!onRowSelectionModelChange) return;
    const ids = new Set(gridRows.map(idOf));
    const kept = (rowSelectionModel || []).filter((id) => !ids.has(id));
    onRowSelectionModelChange([...kept, ...next]);
  };

  const rowClassName = (params) => {
    const tree = params.row?.__tree || {};
    const own = [tree.isAdd ? 'stos-row--add' : null, tree.depth ? 'stos-row--child' : null]
      .filter(Boolean)
      .join(' ');
    const caller = getRowClassName ? getRowClassName(params) : '';
    return [caller, own].filter(Boolean).join(' ');
  };

  const isAddRow = (row) => Boolean(row?.__tree?.isAdd);

  const withGroupComposer = (gridRows) =>
    gridRows.map((row) => {
      const groupKey = row?.__tree?.group;
      if (!groupKey) return row;

      return {
        ...row,
        __tree: {
          ...row.__tree,
          composer: {
            draft: groupDraftFor(groupKey),
            onChange: (fields) => patchGroupDraft(groupKey, fields),
            onSubmit: () => submitGroupDraft(groupKey),
            onCancel: () => closeGroupComposer(groupKey),
          },
        },
      };
    });

  const renderGrid = (gridRows, { key = 'grid' } = {}) => (
    <DataGrid
      key={key}
      rows={withGroupComposer(gridRows)}
      columns={columns}
      preset={preset}
      tableStyle={mergedTableStyle}
      hideHeader={headerHidden}
      autoHeight
      hideFooter
      loading={loading}
      actions={actions}
      enableActions={enableActions}
      onMenuItemClick={onMenuItemClick}
      checkboxSelection={checkboxSelection ?? Boolean(rowSelectionModel)}
      disableRowSelectionOnClick
      rowSelectionModel={selectionFor(gridRows)}
      onRowSelectionModelChange={handleSelection(gridRows)}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={onColumnVisibilityModelChange}
      getRowClassName={rowClassName}
      onRowClick={
        onRowClick
          ? (params, event) => !isAddRow(params.row) && onRowClick(params.row, event)
          : undefined
      }
      getRowId={getRowId}
      paginationMode="client"
      paginationModel={{ page: 0, pageSize: GROUP_PAGE_SIZE }}
      pageSizeOptions={[GROUP_PAGE_SIZE]}
      sortingMode="server"
      {...gridRest}
    />
  );

  const isEmpty = !loading && rows.length === 0;
  const totalCount = rowCount ?? rows.length;
  const showFooter =
    !hideFooter &&
    (isServerPaginated
      ? true
      : totalCount > effectivePagination.pageSize || effectivePagination.page > 0);

  const renderGroups = () => {
    const visibleGroups = groupList.filter((group) => {
      const count = (orderedByGroup.get(group.key) || []).length;
      return count > 0 || (groupCounts?.[group.key] || 0) > 0 || showEmptyGroups;
    });

    const collapseAll = () =>
      setInternalCollapsedGroups(visibleGroups.map((group) => group.key));
    const expandAll = () => setInternalCollapsedGroups([]);

    return visibleGroups.map((group) => {
      const gridRows = orderedByGroup.get(group.key) || [];
      const composerOpen = openGroupComposer === group.key;
      const pageCount = gridRows.filter((row) => !row.__tree?.depth && !row.__tree?.isAdd).length;
      const total = groupCounts?.[group.key];
      const isEmptyGroup = pageCount === 0 && !(total > 0);
      const collapsed = isGroupCollapsed(group.key, isEmptyGroup);
      const canAdd = onAddInGroup && group.key !== UNGROUPED;
      const isDropTarget = draggingOver === group.key;

      const menuItems = [
        canAdd && {
          id: 'add',
          label: addText,
          icon: AddIcon,
          onClick: () => setOpenGroupComposer(group.key),
        },
        {
          id: 'toggle',
          label: collapsed ? copy.expandGroup : copy.collapseGroup,
          icon: collapsed ? ExpandGroupIcon : CollapseGroupIcon,
          dividerBefore: Boolean(canAdd),
          onClick: () => toggleGroup(group.key, isEmptyGroup),
        },
        canCollapseAll && {
          id: 'collapse-all',
          label: copy.collapseAll,
          icon: CollapseGroupIcon,
          onClick: collapseAll,
        },
        canCollapseAll && {
          id: 'expand-all',
          label: copy.expandAll,
          icon: ExpandGroupIcon,
          onClick: expandAll,
        },
        onEditStages && {
          id: 'edit-stages',
          label: copy.editStages,
          icon: EditStagesIcon,
          dividerBefore: true,
          onClick: onEditStages,
        },
      ].filter(Boolean);

      const dropHandlers = onRowDropInGroup
        ? {
            onDragOver: (event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDraggingOver(group.key);
            },
            onDragLeave: (event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setDraggingOver(null);
            },
            onDrop: (event) => {
              event.preventDefault();
              setDraggingOver(null);
              dropOnGroup(group.key, event);
            },
          }
        : {};

      return (
        <Box
          key={group.key}
          className="stos-group"
          {...dropHandlers}
          sx={{
            mb: 2,
            borderRadius: 'var(--stos-radius-md, 8px)',
            backgroundColor: isDropTarget ? 'var(--stos-drop-bg)' : 'transparent',
            boxShadow: isDropTarget ? 'inset 0 0 0 1px var(--stos-drop-ring)' : 'none',
            transition: 'background-color 140ms ease-in-out, box-shadow 140ms ease-in-out',
          }}
        >
          <GroupHeader
            stage={
              group.stage ||
              (group.key === UNGROUPED
                ? null
                : { key: group.key, title: group.label, color: group.color })
            }
            label={group.label || undefined}
            color={group.color}
            count={typeof total === 'number' ? total : pageCount}
            pageCount={pageCount}
            collapsed={collapsed}
            onToggle={() => toggleGroup(group.key, isEmptyGroup)}
            onAdd={canAdd ? () => setOpenGroupComposer(group.key) : undefined}
            addLabel={addText}
            expandLabel={copy.expandGroup}
            collapseLabel={copy.collapseGroup}
            menuItems={menuItems}
          />
          {!collapsed && gridRows.length > 0 && renderGrid(gridRows, { key: `grid-${group.key}` })}
          {!collapsed && canAdd && !composerOpen && (
            <AddRow label={addText} indent={1} onOpen={() => setOpenGroupComposer(group.key)} />
          )}
        </Box>
      );
    });
  };

  const renderBody = () => {
    if (isEmpty) {
      return (
        emptyState || (
          <EmptyState
            illustration="inbox"
            size="inline"
            title={copy.empty}
            description={copy.emptyHint}
          />
        )
      );
    }

    if (groupBy) {
      return renderGroups();
    }

    const all = orderedByGroup.get(UNGROUPED) || [];
    const pageRows = isServerPaginated
      ? all
      : all.slice(
          effectivePagination.page * effectivePagination.pageSize,
          (effectivePagination.page + 1) * effectivePagination.pageSize,
        );
    return renderGrid(pageRows);
  };

  return (
    <Box
      className="stos-data-table"
      sx={{
        width: '100%',
        minWidth: 0,
        '& .MuiDataGrid-row.stos-row--child': { backgroundColor: 'transparent' },
        '& .MuiDataGrid-row.stos-row--add .MuiDataGrid-cell[data-field="actions"] > *': {
          display: 'none',
        },
        '& .MuiDataGrid-row.stos-row--add': { cursor: 'default' },
        ...(stickyActions
          ? {
              '& .MuiDataGrid-cell[data-field="actions"], & .MuiDataGrid-columnHeader[data-field="actions"]':
                {
                  position: 'sticky',
                  right: 0,
                  zIndex: 3,
                  backgroundColor: 'var(--stos-table-surface)',
                },
              '& .MuiDataGrid-row:hover .MuiDataGrid-cell[data-field="actions"]': {
                backgroundColor: 'var(--stos-bg-hover)',
              },
              '& .MuiDataGrid-virtualScroller--hasScrollX .MuiDataGrid-cell[data-field="actions"]': {
                borderLeft: '1px solid var(--stos-border)',
              },
            }
          : {}),
        '& .MuiDataGrid-scrollbar': {
          opacity: 0,
          transition: 'opacity 150ms ease-in-out',
          '&::-webkit-scrollbar': { height: 6, width: 6 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--stos-border-strong)',
            borderRadius: 999,
          },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
        },
        '& .MuiDataGrid-main': { paddingBottom: '20px' },
        '& .MuiDataGrid-scrollbar--horizontal': { height: 6 },
        '& .MuiDataGrid-root:hover .MuiDataGrid-scrollbar, & .MuiDataGrid-scrollbar:hover, & .MuiDataGrid-scrollbar:focus-within':
          { opacity: 1 },
        ...sx,
      }}
    >
      {renderBody()}

      {!isEmpty && showFooter && (
        <TableFooter
          count={totalCount}
          page={effectivePagination.page}
          pageSize={effectivePagination.pageSize}
          pageSizeOptions={pageSizeOptions}
          onChange={setPagination}
          {...footerLabels}
        />
      )}
    </Box>
  );
}

export default DataTable;
