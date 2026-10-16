import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { readBoundedZipEntry } from './zip-stream';

describe('bounded decompressed entry reads', () => {
  it('rejects a high-ratio member while counting actual expanded bytes', async () => {
    const zip = new JSZip(); zip.file('bomb.bin', new Uint8Array(128 * 1024));
    const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    expect(bytes.length).toBeLessThan(1024);
    const loaded = await JSZip.loadAsync(bytes);
    const outcome = await readBoundedZipEntry(loaded.file('bomb.bin')!, { remaining: 1024 }).then(() => 'accepted', e => String(e.message));
    expect(outcome).toContain('Expanded package exceeds');
  });
  it('shares one budget across entries and preserves exact valid bytes', async () => {
    const zip = new JSZip(); zip.file('first', new Uint8Array([0, 255, 128])); zip.file('second', new Uint8Array([1, 2, 3]));
    const loaded = await JSZip.loadAsync(await zip.generateAsync({ type: 'uint8array' }));
    const budget = { remaining: 5 };
    expect(Array.from(await readBoundedZipEntry(loaded.file('first')!, budget))).toEqual([0, 255, 128]);
    expect(budget.remaining).toBe(2);
    await expect(readBoundedZipEntry(loaded.file('second')!, budget)).rejects.toThrow('Expanded package exceeds');
  });
  it('does not trust a forged declared uncompressed size', async () => {
    const zip = new JSZip(); zip.file('member.bin', new Uint8Array(128 * 1024));
    const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    const central = bytes.findIndex((_, i) => bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 1 && bytes[i + 3] === 2);
    expect(central).toBeGreaterThan(0);
    new DataView(bytes.buffer).setUint32(central + 24, 1, true);
    const loaded = await JSZip.loadAsync(bytes);
    const outcome = await readBoundedZipEntry(loaded.file('member.bin')!, { remaining: 1024 }).then(() => 'accepted', e => String(e.message));
    expect(outcome).toContain('Expanded package exceeds');
  });

});
