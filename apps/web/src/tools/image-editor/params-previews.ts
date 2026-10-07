import { h, type VNodeChild } from 'vue';
import type { ArrowStyle, NumberFormat, StrokeStyle } from './image-editor.service';
import { formatNumber } from './image-editor.service';

// SVG previews for the image-editor params panel. NSelect dropdown options and
// the selected tag render these instead of plain text so the picker reads as a
// visual sample (line dash, arrowhead, number glyph) rather than a name.

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg(attrs: Record<string, string | number>, children: VNodeChild[]) {
  return h('svg', { xmlns: SVG_NS, viewBox: '0 0 64 20', width: 64, height: 20, ...attrs }, children);
}

/** dasharray values mirror strokeDash() at width 2 so the sample matches the canvas. */
const STROKE_DASH_PREVIEW: Record<StrokeStyle, string> = {
  solid: '',
  'dash-long': '16,8',
  'dash-short': '8,8',
  'dash-dot': '16,8,2,8',
  'dash-dot-dot': '16,8,2,8,2,8',
};

export function strokeStylePreview(style: StrokeStyle): VNodeChild {
  return svg({ class: 'param-preview' }, [
    h('line', {
      x1: 4, y1: 10, x2: 60, y2: 10,
      stroke: 'currentColor', 'stroke-width': 2,
      'stroke-dasharray': STROKE_DASH_PREVIEW[style] || undefined,
      'stroke-linecap': 'round',
    }),
  ]);
}

function arrowHead(style: ArrowStyle): VNodeChild {
  // Arrowhead sits at the right end (x=52) of a 4..52 line, centred on y=10.
  switch (style) {
    case 'none':
      return null;
    case 'triangle':
      return h('polygon', {
        points: '52,5 52,15 60,10', fill: 'currentColor',
      });
    case 'open':
      return h('polyline', {
        points: '53,5 60,10 53,15',
        fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round',
      });
    case 'circle':
      return h('circle', { cx: 56, cy: 10, r: 4, fill: 'currentColor' });
  }
}

export function arrowStylePreview(style: ArrowStyle): VNodeChild {
  return svg({ class: 'param-preview' }, [
    h('line', {
      x1: 4, y1: 10, x2: 52, y2: 10,
      stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round',
    }),
    arrowHead(style),
  ]);
}

export function numberFormatPreview(format: NumberFormat): VNodeChild {
  return h('span', { class: 'param-preview param-preview--text' }, formatNumber(1, format));
}

/** Shape kind: an unfilled rect or ellipse outline sample. */
export function shapeKindPreview(kind: 'rect' | 'ellipse'): VNodeChild {
  const shape = kind === 'rect'
    ? h('rect', { x: 14, y: 3, width: 36, height: 14, rx: 2, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 })
    : h('ellipse', { cx: 32, cy: 10, rx: 20, ry: 8, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 });
  return svg({ class: 'param-preview' }, [shape]);
}

/** Line kind: a single straight segment or a two-segment polyline sample. */
export function lineKindPreview(kind: 'straight' | 'polyline'): VNodeChild {
  const segment = kind === 'straight'
    ? h('line', { x1: 6, y1: 16, x2: 58, y2: 4, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    : h('polyline', { points: '6,16 32,4 58,16', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return svg({ class: 'param-preview' }, [segment]);
}

/** Eraser/mosaic mode: a rect outline or a brush stroke sample. */
export function modePreview(mode: 'rect' | 'brush'): VNodeChild {
  const sample = mode === 'rect'
    ? h('rect', { x: 16, y: 3, width: 32, height: 14, rx: 1, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-dasharray': '4,3' })
    : h('line', { x1: 10, y1: 15, x2: 54, y2: 5, stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' });
  return svg({ class: 'param-preview' }, [sample]);
}

/** Mosaic effect: a pixelated block sample or a blurred-edge sample. */
export function mosaicEffectPreview(effect: 'mosaic' | 'blur'): VNodeChild {
  if (effect === 'mosaic') {
    return svg({ class: 'param-preview' }, [
      h('rect', { x: 18, y: 3, width: 7, height: 7, fill: 'currentColor', opacity: 0.9 }),
      h('rect', { x: 25, y: 3, width: 7, height: 7, fill: 'currentColor', opacity: 0.5 }),
      h('rect', { x: 32, y: 3, width: 7, height: 7, fill: 'currentColor', opacity: 0.9 }),
      h('rect', { x: 18, y: 10, width: 7, height: 7, fill: 'currentColor', opacity: 0.5 }),
      h('rect', { x: 25, y: 10, width: 7, height: 7, fill: 'currentColor', opacity: 0.9 }),
      h('rect', { x: 32, y: 10, width: 7, height: 7, fill: 'currentColor', opacity: 0.5 }),
    ]);
  }
  return svg({ class: 'param-preview' }, [
    h('circle', { cx: 32, cy: 10, r: 8, fill: 'currentColor', opacity: 0.35 }),
    h('circle', { cx: 32, cy: 10, r: 5, fill: 'currentColor', opacity: 0.6 }),
    h('circle', { cx: 32, cy: 10, r: 2.5, fill: 'currentColor' }),
  ]);
}
