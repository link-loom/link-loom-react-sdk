import { resolveLabels } from '../shared/labels.helpers.js';

export const FLOOR_PLAN_CANVAS_LABELS = Object.freeze({
  en: Object.freeze({
    canvas: 'Floor plan',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fit: 'Fit the plan to the screen',
    resize: 'Resize',
    rotate: 'Rotate',
    placing: 'Tap the plan to place it',
  }),
  es: Object.freeze({
    canvas: 'Plano',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    fit: 'Ajustar el plano a la pantalla',
    resize: 'Cambiar tamaño',
    rotate: 'Girar',
    placing: 'Toca el plano para colocarlo',
  }),
});

export const resolveFloorPlanLabels = (overrides, locale) => resolveLabels(FLOOR_PLAN_CANVAS_LABELS, overrides, locale);
