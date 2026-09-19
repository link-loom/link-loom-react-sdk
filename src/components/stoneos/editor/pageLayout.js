export const PAGE_SIZES_MM = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

const DEFAULT_MARGINS_MM = { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 };

const PX_PER_MM = 96 / 25.4;

export const mmToPx = (millimeters) => millimeters * PX_PER_MM;

const toMargin = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

// Normalizes `{ size, orientation, margins }`; width/height are the oriented sheet in millimeters.
export const resolvePageLayout = (pageLayout) => {
  const size = PAGE_SIZES_MM[pageLayout?.size] ? pageLayout.size : 'A4';
  const orientation = pageLayout?.orientation === 'landscape' ? 'landscape' : 'portrait';
  const base = PAGE_SIZES_MM[size];
  const margins = pageLayout?.margins || {};

  return {
    size,
    orientation,
    width: orientation === 'landscape' ? base.height : base.width,
    height: orientation === 'landscape' ? base.width : base.height,
    margins: {
      top: toMargin(margins.top, DEFAULT_MARGINS_MM.top),
      right: toMargin(margins.right, DEFAULT_MARGINS_MM.right),
      bottom: toMargin(margins.bottom, DEFAULT_MARGINS_MM.bottom),
      left: toMargin(margins.left, DEFAULT_MARGINS_MM.left),
    },
  };
};

export const buildPageRuleCss = (pageLayout, marginBoxes = '') => {
  const layout = resolvePageLayout(pageLayout);
  const { top, right, bottom, left } = layout.margins;
  return `@page { size: ${layout.size} ${layout.orientation}; margin: ${top}mm ${right}mm ${bottom}mm ${left}mm; ${marginBoxes} }`;
};
