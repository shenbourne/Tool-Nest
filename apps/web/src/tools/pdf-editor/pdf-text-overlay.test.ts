import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { addPdfTextOverlay } from './pdf-text-overlay';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLZ9wAAAABJRU5ErkJggg==';
const fillText = vi.fn();

beforeEach(() => {
  fillText.mockClear();
  vi.stubGlobal('document', { createElement: vi.fn(() => ({ width: 0, height: 0, getContext: () => ({ font: '', fillStyle: '', textBaseline: 'alphabetic', measureText: () => ({ width: 80 }), fillText }), toDataURL: () => PNG })) });
  vi.stubGlobal('fetch', vi.fn(async () => new Response(Uint8Array.from(atob(PNG.split(',')[1]), (c) => c.charCodeAt(0)))));
});

describe('PDF text overlay', () => {
  it('embeds browser-rendered Chinese text into an exported PDF', async () => {
    const source = await PDFDocument.create();
    source.addPage([300, 200]);
    const output = await addPdfTextOverlay((await source.save()).buffer, { text: '中文测试', fontSize: 24, color: '#000000', position: 'center' });
    const exported = await PDFDocument.load(output);
    expect(fillText).toHaveBeenCalledWith('中文测试', 2, 2);
    expect(exported.getPageCount()).toBe(1);
    expect(output.byteLength).toBeGreaterThan(500);
  });
});
