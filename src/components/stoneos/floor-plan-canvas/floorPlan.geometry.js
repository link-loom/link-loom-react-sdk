import { FLOOR_PLAN_CORNERS, FLOOR_PLAN_DEFAULTS, FLOOR_PLAN_SHAPES } from './floorPlan.constants.js';

// Items live on an integer grid: `x`, `y`, `width` and `height` are cells, `rotation` is degrees around the
// item's centre. The viewport maps world pixels (cells x cellSize) to the screen: screen = world x scale + offset.

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

export const normalizeRotation = (degrees) => ((Math.round(degrees) % 360) + 360) % 360;

export const rotatePoint = (point, origin, degrees) => {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const offsetX = point.x - origin.x;
  const offsetY = point.y - origin.y;

  return {
    x: origin.x + offsetX * cosine - offsetY * sine,
    y: origin.y + offsetX * sine + offsetY * cosine,
  };
};

export const itemCenter = (item) => ({ x: item.x + item.width / 2, y: item.y + item.height / 2 });

// The box that contains the item once rotated, in cells.
export const itemBounds = (item) => {
  const center = itemCenter(item);
  const corners = [
    { x: item.x, y: item.y },
    { x: item.x + item.width, y: item.y },
    { x: item.x + item.width, y: item.y + item.height },
    { x: item.x, y: item.y + item.height },
  ].map((corner) => rotatePoint(corner, center, item.rotation || 0));
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);

  return { x: left, y: top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
};

// The grid grows to hold items that were saved outside the nominal size.
export const resolveExtent = (items, columns, rows) =>
  items.reduce(
    (extent, item) => ({
      columns: Math.max(extent.columns, Math.ceil(item.x + item.width)),
      rows: Math.max(extent.rows, Math.ceil(item.y + item.height)),
    }),
    { columns, rows },
  );

export const moveItem = (item, deltaX, deltaY, extent) => ({
  ...item,
  x: clamp(Math.round(item.x + deltaX), 0, Math.max(extent.columns - item.width, 0)),
  y: clamp(Math.round(item.y + deltaY), 0, Math.max(extent.rows - item.height, 0)),
});

const CORNER_SIGNS = {
  [FLOOR_PLAN_CORNERS.NW]: { x: -1, y: -1 },
  [FLOOR_PLAN_CORNERS.NE]: { x: 1, y: -1 },
  [FLOOR_PLAN_CORNERS.SE]: { x: 1, y: 1 },
  [FLOOR_PLAN_CORNERS.SW]: { x: -1, y: 1 },
};

// Drags one corner while the opposite corner stays where it is, measured in the item's own (rotated) frame.
// A round item stays a circle.
export const resizeItem = (item, corner, pointer, extent, minSize = FLOOR_PLAN_DEFAULTS.minSize) => {
  const sign = CORNER_SIGNS[corner];
  if (!sign) {
    return item;
  }

  const rotation = item.rotation || 0;
  const center = itemCenter(item);
  const anchor = rotatePoint(
    { x: center.x - (sign.x * item.width) / 2, y: center.y - (sign.y * item.height) / 2 },
    center,
    rotation,
  );
  const local = rotatePoint(pointer, anchor, -rotation);
  const rawWidth = (local.x - anchor.x) * sign.x;
  const rawHeight = (local.y - anchor.y) * sign.y;
  const snappedWidth = clamp(Math.round(rawWidth), minSize, extent.columns);
  const snappedHeight = clamp(Math.round(rawHeight), minSize, extent.rows);
  const isRound = item.shape === FLOOR_PLAN_SHAPES.ROUND;
  const side = Math.min(Math.max(snappedWidth, snappedHeight), extent.columns, extent.rows);
  const width = isRound ? side : snappedWidth;
  const height = isRound ? side : snappedHeight;
  const nextCenter = rotatePoint(
    { x: anchor.x + (sign.x * width) / 2, y: anchor.y + (sign.y * height) / 2 },
    anchor,
    rotation,
  );

  return {
    ...item,
    width,
    height,
    x: clamp(Math.round(nextCenter.x - width / 2), 0, Math.max(extent.columns - width, 0)),
    y: clamp(Math.round(nextCenter.y - height / 2), 0, Math.max(extent.rows - height, 0)),
  };
};

// The rotation handle sits above the item, so a pointer straight up from the centre is 0 degrees.
export const rotateItem = (item, pointer, step = FLOOR_PLAN_DEFAULTS.rotationStep) => {
  const center = itemCenter(item);
  const degrees = (Math.atan2(pointer.y - center.y, pointer.x - center.x) * 180) / Math.PI + 90;

  return { ...item, rotation: normalizeRotation(Math.round(degrees / step) * step) };
};

// A new item placed with its centre on the tapped cell.
export const placeItem = (template, point, extent) => {
  const width = template.width || FLOOR_PLAN_DEFAULTS.minSize;
  const height = template.height || FLOOR_PLAN_DEFAULTS.minSize;

  return {
    rotation: 0,
    ...template,
    width,
    height,
    x: clamp(Math.round(point.x - width / 2), 0, Math.max(extent.columns - width, 0)),
    y: clamp(Math.round(point.y - height / 2), 0, Math.max(extent.rows - height, 0)),
  };
};

export const planSignature = (items) =>
  JSON.stringify(
    (items || []).map((item) => [item.id, item.shape, item.x, item.y, item.width, item.height, item.rotation || 0]),
  );

export const changedIds = (before, after) => {
  const previous = new Map(before.map((item) => [item.id, planSignature([item])]));
  const next = new Map(after.map((item) => [item.id, planSignature([item])]));
  const ids = new Set([...previous.keys(), ...next.keys()]);

  return [...ids].filter((id) => previous.get(id) !== next.get(id));
};

export const exceedsSlop = (from, to, slop = FLOOR_PLAN_DEFAULTS.dragSlop) =>
  Math.hypot(to.x - from.x, to.y - from.y) > slop;

export const screenToWorld = (viewport, point) => ({
  x: (point.x - viewport.x) / viewport.scale,
  y: (point.y - viewport.y) / viewport.scale,
});

const limitScale = (scale, limits) => clamp(scale, limits.minScale, limits.maxScale);

// Zooms keeping the world point under `anchor` (a screen point) where it is.
export const zoomViewport = (viewport, factor, anchor, limits = FLOOR_PLAN_DEFAULTS) => {
  const scale = limitScale(viewport.scale * factor, limits);
  const ratio = scale / viewport.scale;

  return { scale, x: anchor.x - (anchor.x - viewport.x) * ratio, y: anchor.y - (anchor.y - viewport.y) * ratio };
};

export const panViewport = (viewport, deltaX, deltaY) => ({
  ...viewport,
  x: viewport.x + deltaX,
  y: viewport.y + deltaY,
});

export const pinchViewport = (start, startMidpoint, startDistance, midpoint, distance, limits = FLOOR_PLAN_DEFAULTS) => {
  const scale = limitScale(start.scale * (distance / (startDistance || 1)), limits);
  const world = screenToWorld(start, startMidpoint);

  return { scale, x: midpoint.x - world.x * scale, y: midpoint.y - world.y * scale };
};

// The smallest scale at which the smallest shape is `target` screen pixels on its short side (0 with no items).
export const touchScaleOf = (items, cellSize, target = FLOOR_PLAN_DEFAULTS.touchTarget) => {
  if (!items.length) {
    return 0;
  }
  const smallest = Math.min(...items.map((item) => Math.min(item.width, item.height) * cellSize));

  return target / Math.max(smallest, 1);
};

// Puts `bounds` (world pixels) in a container of `size`, as large as the limits allow. `floorScale` is a scale the
// fit does not go under: the content then overflows the container and starts at its top left, so the person pans
// to the rest; without it the content is centred.
export const fitViewport = (bounds, size, limits = FLOOR_PLAN_DEFAULTS, floorScale = 0) => {
  const padding = limits.fitPadding;
  const available = {
    width: Math.max(size.width - padding * 2, 1),
    height: Math.max(size.height - padding * 2, 1),
  };
  const fitted = Math.min(available.width / Math.max(bounds.width, 1), available.height / Math.max(bounds.height, 1));
  const floor = Math.min(floorScale, limits.maxScale);
  const scale = clamp(Math.max(fitted, floor), limits.minScale, Math.max(limits.fitMaxScale, floor));
  const alignedAxis = (container, content, origin) =>
    content * scale > container - padding * 2
      ? padding - origin * scale
      : (container - content * scale) / 2 - origin * scale;

  return {
    scale,
    x: alignedAxis(size.width, bounds.width, bounds.x),
    y: alignedAxis(size.height, bounds.height, bounds.y),
  };
};

// What the plan shows on first view: the items, or the whole grid while there are none.
export const contentBounds = (items, extent, cellSize) => {
  if (!items.length) {
    return { x: 0, y: 0, width: extent.columns * cellSize, height: extent.rows * cellSize };
  }

  const boxes = items.map(itemBounds);
  const left = Math.min(...boxes.map((box) => box.x)) - 1;
  const top = Math.min(...boxes.map((box) => box.y)) - 1;
  const right = Math.max(...boxes.map((box) => box.x + box.width)) + 1;
  const bottom = Math.max(...boxes.map((box) => box.y + box.height)) + 1;

  return { x: left * cellSize, y: top * cellSize, width: (right - left) * cellSize, height: (bottom - top) * cellSize };
};
