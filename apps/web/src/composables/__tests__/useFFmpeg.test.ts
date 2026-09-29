import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@ffmpeg/ffmpeg', () => {
  const mockFfmpeg = {
    loaded: false,
    load: vi.fn().mockImplementation(function (this: { loaded: boolean }) {
      this.loaded = true;
      return Promise.resolve();
    }),
    exec: vi.fn().mockResolvedValue(0),
    readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    writeFile: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    terminate: vi.fn(),
    on: vi.fn(),
  };
  return { FFmpeg: vi.fn(() => mockFfmpeg) };
});

const CHUNK = 64;
const ASSET_SIZES: Record<string, number> = {
  'ffmpeg-core.js': 3 * CHUNK,
  'ffmpeg-core.wasm': 5 * CHUNK,
};

function fakeReader(chunks: Uint8Array[]) {
  return {
    read: vi.fn().mockImplementation(() => {
      const value = chunks.shift();
      return Promise.resolve(
        value === undefined
          ? { done: true, value: undefined }
          : { done: false, value },
      );
    }),
  };
}

function mockFetch(overrides: { failUrls?: string[]; failHosts?: string[] } = {}) {
  const fetchMock = vi.fn((url: string | URL) => {
    const urlString = String(url);
    const name = urlString.split('/').pop() ?? '';
    if (overrides.failUrls?.includes(name)) {
      return Promise.reject(new TypeError('Failed to fetch'));
    }
    if (overrides.failHosts?.some((host) => urlString.includes(host))) {
      return Promise.reject(new TypeError('Failed to fetch'));
    }
    const size = ASSET_SIZES[name] ?? CHUNK;
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < size; i += CHUNK) {
      chunks.push(new Uint8Array(Math.min(CHUNK, size - i)));
    }
    return Promise.resolve({
      ok: true,
      headers: new Map([['content-length', String(size)]]),
      body: { getReader: () => fakeReader(chunks) },
    } as unknown as Response);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('useFFmpeg composable', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    mockFetch();
  });

  it('starts in unloaded state', async () => {
    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();
    expect(ffmpeg.isLoaded.value).toBe(false);
    expect(ffmpeg.isLoading.value).toBe(false);
    expect(ffmpeg.loadProgress.value).toBe(0);
    expect(ffmpeg.loadError.value).toBe('');
  });

  it('reports download progress before load resolves', async () => {
    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();

    const progressSamples: number[] = [];
    const unsubscribe = (await import('vue')).watch(
      ffmpeg.loadProgress,
      (v) => progressSamples.push(v),
    );

    await ffmpeg.load();
    unsubscribe();

    const total = Object.values(ASSET_SIZES).reduce((a, b) => a + b, 0);
    // progress must advance through intermediate values, not jump 0 -> 1
    expect(progressSamples.length).toBeGreaterThan(1);
    expect(Math.max(...progressSamples.slice(0, -1))).toBeGreaterThan(0);
    expect(Math.max(...progressSamples.slice(0, -1))).toBeLessThan(1);
    expect(ffmpeg.loadProgress.value).toBe(1);
    expect(total).toBe(8 * CHUNK);
  });

  it('downloads the core from jsdelivr first', async () => {
    const fetchMock = mockFetch();
    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();

    await ffmpeg.load();

    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls.length).toBeGreaterThan(0);
    expect(urls[0]).toContain('cdn.jsdelivr.net');
    expect(ffmpeg.isLoaded.value).toBe(true);
  });

  it('falls back to unpkg when jsdelivr fails', async () => {
    const fetchMock = mockFetch({ failHosts: ['cdn.jsdelivr.net'] });
    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();

    await ffmpeg.load();

    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls.some((url) => url.includes('unpkg.com'))).toBe(true);
    expect(ffmpeg.isLoaded.value).toBe(true);
    expect(ffmpeg.loadError.value).toBe('');
    expect(ffmpeg.loadProgress.value).toBe(1);
  });

  it('reports the failure when every core source is unreachable', async () => {
    mockFetch({ failUrls: ['ffmpeg-core.js', 'ffmpeg-core.wasm'] });
    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();

    await ffmpeg.load();

    expect(ffmpeg.isLoaded.value).toBe(false);
    expect(ffmpeg.loadError.value).toContain('cdn.jsdelivr.net');
    expect(ffmpeg.loadError.value).toContain('unpkg.com');
    expect(ffmpeg.loadProgress.value).toBe(0);
  });

  it('transitions to loading then loaded on load()', async () => {
    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();
    const loadPromise = ffmpeg.load();
    expect(ffmpeg.isLoading.value).toBe(true);
    await loadPromise;
    expect(ffmpeg.isLoaded.value).toBe(true);
    expect(ffmpeg.isLoading.value).toBe(false);
    expect(ffmpeg.loadError.value).toBe('');
  });

  it('surfaces download failures in loadError and allows retry', async () => {
    vi.unstubAllGlobals();
    mockFetch({ failUrls: ['ffmpeg-core.wasm'] });

    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();

    await ffmpeg.load();
    expect(ffmpeg.isLoaded.value).toBe(false);
    expect(ffmpeg.isLoading.value).toBe(false);
    expect(ffmpeg.loadError.value).not.toBe('');

    vi.unstubAllGlobals();
    mockFetch();
    await ffmpeg.load();
    expect(ffmpeg.isLoaded.value).toBe(true);
    expect(ffmpeg.loadError.value).toBe('');
  });

  it('returns the same instance on repeated calls (singleton)', async () => {
    const { useFFmpeg } = await import('../useFFmpeg');
    const a = useFFmpeg();
    const b = useFFmpeg();
    await a.load();
    await b.load();
    expect(a.isLoaded.value).toBe(true);
    expect(b.isLoaded.value).toBe(true);
  });

  it('dispose resets state', async () => {
    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();
    await ffmpeg.load();
    expect(ffmpeg.isLoaded.value).toBe(true);
    ffmpeg.dispose();
    expect(ffmpeg.isLoaded.value).toBe(false);
    expect(ffmpeg.loadProgress.value).toBe(0);
    expect(ffmpeg.loadError.value).toBe('');
  });
});

describe('runFFmpegTask', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    mockFetch();
  });

  it('provides ffmpeg instance and tempFile helper', async () => {
    const { useFFmpeg, runFFmpegTask } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();
    await ffmpeg.load();

    const result = await runFFmpegTask(async (ctx) => {
      expect(ctx.ffmpeg).toBeDefined();
      const tmp = ctx.tempFile('.mp4');
      expect(tmp).toMatch(/\.mp4$/);
      expect(tmp).toMatch(/^[a-f0-9-]+\.mp4$/);
      return 'done';
    });

    expect(result).toBe('done');
  });

  it('serializes concurrent tasks through the queue', async () => {
    const { useFFmpeg, runFFmpegTask } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();
    await ffmpeg.load();

    const order: number[] = [];

    const task1 = runFFmpegTask(async () => {
      await new Promise((r) => setTimeout(r, 50));
      order.push(1);
      return 'first';
    });

    const task2 = runFFmpegTask(async () => {
      order.push(2);
      return 'second';
    });

    const [r1, r2] = await Promise.all([task1, task2]);
    expect(r1).toBe('first');
    expect(r2).toBe('second');
    expect(order).toEqual([1, 2]);
  });

  it('cleans up temp files after task completes', async () => {
    const { useFFmpeg, runFFmpegTask } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();
    await ffmpeg.load();

    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const mockInstance = (FFmpeg as unknown as ReturnType<typeof vi.fn>).mock.results[0]?.value;
    mockInstance?.deleteFile.mockClear();

    await runFFmpegTask(async (ctx) => {
      ctx.tempFile('.wav');
      ctx.tempFile('.mp3');
      return null;
    });

    const deleteCalls = mockInstance?.deleteFile.mock.calls ?? [];
    expect(deleteCalls.length).toBe(2);
  });
});
