import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Box, IconButton, alpha, useTheme } from '@mui/material';
import { AddOutlined, FitScreenOutlined, RemoveOutlined } from '@mui/icons-material';
import {
  FLOOR_PLAN_CHANGE_TYPES,
  FLOOR_PLAN_CORNERS,
  FLOOR_PLAN_DEFAULTS,
  FLOOR_PLAN_MODES,
  FLOOR_PLAN_SHAPES,
  FLOOR_PLAN_TONES,
} from './floorPlan.constants.js';
import {
  changedIds,
  contentBounds,
  exceedsSlop,
  fitViewport,
  itemBounds,
  itemCenter,
  moveItem,
  panViewport,
  pinchViewport,
  placeItem,
  planSignature,
  resizeItem,
  resolveExtent,
  rotateItem,
  screenToWorld,
  touchScaleOf,
  zoomViewport,
} from './floorPlan.geometry.js';
import { canRedo, canUndo, createHistory, recordHistory, redoHistory, undoHistory } from './floorPlan.history.js';
import { resolveFloorPlanLabels } from './floorPlan.labels.js';

const TONE_PALETTE = {
  [FLOOR_PLAN_TONES.BRAND]: 'primary',
  [FLOOR_PLAN_TONES.SUCCESS]: 'success',
  [FLOOR_PLAN_TONES.WARNING]: 'warning',
  [FLOOR_PLAN_TONES.DANGER]: 'error',
  [FLOOR_PLAN_TONES.INFO]: 'info',
};

const ROLES = Object.freeze({ ITEM: 'item', RESIZE: 'resize', ROTATE: 'rotate' });
const GESTURES = Object.freeze({
  PRESS: 'press',
  PAN: 'pan',
  PINCH: 'pinch',
  MOVE: FLOOR_PLAN_CHANGE_TYPES.MOVE,
  RESIZE: FLOOR_PLAN_CHANGE_TYPES.RESIZE,
  ROTATE: FLOOR_PLAN_CHANGE_TYPES.ROTATE,
});
const CORNER_CURSORS = {
  [FLOOR_PLAN_CORNERS.NW]: 'nwse-resize',
  [FLOOR_PLAN_CORNERS.SE]: 'nwse-resize',
  [FLOOR_PLAN_CORNERS.NE]: 'nesw-resize',
  [FLOOR_PLAN_CORNERS.SW]: 'nesw-resize',
};
const NEW_ITEM_PREFIX = 'new-';
const WHEEL_ZOOM_SPEED = 0.0015;
const WHEEL_LINE_PIXELS = 16;
const BUTTON_ZOOM_FACTOR = 1.25;
const ARROW_STEPS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

const toneColor = (theme, tone) => {
  const paletteKey = TONE_PALETTE[tone];
  if (paletteKey) {
    return theme.palette[paletteKey].main;
  }
  return tone === FLOOR_PLAN_TONES.MUTED ? theme.palette.text.disabled : theme.palette.text.secondary;
};

const prefersCoarsePointer = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

function ShapeBody({ shape, width, height, inset = 0, ...paint }) {
  const innerWidth = width - inset * 2;
  const innerHeight = height - inset * 2;
  if (shape === FLOOR_PLAN_SHAPES.ROUND) {
    return <ellipse rx={innerWidth / 2} ry={innerHeight / 2} {...paint} />;
  }
  const radius = shape === FLOOR_PLAN_SHAPES.ROUNDED ? Math.min(innerWidth, innerHeight) * 0.22 : 3;
  return <rect x={-innerWidth / 2} y={-innerHeight / 2} width={innerWidth} height={innerHeight} rx={radius} {...paint} />;
}

function PlanItem({ item, cellSize, scale, compact, touchTargets, color, selected, dimmed, lifted, showLabels, textColor, cursor }) {
  const width = item.width * cellSize;
  const height = item.height * cellSize;
  const center = itemCenter(item);
  const fontSize = Math.min(Math.max(Math.min(width, height) * 0.32, 9), 18);
  const hasSublabel = item.sublabel !== undefined && item.sublabel !== null && item.sublabel !== '';
  const touchSize = FLOOR_PLAN_DEFAULTS.touchTarget / scale;
  const labelsReadable = !compact || fontSize * scale >= FLOOR_PLAN_DEFAULTS.labelMinScreenPx;
  const drawLabels = showLabels && labelsReadable;

  return (
    <g
      transform={`translate(${center.x * cellSize} ${center.y * cellSize})`}
      data-fp-role={ROLES.ITEM}
      data-fp-id={item.id}
      role="button"
      aria-label={item.ariaLabel || item.label}
      aria-pressed={selected}
      opacity={dimmed ? 0.35 : 1}
      style={{ cursor }}
    >
      <g transform={`rotate(${item.rotation || 0})${lifted ? ' scale(1.04)' : ''}`}>
        {touchTargets && (
          <rect
            x={-Math.max(width, touchSize) / 2}
            y={-Math.max(height, touchSize) / 2}
            width={Math.max(width, touchSize)}
            height={Math.max(height, touchSize)}
            fill="transparent"
          />
        )}
        <ShapeBody
          shape={item.shape}
          width={width}
          height={height}
          inset={1.5}
          fill={alpha(color, 0.14)}
          stroke={color}
          strokeWidth={selected || lifted ? 2.5 : 1.5}
        />
      </g>
      {drawLabels && item.label && (
        <text
          y={hasSublabel ? -fontSize * 0.3 : 0}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={600}
          fill={textColor}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {item.label}
        </text>
      )}
      {drawLabels && hasSublabel && (
        <text
          y={fontSize * 0.8}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize * 0.75}
          fill={textColor}
          opacity={0.7}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {item.sublabel}
        </text>
      )}
    </g>
  );
}

// The live layer: a ring in the state's tone, a badge on the corner and a caption under the item. It reads
// from `overlay[item.id]` and never changes the plan, so a host can draw its own state on top of the plan.
function PlanOverlay({ item, cellSize, entry, theme }) {
  const bounds = itemBounds(item);
  const width = item.width * cellSize;
  const height = item.height * cellSize;
  const center = itemCenter(item);
  const color = toneColor(theme, entry.tone);
  const badgeX = (bounds.x + bounds.width) * cellSize - 2;
  const badgeY = bounds.y * cellSize + 2;

  return (
    <g style={{ pointerEvents: 'none' }}>
      <g transform={`translate(${center.x * cellSize} ${center.y * cellSize}) rotate(${item.rotation || 0})`}>
        <ShapeBody shape={item.shape} width={width} height={height} inset={-1} fill="none" stroke={color} strokeWidth={3} />
      </g>
      {entry.badge !== undefined && entry.badge !== null && entry.badge !== '' && (
        <g transform={`translate(${badgeX} ${badgeY})`}>
          <circle r={10} fill={color} stroke={theme.palette.background.paper} strokeWidth={2} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600} fill={theme.palette.background.paper}>
            {entry.badge}
          </text>
        </g>
      )}
      {entry.caption && (
        <text
          x={center.x * cellSize}
          y={(bounds.y + bounds.height) * cellSize + 12}
          textAnchor="middle"
          fontSize={10}
          fontWeight={500}
          fill={color}
        >
          {entry.caption}
        </text>
      )}
    </g>
  );
}

function SelectionHandles({ item, cellSize, scale, theme, canRotate, labels, hitRadius }) {
  const width = item.width * cellSize;
  const height = item.height * cellSize;
  const center = itemCenter(item);
  const accent = theme.palette.primary.main;
  const dotRadius = 5 / scale;
  const hit = hitRadius / scale;
  const stem = 26 / scale;
  const corners = [
    [FLOOR_PLAN_CORNERS.NW, -width / 2, -height / 2],
    [FLOOR_PLAN_CORNERS.NE, width / 2, -height / 2],
    [FLOOR_PLAN_CORNERS.SE, width / 2, height / 2],
    [FLOOR_PLAN_CORNERS.SW, -width / 2, height / 2],
  ];

  return (
    <g transform={`translate(${center.x * cellSize} ${center.y * cellSize}) rotate(${item.rotation || 0})`}>
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill="none"
        stroke={accent}
        strokeWidth={1}
        strokeDasharray="4 3"
        vectorEffect="non-scaling-stroke"
        style={{ pointerEvents: 'none' }}
      />
      {canRotate && (
        <g>
          <line x1={0} y1={-height / 2} x2={0} y2={-height / 2 - stem} stroke={accent} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <circle cx={0} cy={-height / 2 - stem} r={dotRadius} fill={theme.palette.background.paper} stroke={accent} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <circle
            cx={0}
            cy={-height / 2 - stem}
            r={hit}
            fill="transparent"
            data-fp-role={ROLES.ROTATE}
            data-fp-id={item.id}
            aria-label={labels.rotate}
            style={{ cursor: 'grab' }}
          />
        </g>
      )}
      {corners.map(([corner, cornerX, cornerY]) => (
        <g key={corner}>
          <circle cx={cornerX} cy={cornerY} r={dotRadius} fill={theme.palette.background.paper} stroke={accent} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <circle
            cx={cornerX}
            cy={cornerY}
            r={hit}
            fill="transparent"
            data-fp-role={ROLES.RESIZE}
            data-fp-id={item.id}
            data-fp-corner={corner}
            aria-label={labels.resize}
            style={{ cursor: CORNER_CURSORS[corner] }}
          />
        </g>
      ))}
    </g>
  );
}

const readTarget = (element) => {
  const node = element && typeof element.closest === 'function' ? element.closest('[data-fp-role]') : null;
  if (!node) {
    return null;
  }
  return { role: node.getAttribute('data-fp-role'), id: node.getAttribute('data-fp-id'), corner: node.getAttribute('data-fp-corner') };
};

// A floor plan on an SVG grid: shapes, zoom and pan, drag (a half-second press on touch), resize, rotate,
// undo and redo, a read mode and an edit mode, and a live overlay layer.
//
// `items` is controlled. Every released gesture calls `onChange(nextItems, { type, ids })` once and the
// host stores it (optimistically) and passes it back; undo and redo go through the same callback. A host
// that replaces `items` with something other than what it was last given starts a new history.
//
// Item: `{ id, shape, x, y, width, height, rotation, label, sublabel, tone, locked }` (cells, degrees).
// `overlay`: `{ [itemId]: { tone, badge, caption } }`, shown in read mode unless `showOverlay` says otherwise.
// `placing`: an item template (shape, size, label...) while a tool is armed; a tap on the plan adds it.
// Ref: `undo()`, `redo()`, `removeSelected()`, `fit()`, `zoomIn()`, `zoomOut()`.
const FloorPlanCanvas = forwardRef(function FloorPlanCanvas(
  {
    items = [],
    mode = FLOOR_PLAN_MODES.READ,
    columns = FLOOR_PLAN_DEFAULTS.columns,
    rows = FLOOR_PLAN_DEFAULTS.rows,
    cellSize = FLOOR_PLAN_DEFAULTS.cellSize,
    selectedId = null,
    highlightIds = null,
    overlay = null,
    showOverlay,
    placing = null,
    loading = false,
    interactive = true,
    showGrid = true,
    showLabels = true,
    showControls = true,
    fitKey,
    longPressMs = FLOOR_PLAN_DEFAULTS.longPressMs,
    minScale = FLOOR_PLAN_DEFAULTS.minScale,
    maxScale = FLOOR_PLAN_DEFAULTS.maxScale,
    onSelect,
    onChange,
    onHistoryChange,
    labels,
    locale = 'en',
    sx,
  },
  ref,
) {
  const theme = useTheme();
  const copy = useMemo(() => resolveFloorPlanLabels(labels, locale), [labels, locale]);
  const isEdit = mode === FLOOR_PLAN_MODES.EDIT && interactive && !loading;
  const overlayVisible = showOverlay === undefined ? !isEdit : showOverlay;
  const limits = useMemo(() => ({ ...FLOOR_PLAN_DEFAULTS, minScale, maxScale }), [minScale, maxScale]);
  const extent = useMemo(() => resolveExtent(items, columns, rows), [items, columns, rows]);

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const timerRef = useRef(null);
  const wheelRef = useRef(null);
  const historyRef = useRef(createHistory());
  const headRef = useRef(items);
  const itemsRef = useRef(items);
  const viewportRef = useRef({ scale: 1, x: 0, y: 0 });
  const fittedRef = useRef({ key: undefined, done: false, hadItems: false });
  const touchedRef = useRef(false);
  const newItemCounterRef = useRef(0);
  const coarsePointerRef = useRef(prefersCoarsePointer());

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [viewport, setViewport] = useState(viewportRef.current);
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);
  const [armedId, setArmedId] = useState(null);
  const [panning, setPanning] = useState(false);
  const [hoverCell, setHoverCell] = useState(null);
  const [historyInfo, setHistoryInfo] = useState({ canUndo: false, canRedo: false });

  const updateDraft = (item) => {
    draftRef.current = item ? { item } : null;
    setDraft(draftRef.current);
  };
  const gridPatternId = useMemo(() => `floor-plan-grid-${Math.random().toString(36).slice(2, 9)}`, []);

  viewportRef.current = viewport;
  itemsRef.current = items;

  const shownItems = useMemo(
    () => (draft ? items.map((item) => (item.id === draft.item.id ? draft.item : item)) : items),
    [items, draft],
  );

  const syncHistory = useCallback(() => {
    setHistoryInfo({ canUndo: canUndo(historyRef.current), canRedo: canRedo(historyRef.current) });
  }, []);

  useEffect(() => {
    if (planSignature(items) !== planSignature(headRef.current)) {
      historyRef.current = createHistory();
      syncHistory();
    }
    headRef.current = items;
  }, [items, syncHistory]);

  useEffect(() => {
    if (typeof onHistoryChange === 'function') {
      onHistoryChange(historyInfo);
    }
  }, [historyInfo, onHistoryChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    const measure = () => {
      const box = container.getBoundingClientRect();
      setSize((previous) =>
        previous.width === box.width && previous.height === box.height ? previous : { width: box.width, height: box.height },
      );
    };
    measure();
    if (typeof ResizeObserver !== 'function') {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const compact = size.width > 0 && size.width < limits.compactWidth;
  const touchTargets = compact || coarsePointerRef.current;

  // The button and the ref show everything.
  const fit = useCallback(() => {
    if (!size.width || !size.height) {
      return;
    }
    setViewport(fitViewport(contentBounds(itemsRef.current, extent, cellSize), size, limits));
  }, [size, extent, cellSize, limits]);

  // The first view: the same fit, except that on a phone it does not go under the scale that keeps every shape
  // touchable, and the person pans to the rest.
  const fitStart = useCallback(() => {
    if (!size.width || !size.height) {
      return;
    }
    const floorScale = compact ? touchScaleOf(itemsRef.current, cellSize, limits.touchTarget) : 0;
    setViewport(fitViewport(contentBounds(itemsRef.current, extent, cellSize), size, limits, floorScale));
  }, [size, extent, cellSize, limits, compact]);

  const hasItems = items.length > 0;
  useEffect(() => {
    if (!size.width || !size.height) {
      return;
    }
    const fitted = fittedRef.current;
    const firstFit = !fitted.done || fitted.key !== fitKey;
    const itemsArrived = !fitted.hadItems && hasItems && !touchedRef.current;
    fitted.hadItems = hasItems;
    if (!firstFit && !itemsArrived) {
      return;
    }
    fittedRef.current = { key: fitKey, done: true, hadItems: hasItems };
    touchedRef.current = false;
    fitStart();
  }, [size.width, size.height, fitKey, hasItems, fitStart]);

  const toLocal = (event) => {
    const box = svgRef.current.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  const toCell = (point) => {
    const world = screenToWorld(viewportRef.current, point);
    return { x: world.x / cellSize, y: world.y / cellSize };
  };

  const commit = (nextItems, change) => {
    historyRef.current = recordHistory(historyRef.current, headRef.current);
    headRef.current = nextItems;
    syncHistory();
    if (typeof onChange === 'function') {
      onChange(nextItems, change);
    }
  };

  const travel = (step, type) => {
    const result = step(historyRef.current, headRef.current);
    if (!result) {
      return;
    }
    const previous = headRef.current;
    historyRef.current = result.history;
    headRef.current = result.items;
    syncHistory();
    if (typeof onChange === 'function') {
      onChange(result.items, { type, ids: changedIds(previous, result.items) });
    }
  };

  const undo = () => travel(undoHistory, FLOOR_PLAN_CHANGE_TYPES.UNDO);
  const redo = () => travel(redoHistory, FLOOR_PLAN_CHANGE_TYPES.REDO);

  const removeSelected = () => {
    const target = itemsRef.current.find((item) => item.id === selectedId);
    if (!isEdit || !target || target.locked) {
      return;
    }
    commit(
      itemsRef.current.filter((item) => item.id !== selectedId),
      { type: FLOOR_PLAN_CHANGE_TYPES.REMOVE, ids: [selectedId] },
    );
  };

  const zoomBy = (factor) => {
    touchedRef.current = true;
    setViewport((current) => zoomViewport(current, factor, { x: size.width / 2, y: size.height / 2 }, limits));
  };

  useImperativeHandle(ref, () => ({
    undo,
    redo,
    removeSelected,
    fit,
    zoomIn: () => zoomBy(BUTTON_ZOOM_FACTOR),
    zoomOut: () => zoomBy(1 / BUTTON_ZOOM_FACTOR),
  }));

  wheelRef.current = (event) => {
    event.preventDefault();
    touchedRef.current = true;
    const unit = event.deltaMode === 1 ? WHEEL_LINE_PIXELS : 1;
    const point = toLocal(event);
    setViewport((current) => zoomViewport(current, Math.exp(-event.deltaY * unit * WHEEL_ZOOM_SPEED), point, limits));
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !interactive) {
      return undefined;
    }
    const listener = (event) => wheelRef.current(event);
    svg.addEventListener('wheel', listener, { passive: false });
    return () => svg.removeEventListener('wheel', listener);
  }, [interactive]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const place = (point) => {
    const id = placing.id ?? `${NEW_ITEM_PREFIX}${(newItemCounterRef.current += 1)}`;
    const created = placeItem({ ...placing, id }, toCell(point), extent);
    commit([...itemsRef.current, created], { type: FLOOR_PLAN_CHANGE_TYPES.ADD, ids: [id] });
  };

  const handleTap = (gesture, point) => {
    if (loading) {
      return;
    }
    if (gesture.targetId) {
      onSelect?.(gesture.targetId);
      return;
    }
    if (isEdit && placing) {
      place(point);
      return;
    }
    onSelect?.(null);
  };

  const finishEdit = (gesture) => {
    const edited = draftRef.current ? draftRef.current.item : null;
    updateDraft(null);
    if (!edited) {
      return;
    }
    const original = gesture.startItem;
    if (planSignature([edited]) === planSignature([original])) {
      return;
    }
    commit(
      itemsRef.current.map((item) => (item.id === edited.id ? edited : item)),
      { type: gesture.kind, ids: [edited.id] },
    );
  };

  const releaseGesture = () => {
    clearTimeout(timerRef.current);
    gestureRef.current = null;
    setArmedId(null);
    setPanning(false);
  };

  const beginPinch = () => {
    const [first, second] = [...pointersRef.current.values()];
    clearTimeout(timerRef.current);
    updateDraft(null);
    setArmedId(null);
    gestureRef.current = {
      kind: GESTURES.PINCH,
      startViewport: viewportRef.current,
      startDistance: Math.hypot(second.x - first.x, second.y - first.y),
      startMidpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
    };
  };

  const beginSingle = (event, point) => {
    const target = loading ? null : readTarget(event.target);
    const base = { pointerId: event.pointerId, pointerType: event.pointerType, startPoint: point, startViewport: viewportRef.current };
    const startItem = target ? itemsRef.current.find((item) => item.id === target.id) : null;
    const editable = isEdit && startItem && !startItem.locked;

    if (editable && target.role === ROLES.RESIZE) {
      gestureRef.current = { ...base, kind: GESTURES.RESIZE, startItem, corner: target.corner };
      return;
    }
    if (editable && target.role === ROLES.ROTATE) {
      gestureRef.current = { ...base, kind: GESTURES.ROTATE, startItem };
      return;
    }

    const canDrag = Boolean(editable && target.role === ROLES.ITEM && !placing);
    const gesture = { ...base, kind: GESTURES.PRESS, targetId: target ? target.id : null, startItem, canDrag, armed: false };
    gestureRef.current = gesture;
    if (!canDrag || event.pointerType === 'mouse') {
      return;
    }
    timerRef.current = setTimeout(() => {
      if (gestureRef.current !== gesture || gesture.kind !== GESTURES.PRESS) {
        return;
      }
      gesture.armed = true;
      setArmedId(gesture.targetId);
      onSelect?.(gesture.targetId);
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(10);
      }
    }, longPressMs);
  };

  const handlePointerDown = (event) => {
    if (!interactive || (event.pointerType === 'mouse' && event.button > 0)) {
      return;
    }
    svgRef.current.focus?.({ preventScroll: true });
    svgRef.current.setPointerCapture?.(event.pointerId);
    touchedRef.current = true;
    const point = toLocal(event);
    pointersRef.current.set(event.pointerId, point);
    if (pointersRef.current.size === 2) {
      beginPinch();
      return;
    }
    if (pointersRef.current.size > 2) {
      return;
    }
    beginSingle(event, point);
  };

  const advanceGesture = (gesture, point) => {
    const deltaX = point.x - gesture.startPoint.x;
    const deltaY = point.y - gesture.startPoint.y;

    if (gesture.kind === GESTURES.PAN) {
      setViewport(panViewport(gesture.startViewport, deltaX, deltaY));
      return;
    }
    if (gesture.kind === GESTURES.MOVE) {
      const scaleToCells = gesture.startViewport.scale * cellSize;
      updateDraft(moveItem(gesture.startItem, deltaX / scaleToCells, deltaY / scaleToCells, extent));
      return;
    }
    if (gesture.kind === GESTURES.RESIZE) {
      updateDraft(resizeItem(gesture.startItem, gesture.corner, toCell(point), extent));
      return;
    }
    if (gesture.kind === GESTURES.ROTATE) {
      updateDraft(rotateItem(gesture.startItem, toCell(point)));
    }
  };

  const promotePress = (gesture, point) => {
    if (!exceedsSlop(gesture.startPoint, point)) {
      return;
    }
    clearTimeout(timerRef.current);
    const dragsItem = gesture.canDrag && (gesture.armed || gesture.pointerType === 'mouse');
    gesture.kind = dragsItem ? GESTURES.MOVE : GESTURES.PAN;
    setPanning(!dragsItem);
    if (dragsItem && selectedId !== gesture.targetId) {
      onSelect?.(gesture.targetId);
    }
    advanceGesture(gesture, point);
  };

  const handlePointerMove = (event) => {
    if (!interactive) {
      return;
    }
    const point = toLocal(event);
    if (!pointersRef.current.has(event.pointerId)) {
      if (isEdit && placing && event.pointerType === 'mouse') {
        const cell = toCell(point);
        setHoverCell(placeItem(placing, cell, extent));
      }
      return;
    }
    pointersRef.current.set(event.pointerId, point);
    const gesture = gestureRef.current;
    if (!gesture) {
      return;
    }
    if (gesture.kind === GESTURES.PINCH) {
      const [first, second] = [...pointersRef.current.values()];
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      setViewport(pinchViewport(gesture.startViewport, gesture.startMidpoint, gesture.startDistance, midpoint, distance, limits));
      return;
    }
    if (event.pointerId !== gesture.pointerId) {
      return;
    }
    if (gesture.kind === GESTURES.PRESS) {
      promotePress(gesture, point);
      return;
    }
    advanceGesture(gesture, point);
  };

  const handlePointerUp = (event) => {
    const point = pointersRef.current.get(event.pointerId);
    pointersRef.current.delete(event.pointerId);
    const gesture = gestureRef.current;
    if (!gesture) {
      return;
    }
    if (gesture.kind === GESTURES.PINCH) {
      const remaining = [...pointersRef.current.entries()];
      if (remaining.length !== 1) {
        releaseGesture();
        return;
      }
      const [pointerId, position] = remaining[0];
      gestureRef.current = { kind: GESTURES.PAN, pointerId, startPoint: position, startViewport: viewportRef.current };
      return;
    }
    if (event.pointerId !== gesture.pointerId) {
      return;
    }
    releaseGesture();
    if (event.type === 'pointercancel') {
      updateDraft(null);
      return;
    }
    if (gesture.kind === GESTURES.PRESS) {
      handleTap(gesture, point || gesture.startPoint);
      return;
    }
    if (gesture.kind === GESTURES.MOVE || gesture.kind === GESTURES.RESIZE || gesture.kind === GESTURES.ROTATE) {
      finishEdit(gesture);
    }
  };

  const handlePointerLeave = () => setHoverCell(null);

  const handleKeyDown = (event) => {
    const modifier = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();
    if (modifier && key === 'z') {
      event.preventDefault();
      (event.shiftKey ? redo : undo)();
      return;
    }
    if (modifier && key === 'y') {
      event.preventDefault();
      redo();
      return;
    }
    if (event.key === 'Escape') {
      onSelect?.(null);
      return;
    }
    if (event.key === '+' || event.key === '=') {
      zoomBy(BUTTON_ZOOM_FACTOR);
      return;
    }
    if (event.key === '-') {
      zoomBy(1 / BUTTON_ZOOM_FACTOR);
      return;
    }
    const selected = isEdit ? itemsRef.current.find((item) => item.id === selectedId) : null;
    if (!selected || selected.locked) {
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      removeSelected();
      return;
    }
    const step = ARROW_STEPS[event.key];
    if (!step) {
      return;
    }
    event.preventDefault();
    const moved = moveItem(selected, step[0], step[1], extent);
    if (planSignature([moved]) === planSignature([selected])) {
      return;
    }
    commit(
      itemsRef.current.map((item) => (item.id === selected.id ? moved : item)),
      { type: FLOOR_PLAN_CHANGE_TYPES.MOVE, ids: [selected.id] },
    );
  };

  const highlight = highlightIds ? new Set(highlightIds) : null;
  const ordered = useMemo(
    () => [...shownItems].sort((first, second) => Number(first.id === selectedId) - Number(second.id === selectedId)),
    [shownItems, selectedId],
  );
  const selectedItem = isEdit ? shownItems.find((item) => item.id === selectedId) : null;
  const itemCursor = isEdit ? 'move' : 'pointer';
  const surfaceCursor = panning ? 'grabbing' : isEdit && placing ? 'crosshair' : 'default';
  const textColor = theme.palette.text.primary;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 240,
        overflow: 'hidden',
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        ...sx,
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        tabIndex={interactive ? 0 : -1}
        role={interactive ? 'application' : 'img'}
        aria-label={copy.canvas}
        aria-busy={loading || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={interactive ? handleKeyDown : undefined}
        style={{ display: 'block', touchAction: 'none', userSelect: 'none', outline: 'none', cursor: surfaceCursor }}
      >
        <defs>
          <pattern id={gridPatternId} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke={theme.palette.divider} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </pattern>
        </defs>
        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
          <rect
            x={0}
            y={0}
            width={extent.columns * cellSize}
            height={extent.rows * cellSize}
            fill={theme.palette.background.paper}
            stroke={theme.palette.divider}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {showGrid && (
            <rect x={0} y={0} width={extent.columns * cellSize} height={extent.rows * cellSize} fill={`url(#${gridPatternId})`} style={{ pointerEvents: 'none' }} />
          )}
          {ordered.map((item) => (
            <PlanItem
              key={item.id}
              item={item}
              cellSize={cellSize}
              scale={viewport.scale}
              compact={compact}
              touchTargets={touchTargets}
              color={toneColor(theme, loading ? FLOOR_PLAN_TONES.MUTED : item.tone)}
              selected={item.id === selectedId}
              dimmed={Boolean(highlight) && !highlight.has(item.id)}
              lifted={item.id === armedId}
              showLabels={showLabels}
              textColor={textColor}
              cursor={loading ? 'default' : itemCursor}
            />
          ))}
          {overlayVisible &&
            !loading &&
            overlay &&
            ordered.map((item) =>
              overlay[item.id] ? <PlanOverlay key={item.id} item={item} cellSize={cellSize} entry={overlay[item.id]} theme={theme} /> : null,
            )}
          {selectedItem && !selectedItem.locked && (
            <SelectionHandles
              item={selectedItem}
              cellSize={cellSize}
              scale={viewport.scale}
              theme={theme}
              canRotate={selectedItem.shape !== FLOOR_PLAN_SHAPES.ROUND}
              labels={copy}
              hitRadius={coarsePointerRef.current ? 18 : 11}
            />
          )}
          {isEdit && placing && hoverCell && (
            <g
              transform={`translate(${itemCenter(hoverCell).x * cellSize} ${itemCenter(hoverCell).y * cellSize})`}
              style={{ pointerEvents: 'none' }}
              opacity={0.5}
            >
              <ShapeBody
                shape={hoverCell.shape}
                width={hoverCell.width * cellSize}
                height={hoverCell.height * cellSize}
                inset={1.5}
                fill={alpha(theme.palette.primary.main, 0.14)}
                stroke={theme.palette.primary.main}
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
            </g>
          )}
        </g>
      </svg>
      {interactive && showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <IconButton size="small" aria-label={copy.zoomIn} onClick={() => zoomBy(BUTTON_ZOOM_FACTOR)}>
            <AddOutlined sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" aria-label={copy.zoomOut} onClick={() => zoomBy(1 / BUTTON_ZOOM_FACTOR)}>
            <RemoveOutlined sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" aria-label={copy.fit} onClick={fit}>
            <FitScreenOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
});

export default FloorPlanCanvas;
