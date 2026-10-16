import { PDFDocument } from 'pdf-lib';

export interface PdfTextOverlayOptions {
  text: string;
  fontSize: number;
  color: string;
  position: string;
}

interface TextImage {
  bytes: ArrayBuffer;
  width: number;
  height: number;
}

async function createTextImage(value: string, size: number, fill: string): Promise<TextImage> {
  const scale = 2;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');
  context.font = `${size * scale}px sans-serif`;
  const width = Math.ceil(context.measureText(value).width / scale) + 2;
  const height = Math.ceil(size * 1.25) + 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  context.font = `${size * scale}px sans-serif`;
  context.fillStyle = fill;
  context.textBaseline = 'top';
  context.fillText(value, scale, scale);
  const bytes = await (await fetch(canvas.toDataURL('image/png'))).arrayBuffer();
  return { bytes, width, height };
}

function positionText(pageWidth: number, pageHeight: number, image: TextImage, position: string) {
  const margin = 20;
  let x = margin;
  let y = pageHeight - image.height - margin;
  if (position.includes('center') && position.startsWith('top')) x = (pageWidth - image.width) / 2;
  else if (position.includes('right') && position.startsWith('top')) x = pageWidth - image.width - margin;
  else if (position === 'center') { x = (pageWidth - image.width) / 2; y = (pageHeight - image.height) / 2; }
  else if (position.includes('center') && position.startsWith('bottom')) { x = (pageWidth - image.width) / 2; y = margin; }
  else if (position.includes('left') && position.startsWith('bottom')) y = margin;
  else if (position.includes('right') && position.startsWith('bottom')) { x = pageWidth - image.width - margin; y = margin; }
  return { x, y };
}

/** Renders with the browser's font fallback so CJK input works without a bundled font file. */
export async function addPdfTextOverlay(source: ArrayBuffer, options: PdfTextOverlayOptions): Promise<Uint8Array> {
  const document = await PDFDocument.load(source);
  const textImage = await createTextImage(options.text, options.fontSize, options.color);
  const image = await document.embedPng(textImage.bytes);
  for (const page of document.getPages()) {
    const { width, height } = page.getSize();
    const { x, y } = positionText(width, height, textImage, options.position);
    page.drawImage(image, { x, y, width: textImage.width, height: textImage.height });
  }
  return document.save();
}
