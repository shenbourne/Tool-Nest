export interface CropRectangle { x: number; y: number; width: number; height: number }

/** The longer drag axis drives a fixed-ratio rectangle, so the pointer can lie on an edge. */
export function cropFromDrag(start: {x: number; y: number}, end: {x: number; y: number}, bounds: {width: number; height: number}, ratio = 0): CropRectangle {
  const sx = Math.max(0, Math.min(bounds.width, start.x));
  const sy = Math.max(0, Math.min(bounds.height, start.y));
  const dx = end.x - sx; const dy = end.y - sy;
  const signX = dx < 0 ? -1 : 1; const signY = dy < 0 ? -1 : 1;
  const availableWidth = signX > 0 ? bounds.width - sx : sx;
  const availableHeight = signY > 0 ? bounds.height - sy : sy;
  let width = Math.min(Math.abs(dx), availableWidth);
  let height = Math.min(Math.abs(dy), availableHeight);
  if (ratio > 0) {
    width = Math.min(Math.max(Math.abs(dx), Math.abs(dy) * ratio), availableWidth, availableHeight * ratio);
    height = width / ratio;
  }
  return { x: signX > 0 ? sx : sx - width, y: signY > 0 ? sy : sy - height, width, height };
}

export function cropForRatio(width: number, height: number, ratio: number) {
  const w = Math.min(width, height * ratio);
  const h = w / ratio;
  return { x: Math.round((width - w) / 2), y: Math.round((height - h) / 2), width: Math.max(1, Math.floor(w)), height: Math.max(1, Math.floor(h)) };
}

/** Mutates only alpha; feathering never makes a transparent source opaque. */
export function removeColor(data: Uint8ClampedArray, color: string, tolerance: number, feather: boolean) {
  const hex = color.replace('#', '');
  const rgb = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
  const limit = tolerance * (feather ? Math.sqrt(3) * 255 / 100 : 2.55);
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.hypot(data[i] - rgb[0], data[i + 1] - rgb[1], data[i + 2] - rgb[2]);
    if (distance <= limit) data[i + 3] = feather && limit > 0 ? Math.round(data[i + 3] * distance / limit) : 0;
  }
}

export type ImageOperation =
  | { kind: 'adjust'; hue:number; saturation:number; brightness:number; contrast:number; opacity:number; color:string; tolerance:number; transparent:boolean; feather:boolean }
  | { kind: 'crop'; x: number; y: number; width: number; height: number }
  | { kind: 'resize'; width: number; height: number }
  | { kind: 'flip'; axis: 'horizontal' | 'vertical' }
  | { kind: 'rotate'; angle: number }
  | { kind: 'colors'; hue: number; saturation: number; brightness: number; contrast: number }
  | { kind: 'opacity'; opacity: number }
  | { kind: 'transparent' | 'background'; color: string; tolerance: number }
  | { kind: 'watermark'; text: string; color: string; size: number; opacity: number };

/** Every operation consumes the same composite used for PNG export. */
export function transformCanvas(source: HTMLCanvasElement, op: ImageOperation): HTMLCanvasElement {
  if (op.kind === 'adjust') {
    let result = transformCanvas(source, {kind:'colors',hue:op.hue,saturation:op.saturation,brightness:op.brightness,contrast:op.contrast});
    if (op.opacity !== 100) result = transformCanvas(result,{kind:'opacity',opacity:op.opacity});
    if (op.transparent) result = transformCanvas(result,{kind:op.feather ? 'background' : 'transparent',color:op.color,tolerance:op.tolerance});
    return result;
  }
  const output = document.createElement('canvas');
  let width = source.width; let height = source.height;
  if (op.kind === 'crop') {
    width = Math.min(Math.max(1, Math.round(op.width)), source.width - Math.min(source.width - 1, Math.max(0, Math.round(op.x))));
    height = Math.min(Math.max(1, Math.round(op.height)), source.height - Math.min(source.height - 1, Math.max(0, Math.round(op.y))));
  } else if (op.kind === 'resize') {
    width = Math.max(1, Math.round(op.width)); height = Math.max(1, Math.round(op.height));
  } else if (op.kind === 'rotate') {
    const a = op.angle * Math.PI / 180;
    width = Math.round(Math.abs(source.width * Math.cos(a)) + Math.abs(source.height * Math.sin(a)));
    height = Math.round(Math.abs(source.width * Math.sin(a)) + Math.abs(source.height * Math.cos(a)));
  }
  output.width = width; output.height = height;
  const ctx = output.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');
  if (op.kind === 'crop') {
    const x = Math.min(source.width - 1, Math.max(0, Math.round(op.x)));
    const y = Math.min(source.height - 1, Math.max(0, Math.round(op.y)));
    ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
  } else {
    ctx.save();
    if (op.kind === 'rotate') {
      ctx.translate(width / 2, height / 2); ctx.rotate(op.angle * Math.PI / 180);
      ctx.translate(-source.width / 2, -source.height / 2);
    }
    if (op.kind === 'flip') {
      ctx.translate(op.axis === 'horizontal' ? width : 0, op.axis === 'vertical' ? height : 0);
      ctx.scale(op.axis === 'horizontal' ? -1 : 1, op.axis === 'vertical' ? -1 : 1);
    }
    if (op.kind === 'colors') ctx.filter = `hue-rotate(${op.hue}deg) saturate(${op.saturation}%) brightness(${op.brightness}%) contrast(${op.contrast}%)`;
    ctx.drawImage(source, 0, 0, op.kind === 'resize' ? width : source.width, op.kind === 'resize' ? height : source.height);
    ctx.restore();
  }
  if (op.kind === 'opacity') {
    const pixels = ctx.getImageData(0,0,width,height);
    for (let i=3; i<pixels.data.length; i+=4) pixels.data[i] = Math.round(pixels.data[i] * op.opacity / 100);
    ctx.putImageData(pixels,0,0);
  }
  if (op.kind === 'transparent' || op.kind === 'background') {
    const pixels = ctx.getImageData(0, 0, width, height);
    removeColor(pixels.data, op.color, op.tolerance, op.kind === 'background');
    ctx.putImageData(pixels, 0, 0);
  }
  if (op.kind === 'watermark') {
    ctx.font = `${op.size}px sans-serif`; ctx.fillStyle = op.color;
    ctx.globalAlpha = op.opacity / 100; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(op.text, width / 2, height / 2);
  }
  return output;
}

export type CropHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

/** Opposite corners/edges stay fixed; fixed-ratio edge drags expand around the other axis center. */
export function resizeCrop(rect: CropRectangle, handle: CropHandle, pointer: {x: number; y: number}, bounds: {width: number; height: number}, ratio = 0): CropRectangle {
  const left = rect.x; const top = rect.y;
  const right = left + rect.width; const bottom = top + rect.height;
  const west = handle.includes('w'); const east = handle.includes('e');
  const north = handle.includes('n'); const south = handle.includes('s');
  const px = Math.max(0, Math.min(bounds.width, pointer.x));
  const py = Math.max(0, Math.min(bounds.height, pointer.y));
  if (ratio > 0 && (west || east) && (north || south)) {
    const anchor = { x: west ? right : left, y: north ? bottom : top };
    return cropFromDrag(anchor, {
      x: west ? Math.min(px, right - 1) : Math.max(px, left + 1),
      y: north ? Math.min(py, bottom - 1) : Math.max(py, top + 1),
    }, bounds, ratio);
  }
  if (ratio > 0 && (west || east)) {
    const cy = (top + bottom) / 2;
    const width = Math.min(Math.max(1, west ? right - px : px - left), west ? right : bounds.width - left, 2 * Math.min(cy, bounds.height - cy) * ratio);
    const height = width / ratio;
    return { x: west ? right - width : left, y: cy - height / 2, width, height };
  }
  if (ratio > 0 && (north || south)) {
    const cx = (left + right) / 2;
    const height = Math.min(Math.max(1, north ? bottom - py : py - top), north ? bottom : bounds.height - top, 2 * Math.min(cx, bounds.width - cx) / ratio);
    const width = height * ratio;
    return { x: cx - width / 2, y: north ? bottom - height : top, width, height };
  }
  const x = west ? Math.min(px, right - 1) : left;
  const y = north ? Math.min(py, bottom - 1) : top;
  const x2 = east ? Math.max(px, left + 1) : right;
  const y2 = south ? Math.max(py, top + 1) : bottom;
  return { x, y, width: x2 - x, height: y2 - y };
}

/** Neutral previews must not create bitmap history or flatten editable annotations. */
export function hasImageOperationChanges(op: ImageOperation | null): boolean {
  if (!op) return false;
  if (op.kind === 'adjust') return op.hue !== 0 || op.saturation !== 100 || op.brightness !== 100 || op.contrast !== 100 || op.opacity !== 100 || op.transparent;
  if (op.kind === 'rotate') return op.angle % 360 !== 0;
  return true;
}
