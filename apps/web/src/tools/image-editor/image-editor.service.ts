export type StrokeStyle = 'solid' | 'dash-long' | 'dash-short' | 'dash-dot' | 'dash-dot-dot';
export type ArrowStyle = 'none' | 'triangle' | 'open' | 'circle';
export interface ArrowConfig { style: ArrowStyle; size: number }
export type NumberFormat = 'number' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';

export interface ShapeAnnotation { id: number; type: 'shape'; kind: 'rect' | 'ellipse';
  x: number; y: number; width: number; height: number; rotation: number;
  stroke: string; strokeWidth: number; strokeStyle: StrokeStyle;
  fillEnabled: boolean; fill: string; cornerRadius: number }
export interface LineAnnotation { id: number; type: 'line'; kind: 'straight' | 'polyline';
  points: number[]; stroke: string; strokeWidth: number; strokeStyle: StrokeStyle;
  startArrow: ArrowConfig | null; endArrow: ArrowConfig | null }
export interface NumberAnnotation { id: number; type: 'number'; x: number; y: number;
  value: number; format: NumberFormat; color: string; size: number; fontFamily: string;
  leaderLine: { enabled: boolean; points: [number, number, number, number];
    strokeWidth: number; strokeStyle: StrokeStyle; arrow: ArrowConfig } | null }
export interface PenAnnotation { id: number; type: 'pen'; points: number[];
  stroke: string; strokeWidth: number; strokeStyle: StrokeStyle }
export interface TextAnnotation { id: number; type: 'text'; x: number; y: number; text: string;
  fontSize: number; color: string; fontFamily: string; rotation: number;
  stroke: { enabled: boolean; color: string; width: number } | null;
  background: { enabled: boolean; color: string; opacity: number } | null }
export interface MosaicAnnotation { id: number; type: 'mosaic';
  region: { kind: 'rect'; x: number; y: number; width: number; height: number }
        | { kind: 'path'; points: number[]; brushSize: number };
  effect: 'mosaic' | 'blur'; strength: number }
export type Annotation = ShapeAnnotation | LineAnnotation | NumberAnnotation
  | PenAnnotation | TextAnnotation | MosaicAnnotation;

export type Tool = 'select' | 'shape' | 'line' | 'number' | 'pen' | 'text' | 'eraser' | 'mosaic';

/** Konva dash arrays, scaled so dashes stay visible on thick strokes. */
export function strokeDash(style: StrokeStyle, width: number): number[] {
  const scale = Math.max(1, width);
  switch (style) {
    case 'solid': return [];
    case 'dash-long': return [8 * scale, 4 * scale];
    case 'dash-short': return [4 * scale, 4 * scale];
    case 'dash-dot': return [8 * scale, 4 * scale, 1 * scale, 4 * scale];
    case 'dash-dot-dot': return [8 * scale, 4 * scale, 1 * scale, 4 * scale, 1 * scale, 4 * scale];
  }
}

const ROMAN_TABLE: Array<[number, string]> = [
  [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
  [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'],
  [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
];

function toRoman(value: number, upper: boolean): string {
  let n = Math.max(1, Math.floor(value));
  let out = '';
  for (const [num, sym] of ROMAN_TABLE) {
    while (n >= num) {
      out += sym;
      n -= num;
    }
  }
  return upper ? out.toUpperCase() : out;
}

/** Excel-style bijective base-26: 1→a, 26→z, 27→aa, 28→ab. */
function toAlpha(value: number, upper: boolean): string {
  let n = Math.max(1, Math.floor(value));
  let out = '';
  while (n > 0) {
    n -= 1;
    out = String.fromCharCode(97 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return upper ? out.toUpperCase() : out;
}

export function formatNumber(value: number, format: NumberFormat): string {
  switch (format) {
    case 'number': return String(value);
    case 'lower-alpha': return toAlpha(value, false);
    case 'upper-alpha': return toAlpha(value, true);
    case 'lower-roman': return toRoman(value, false);
    case 'upper-roman': return toRoman(value, true);
  }
}

/** Polygon points for the arrowhead at (x2, y2); empty when the segment is degenerate. */
export function arrowPoints(x1: number, y1: number, x2: number, y2: number,
  cfg: ArrowConfig): number[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return [];
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const s = cfg.size;
  if (cfg.style === 'open') {
    const bx = x2 - ux * s;
    const by = y2 - uy * s;
    return [bx + px * s * 0.5, by + py * s * 0.5, bx - px * s * 0.5, by - py * s * 0.5];
  }
  if (cfg.style === 'circle') {
    const cx = x2 - ux * s * 0.5;
    const cy = y2 - uy * s * 0.5;
    const r = s * 0.5;
    return [
      cx + px * r, cy + py * r,
      cx + ux * r, cy + uy * r,
      cx - px * r, cy - py * r,
      cx - ux * r, cy - uy * r,
    ];
  }
  // triangle
  const bx = x2 - ux * s;
  const by = y2 - uy * s;
  return [x2, y2, bx + px * s * 0.5, by + py * s * 0.5, bx - px * s * 0.5, by - py * s * 0.5];
}

/** Distance from point (px, py) to the segment (x1, y1)-(x2, y2). */
export function distToSegment(px: number, py: number, x1: number, y1: number,
  x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Normalised bounding box of a drag, regardless of drag direction. */
export function rectFromPoints(x1: number, y1: number, x2: number, y2: number):
  { x: number; y: number; width: number; height: number } {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export interface PixelImage { data: Uint8ClampedArray; width: number; height: number }

/** Pixelates an image by averaging strength×strength blocks. Pure — no DOM. */
export function mosaicImageData(img: PixelImage, blockSize: number): PixelImage {
  const { data, width, height } = img;
  const block = Math.max(1, Math.floor(blockSize));
  const out = new Uint8ClampedArray(data.length);
  for (let by = 0; by < height; by += block) {
    for (let bx = 0; bx < width; bx += block) {
      const ex = Math.min(bx + block, width);
      const ey = Math.min(by + block, height);
      let r = 0; let g = 0; let b = 0; let a = 0;
      const count = (ex - bx) * (ey - by);
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const i = (y * width + x) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          a += data[i + 3];
        }
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const i = (y * width + x) * 4;
          out[i] = r;
          out[i + 1] = g;
          out[i + 2] = b;
          out[i + 3] = a;
        }
      }
    }
  }
  return { data: out, width, height };
}

/** Box blur of the given radius, separable horizontal + vertical pass. Pure — no DOM. */
export function boxBlurImageData(img: PixelImage, radius: number): PixelImage {
  const { data, width, height } = img;
  const r = Math.max(1, Math.floor(radius));
  const tmp = new Uint8ClampedArray(data.length);
  const out = new Uint8ClampedArray(data.length);

  // Horizontal pass.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sr = 0; let sg = 0; let sb = 0; let sa = 0;
      let count = 0;
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(width - 1, x + r);
      for (let k = x0; k <= x1; k++) {
        const i = (y * width + k) * 4;
        sr += data[i];
        sg += data[i + 1];
        sb += data[i + 2];
        sa += data[i + 3];
        count++;
      }
      const o = (y * width + x) * 4;
      tmp[o] = sr / count;
      tmp[o + 1] = sg / count;
      tmp[o + 2] = sb / count;
      tmp[o + 3] = sa / count;
    }
  }

  // Vertical pass.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sr = 0; let sg = 0; let sb = 0; let sa = 0;
      let count = 0;
      const y0 = Math.max(0, y - r);
      const y1 = Math.min(height - 1, y + r);
      for (let k = y0; k <= y1; k++) {
        const i = (k * width + x) * 4;
        sr += tmp[i];
        sg += tmp[i + 1];
        sb += tmp[i + 2];
        sa += tmp[i + 3];
        count++;
      }
      const o = (y * width + x) * 4;
      out[o] = sr / count;
      out[o + 1] = sg / count;
      out[o + 2] = sb / count;
      out[o + 3] = sa / count;
    }
  }

  return { data: out, width, height };
}

/**
 * Renders a mosaic/blur effect over a region of the source canvas.
 * Coordinates are normalised (0–1) relative to the stage size.
 */
export function applyMosaic(src: HTMLCanvasElement, region: MosaicAnnotation['region'],
  effect: 'mosaic' | 'blur', strength: number, stageW: number, stageH: number): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = stageW;
  out.height = stageH;
  const ctx = out.getContext('2d');
  if (!ctx) return out;

  const drawRegion = () => {
    if (region.kind === 'rect') {
      ctx.beginPath();
      ctx.rect(region.x * stageW, region.y * stageH, region.width * stageW, region.height * stageH);
    } else {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = region.brushSize;
      ctx.moveTo(region.points[0] * stageW, region.points[1] * stageH);
      for (let i = 2; i < region.points.length; i += 2) {
        ctx.lineTo(region.points[i] * stageW, region.points[i + 1] * stageH);
      }
    }
  };

  // Extract the bounding box of the region into an offscreen canvas.
  let sx: number; let sy: number; let sw: number; let sh: number;
  if (region.kind === 'rect') {
    sx = region.x * stageW;
    sy = region.y * stageH;
    sw = region.width * stageW;
    sh = region.height * stageH;
  } else {
    let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
    for (let i = 0; i < region.points.length; i += 2) {
      minX = Math.min(minX, region.points[i]);
      minY = Math.min(minY, region.points[i + 1]);
      maxX = Math.max(maxX, region.points[i]);
      maxY = Math.max(maxY, region.points[i + 1]);
    }
    const pad = region.brushSize / 2;
    sx = (minX * stageW) - pad;
    sy = (minY * stageH) - pad;
    sw = (maxX - minX) * stageW + region.brushSize;
    sh = (maxY - minY) * stageH + region.brushSize;
  }
  sw = Math.max(1, Math.ceil(sw));
  sh = Math.max(1, Math.ceil(sh));

  const off = document.createElement('canvas');
  off.width = sw;
  off.height = sh;
  const offCtx = off.getContext('2d');
  if (!offCtx) return out;
  offCtx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);

  const imageData = offCtx.getImageData(0, 0, sw, sh);
  const processed = effect === 'mosaic'
    ? mosaicImageData(imageData, strength)
    : boxBlurImageData(imageData, strength);
  offCtx.putImageData(processed, 0, 0);

  // Composite the processed patch back, clipped to the region shape.
  ctx.save();
  drawRegion();
  ctx.clip();
  ctx.drawImage(off, sx, sy);
  ctx.restore();
  return out;
}

export const HISTORY_LIMIT = 100;

export interface History<T> { states: T[]; cursor: number; limit: number }

// The annotations are plain JSON data, and the component hands over Vue
// reactive proxies, which `structuredClone` refuses. A JSON round trip copies
// the values without caring what wraps them.
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createHistory<T>(initial: T, limit = HISTORY_LIMIT): History<T> {
  return { states: [clone(initial)], cursor: 0, limit };
}

/** Records a new state, dropping any redo tail and the oldest states past `limit`. */
export function commit<T>(history: History<T>, state: T): History<T> {
  const states = history.states.slice(0, history.cursor + 1);
  states.push(clone(state));
  const capped = states.length > history.limit ? states.slice(states.length - history.limit) : states;
  return { states: capped, cursor: capped.length - 1, limit: history.limit };
}

export function undo<T>(history: History<T>): History<T> {
  return history.cursor > 0 ? { ...history, cursor: history.cursor - 1 } : history;
}

export function redo<T>(history: History<T>): History<T> {
  return history.cursor < history.states.length - 1 ? { ...history, cursor: history.cursor + 1 } : history;
}

export function canUndo<T>(history: History<T>): boolean {
  return history.cursor > 0;
}

export function canRedo<T>(history: History<T>): boolean {
  return history.cursor < history.states.length - 1;
}

/** The state at the cursor, as a copy the caller may edit freely. */
export function historyState<T>(history: History<T>): T {
  return clone(history.states[history.cursor]);
}
