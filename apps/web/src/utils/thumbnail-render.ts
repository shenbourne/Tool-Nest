/**
 * Renders the square data-URL thumbnail shown next to an imported file.
 *
 * Every path resolves to `null` on any problem — an undecodable codec, an
 * encrypted PDF, a stalled `<video>` — because a preview is a nicety: it must
 * never block the import, delay it indefinitely, or surface an error. The
 * caller falls back to a type icon.
 *
 * The result is a data URL rather than an object URL: the file list keeps one
 * of these per entry for as long as it is on screen, and the repo already
 * tracks an object-URL-lifecycle defect class, so nothing here may need
 * revoking. The single object URL the video path requires is released in a
 * `finally`.
 */

import { containDestRect, coverSourceRect, thumbnailKind } from './file-thumbnail';

/** Square thumbnail size in CSS pixels; `ToolFileUpload`'s `.tool-file-upload__thumb` must match. */
export const THUMBNAIL_BOX = 128;

// Render at 2x so the thumbnail is still sharp on a HiDPI display.
const RENDER_SCALE = 2;

const VIDEO_TIMEOUT_MS = 5000;

// A page does not fill the square, and a document thumbnails as paper; the
// transparent alternative reads as a broken image. Canvas imagery is exempt
// from the token rule for colors (DESIGN.md rule 7, like a checkerboard).
const PAGE_BACKGROUND = '#ffffff';

export async function renderThumbnailDataUrl(
  file: File,
  box: number = THUMBNAIL_BOX,
): Promise<string | null> {
  try {
    switch (thumbnailKind(file)) {
      case 'image':
        return await renderImage(file, box);
      case 'pdf':
        return await renderPdf(file, box);
      case 'video':
        return await renderVideo(file, box);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function createSquareCanvas(box: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } | null {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(box * RENDER_SCALE);
  canvas.height = Math.round(box * RENDER_SCALE);

  const context = canvas.getContext('2d');
  if (!context) return null;
  return { canvas, context };
}

async function renderImage(file: File, box: number): Promise<string | null> {
  const target = createSquareCanvas(box);
  if (!target) return null;

  // Decodes straight from the File, so no object URL exists to revoke.
  const bitmap = await createImageBitmap(file);
  try {
    const source = coverSourceRect(bitmap.width, bitmap.height);
    if (!source) return null;

    target.context.drawImage(
      bitmap,
      source.x, source.y, source.width, source.height,
      0, 0, target.canvas.width, target.canvas.height,
    );
  } finally {
    bitmap.close();
  }

  return target.canvas.toDataURL('image/png');
}

async function renderPdf(file: File, box: number): Promise<string | null> {
  const target = createSquareCanvas(box);
  if (!target) return null;

  // Dynamic import: pdf.js is a few hundred KB, and only an imported PDF
  // should make the browser fetch it.
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  try {
    const page = await pdf.getPage(1);
    const source = page.getViewport({ scale: 1 });
    const area = containDestRect(source.width, source.height, target.canvas.width);
    if (!area) return null;

    // Render the page into its own canvas at the size it will occupy, then
    // place it in the square.
    const scale = area.width / source.width;
    const viewport = page.getViewport({ scale });
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = Math.max(1, Math.round(viewport.width));
    pageCanvas.height = Math.max(1, Math.round(viewport.height));
    const pageContext = pageCanvas.getContext('2d');
    if (!pageContext) return null;
    await page.render({ canvasContext: pageContext, viewport }).promise;

    target.context.fillStyle = PAGE_BACKGROUND;
    target.context.fillRect(0, 0, target.canvas.width, target.canvas.height);
    target.context.drawImage(pageCanvas, area.x, area.y, area.width, area.height);

    return target.canvas.toDataURL('image/png');
  } finally {
    await pdf.destroy();
  }
}

async function renderVideo(file: File, box: number): Promise<string | null> {
  const target = createSquareCanvas(box);
  if (!target) return null;

  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  try {
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = url;

    await withTimeout(waitForEvent(video, 'loadeddata'), VIDEO_TIMEOUT_MS);

    // Frame zero is often black; step in slightly where the clip is long enough.
    if (Number.isFinite(video.duration) && video.duration > 0.2) {
      await withTimeout(
        waitForEvent(video, 'seeked', () => { video.currentTime = 0.1; }),
        VIDEO_TIMEOUT_MS,
      );
    }

    const source = coverSourceRect(video.videoWidth, video.videoHeight);
    if (!source) return null;

    target.context.drawImage(
      video,
      source.x, source.y, source.width, source.height,
      0, 0, target.canvas.width, target.canvas.height,
    );
    return target.canvas.toDataURL('image/png');
  } finally {
    video.removeAttribute('src');
    video.load(); // drops the buffered media so the element does not pin the file
    URL.revokeObjectURL(url);
  }
}

function waitForEvent(target: HTMLVideoElement, event: string, start?: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    function cleanup() {
      target.removeEventListener(event, onEvent);
      target.removeEventListener('error', onError);
    }
    const onEvent = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error(`video ${event} failed`)); };

    target.addEventListener(event, onEvent, { once: true });
    target.addEventListener('error', onError, { once: true });
    start?.();
  });
}

function withTimeout(promise: Promise<void>, ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('thumbnail timed out')), ms);
    promise.then(
      () => { clearTimeout(timer); resolve(); },
      (error: unknown) => { clearTimeout(timer); reject(error); },
    );
  });
}
