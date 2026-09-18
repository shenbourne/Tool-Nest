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

vi.mock('@ffmpeg/util', () => ({
  toBlobURL: vi.fn((url: string) => Promise.resolve(url)),
}));

describe('useFFmpeg composable', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('starts in unloaded state', async () => {
    const { useFFmpeg } = await import('../useFFmpeg');
    const ffmpeg = useFFmpeg();
    expect(ffmpeg.isLoaded.value).toBe(false);
    expect(ffmpeg.isLoading.value).toBe(false);
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
    expect(ffmpeg.loadProgress.value).toBe(1);
  });

  it('returns the same instance on repeated calls (singleton)', async () => {
    const { useFFmpeg } = await import('../useFFmpeg');
    const a = useFFmpeg();
    const b = useFFmpeg();
    await a.load();
    await b.load();
    // Both composables share the same underlying instance
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
  });
});

describe('runFFmpegTask', () => {
  beforeEach(() => {
    vi.resetModules();
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

    // deleteFile should have been called for the temp files
    const deleteCalls = mockInstance?.deleteFile.mock.calls ?? [];
    expect(deleteCalls.length).toBe(2);
  });
});
