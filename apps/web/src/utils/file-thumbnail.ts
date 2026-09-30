/**
 * Rules for the file-list thumbnails in `ToolFileUpload`.
 *
 * Kept free of DOM access — the canvas/pdf.js/video plumbing lives in
 * `thumbnail-render.ts` — so the decisions that are easy to get wrong (which
 * file is previewable, and how a source is cropped into the square thumbnail
 * box) stay unit-testable under the repo's node-environment vitest config.
 */

export type ThumbnailKind = 'image' | 'pdf' | 'video' | 'none';

export interface SourceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Only used when the browser supplies no usable MIME type, which happens for
// files dragged in from some clients.
const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.mov', '.webm', '.ogv', '.mkv', '.avi'];

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

function hasArea(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function thumbnailKind(file: { name: string; type: string }): ThumbnailKind {
  const type = file.type.toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type === 'application/pdf') return 'pdf';

  const extension = extensionOf(file.name);
  if (extension === '.pdf') return 'pdf';
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
  return 'none';
}

/**
 * Largest centred square of a source, to be drawn into a square canvas.
 * Cropping (rather than letterboxing) is what makes a photo read as a
 * thumbnail, so images and video frames both use this.
 */
export function coverSourceRect(width: number, height: number): SourceRect | null {
  if (!hasArea(width) || !hasArea(height)) return null;

  const side = Math.min(width, height);
  return { x: (width - side) / 2, y: (height - side) / 2, width: side, height: side };
}

/**
 * Where a source lands inside a `box`-sized square, preserving its aspect
 * ratio. PDF pages use this so the whole page stays visible, and a small page
 * is scaled up rather than left as a speck.
 */
export function containDestRect(
  width: number,
  height: number,
  box: number,
): SourceRect | null {
  if (!hasArea(width) || !hasArea(height) || !hasArea(box)) return null;

  const scale = Math.min(box / width, box / height);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  return {
    x: (box - scaledWidth) / 2,
    y: (box - scaledHeight) / 2,
    width: scaledWidth,
    height: scaledHeight,
  };
}
