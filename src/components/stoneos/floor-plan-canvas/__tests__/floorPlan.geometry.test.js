import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FLOOR_PLAN_CORNERS, FLOOR_PLAN_DEFAULTS, FLOOR_PLAN_SHAPES } from '../floorPlan.constants.js';
import {
  changedIds,
  contentBounds,
  exceedsSlop,
  fitViewport,
  itemBounds,
  moveItem,
  normalizeRotation,
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
} from '../floorPlan.geometry.js';

const extent = { columns: 20, rows: 10 };
const table = { id: 'a', shape: FLOOR_PLAN_SHAPES.RECT, x: 4, y: 3, width: 4, height: 2, rotation: 0 };

describe('moveItem', () => {
  it('snaps to whole cells', () => {
    assert.deepEqual(moveItem(table, 1.4, -0.6, extent), { ...table, x: 5, y: 2 });
  });

  it('stays inside the grid', () => {
    const moved = moveItem(table, 100, 100, extent);
    assert.equal(moved.x, 16);
    assert.equal(moved.y, 8);
    assert.equal(moveItem(table, -100, -100, extent).x, 0);
  });
});

describe('resizeItem', () => {
  it('drags the south-east corner and keeps the north-west corner', () => {
    const resized = resizeItem(table, FLOOR_PLAN_CORNERS.SE, { x: 10.2, y: 7.1 }, extent);
    assert.deepEqual([resized.x, resized.y, resized.width, resized.height], [4, 3, 6, 4]);
  });

  it('drags the north-west corner and keeps the south-east corner', () => {
    const resized = resizeItem(table, FLOOR_PLAN_CORNERS.NW, { x: 2, y: 1 }, extent);
    assert.deepEqual([resized.x, resized.y, resized.width, resized.height], [2, 1, 6, 4]);
  });

  it('never shrinks below one cell', () => {
    const resized = resizeItem(table, FLOOR_PLAN_CORNERS.SE, { x: 0, y: 0 }, extent);
    assert.deepEqual([resized.width, resized.height], [1, 1]);
  });

  it('keeps a round item a circle', () => {
    const round = { ...table, shape: FLOOR_PLAN_SHAPES.ROUND, width: 2, height: 2 };
    const resized = resizeItem(round, FLOOR_PLAN_CORNERS.SE, { x: 9, y: 5 }, extent);
    assert.equal(resized.width, resized.height);
    assert.equal(resized.width, 5);
  });

  it('measures in the rotated frame', () => {
    const turned = { ...table, rotation: 90 };
    const resized = resizeItem(turned, FLOOR_PLAN_CORNERS.SE, { x: 3, y: 6 }, extent);
    assert.deepEqual([resized.width, resized.height], [4, 4]);
  });
});

describe('rotateItem', () => {
  it('is 0 with the pointer straight above the centre', () => {
    assert.equal(rotateItem(table, { x: 6, y: -5 }).rotation, 0);
  });

  it('snaps to 15 degrees and wraps around', () => {
    assert.equal(rotateItem(table, { x: 20, y: 4 }).rotation, 90);
    assert.equal(rotateItem(table, { x: -20, y: 4 }).rotation, 270);
    assert.equal(normalizeRotation(-90), 270);
    assert.equal(normalizeRotation(360), 0);
  });
});

describe('bounds and extent', () => {
  it('swaps width and height when turned a quarter', () => {
    const box = itemBounds({ ...table, rotation: 90 });
    assert.equal(Math.round(box.width), 2);
    assert.equal(Math.round(box.height), 4);
  });

  it('grows the grid to hold items outside it', () => {
    assert.deepEqual(resolveExtent([{ ...table, x: 30 }], 20, 10), { columns: 34, rows: 10 });
  });

  it('shows the whole grid while empty and the items otherwise', () => {
    assert.deepEqual(contentBounds([], extent, 32), { x: 0, y: 0, width: 640, height: 320 });
    assert.deepEqual(contentBounds([table], extent, 32), { x: 96, y: 64, width: 192, height: 128 });
  });
});

describe('placeItem', () => {
  it('centres the new item on the tapped cell and keeps it inside', () => {
    assert.deepEqual(placeItem({ shape: 'rect', width: 2, height: 2 }, { x: 10, y: 5 }, extent), {
      rotation: 0,
      shape: 'rect',
      width: 2,
      height: 2,
      x: 9,
      y: 4,
    });
    assert.equal(placeItem({ width: 2, height: 2 }, { x: 0, y: 0 }, extent).x, 0);
  });
});

describe('signatures', () => {
  it('ignores what is not geometry', () => {
    assert.equal(planSignature([{ ...table, label: 'M1' }]), planSignature([{ ...table, label: 'M2' }]));
  });

  it('lists the items that changed, were added or were removed', () => {
    const other = { ...table, id: 'b' };
    assert.deepEqual(changedIds([table, other], [{ ...table, x: 5 }, other]), ['a']);
    assert.deepEqual(changedIds([table], [table, other]), ['b']);
    assert.deepEqual(changedIds([table, other], [table]), ['b']);
  });
});

describe('viewport', () => {
  const viewport = { scale: 1, x: 0, y: 0 };

  it('zooms around the anchor', () => {
    const zoomed = zoomViewport(viewport, 2, { x: 100, y: 50 });
    assert.deepEqual(screenToWorld(zoomed, { x: 100, y: 50 }), { x: 100, y: 50 });
    assert.equal(zoomed.scale, 2);
  });

  it('respects the scale limits', () => {
    assert.equal(zoomViewport(viewport, 100, { x: 0, y: 0 }).scale, FLOOR_PLAN_DEFAULTS.maxScale);
    assert.equal(zoomViewport(viewport, 0.001, { x: 0, y: 0 }).scale, FLOOR_PLAN_DEFAULTS.minScale);
  });

  it('pans by the pointer delta', () => {
    assert.deepEqual(panViewport(viewport, 10, -5), { scale: 1, x: 10, y: -5 });
  });

  it('keeps the pinched world point under the fingers', () => {
    const start = { scale: 1, x: 10, y: 20 };
    const pinched = pinchViewport(start, { x: 110, y: 120 }, 100, { x: 150, y: 140 }, 200);
    assert.equal(pinched.scale, 2);
    assert.deepEqual(screenToWorld(pinched, { x: 150, y: 140 }), screenToWorld(start, { x: 110, y: 120 }));
  });

  it('fits the content centred', () => {
    const fitted = fitViewport({ x: 0, y: 0, width: 400, height: 200 }, { width: 448, height: 400 });
    assert.equal(fitted.scale, 1);
    assert.equal(fitted.x, 24);
    assert.equal(fitted.y, 100);
  });

  it('does not fit under the floor scale: the content overflows from its top left so the person pans to the rest', () => {
    const area = { x: 0, y: 0, width: 960, height: 640 };
    const phone = { width: 375, height: 560 };
    const everything = fitViewport(area, phone);
    const touchable = fitViewport(area, phone, FLOOR_PLAN_DEFAULTS, 44 / 64);

    assert.ok(everything.scale < 0.4);
    assert.equal(touchable.scale, 44 / 64);
    assert.equal(touchable.x, FLOOR_PLAN_DEFAULTS.fitPadding);
    assert.equal(touchable.y, (560 - 640 * touchable.scale) / 2);
  });

  it('keeps the centred fit when the floor scale is already reached', () => {
    const roomy = { width: 1200, height: 800 };
    const bounds = { x: 0, y: 0, width: 400, height: 200 };

    assert.deepEqual(fitViewport(bounds, roomy, FLOOR_PLAN_DEFAULTS, 0.5), fitViewport(bounds, roomy));
  });

  it('asks for the scale that makes the smallest shape touchable and never zooms past the maximum', () => {
    const cell = 32;
    const small = { ...table, width: 2, height: 2 };
    const tiny = { ...table, id: 'b', width: 1, height: 1 };

    assert.equal(touchScaleOf([], cell), 0);
    assert.equal(touchScaleOf([small, table], cell), 44 / 64);
    assert.equal(touchScaleOf([small, tiny], cell), 44 / 32);
    assert.equal(fitViewport({ x: 0, y: 0, width: 960, height: 640 }, { width: 375, height: 560 }, FLOOR_PLAN_DEFAULTS, 9).scale, FLOOR_PLAN_DEFAULTS.maxScale);
  });

  it('tells a tap from a drag', () => {
    assert.equal(exceedsSlop({ x: 0, y: 0 }, { x: 3, y: 3 }), false);
    assert.equal(exceedsSlop({ x: 0, y: 0 }, { x: 8, y: 0 }), true);
  });
});
