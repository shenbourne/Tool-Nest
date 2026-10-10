import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { writeClipboardImage, writeClipboardText } from './clipboard';

const globalAny = globalThis as unknown as Record<string, unknown>;
const originalNavigator = globalAny.navigator;
const originalDocument = globalAny.document;
const originalClipboardItem = globalAny.ClipboardItem;

function setGlobal(key: string, value: unknown) {
  Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
}

function restoreGlobal(key: string, value: unknown) {
  if (value === undefined) delete globalAny[key];
  else setGlobal(key, value);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  restoreGlobal('navigator', originalNavigator);
  restoreGlobal('document', originalDocument);
  restoreGlobal('ClipboardItem', originalClipboardItem);
});

describe('writeClipboardText', () => {
  it('returns false for empty text without touching the clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setGlobal('navigator', { clipboard: { writeText } });

    await expect(writeClipboardText('')).resolves.toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('uses the async clipboard API and reports success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setGlobal('navigator', { clipboard: { writeText } });

    await expect(writeClipboardText('abc')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('abc');
  });

  it('falls back to the legacy path when the async API is rejected', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    setGlobal('navigator', { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    const textarea = { value: '', style: {}, setAttribute: vi.fn(), select: vi.fn() };
    setGlobal('document', {
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      createElement: vi.fn().mockReturnValue(textarea),
      execCommand,
    });

    await expect(writeClipboardText('abc')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(textarea.value).toBe('abc');
  });

  it('uses the legacy path when the async clipboard API is missing', async () => {
    setGlobal('navigator', {});
    const execCommand = vi.fn().mockReturnValue(true);
    setGlobal('document', {
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      createElement: vi.fn().mockReturnValue({
        value: '', style: {}, setAttribute: vi.fn(), select: vi.fn(),
      }),
      execCommand,
    });

    await expect(writeClipboardText('abc')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('reports failure when both paths are unavailable', async () => {
    setGlobal('navigator', {});
    restoreGlobal('document', undefined);

    await expect(writeClipboardText('abc')).resolves.toBe(false);
  });

  it('reports failure when the legacy command returns false', async () => {
    setGlobal('navigator', {});
    setGlobal('document', {
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      createElement: vi.fn().mockReturnValue({
        value: '', style: {}, setAttribute: vi.fn(), select: vi.fn(),
      }),
      execCommand: vi.fn().mockReturnValue(false),
    });

    await expect(writeClipboardText('abc')).resolves.toBe(false);
  });

  it('removes the helper textarea even when copying throws', async () => {
    setGlobal('navigator', {});
    const removeChild = vi.fn();
    setGlobal('document', {
      body: { appendChild: vi.fn(), removeChild },
      createElement: vi.fn().mockReturnValue({
        value: '',
        style: {},
        setAttribute: vi.fn(),
        select: vi.fn(() => { throw new Error('select failed'); }),
      }),
      execCommand: vi.fn(),
    });

    await expect(writeClipboardText('abc')).resolves.toBe(false);
    expect(removeChild).toHaveBeenCalledTimes(1);
  });
});

describe('writeClipboardImage', () => {
  it('reports failure when ClipboardItem is unavailable', async () => {
    restoreGlobal('ClipboardItem', undefined);
    setGlobal('navigator', { clipboard: { write: vi.fn() } });

    await expect(writeClipboardImage(new Blob())).resolves.toBe(false);
  });

  it('reports failure when the clipboard API is unavailable', async () => {
    setGlobal('ClipboardItem', class {});
    setGlobal('navigator', {});

    await expect(writeClipboardImage(new Blob())).resolves.toBe(false);
  });

  it('writes the blob and reports success', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    setGlobal('ClipboardItem', class { constructor(public items: unknown) {} });
    setGlobal('navigator', { clipboard: { write } });
    const blob = new Blob(['x'], { type: 'image/png' });

    await expect(writeClipboardImage(blob)).resolves.toBe(true);
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('reports failure when writing the image is rejected', async () => {
    setGlobal('ClipboardItem', class { constructor(public items: unknown) {} });
    setGlobal('navigator', { clipboard: { write: vi.fn().mockRejectedValue(new Error('nope')) } });

    await expect(writeClipboardImage(new Blob())).resolves.toBe(false);
  });
});
