import { ref, type Ref } from 'vue';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const CORE_VERSION = '0.12.6';
// jsdelivr is reachable where unpkg is not (verified in-browser), so it leads.
const CORE_BASE_URLS = [
  `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`,
  `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`,
];

let sharedInstance: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;
// Progress listener for the task currently holding the serialized queue.
let activeTaskProgress: ((progress: number) => void) | null = null;

const isLoadedRef: Ref<boolean> = ref(false);
const isLoadingRef: Ref<boolean> = ref(false);
const loadProgressRef: Ref<number> = ref(0);
const loadErrorRef: Ref<string> = ref('');

export interface UseFFmpegReturn {
  isLoaded: Ref<boolean>;
  isLoading: Ref<boolean>;
  loadProgress: Ref<number>;
  loadError: Ref<string>;
  load(): Promise<FFmpeg | undefined>;
  exec(cmd: string[]): Promise<{ exitCode: number }>;
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  dispose(): void;
}

async function downloadAsset(
  url: string,
  mimeType: string,
  onBytes: (loaded: number, total: number) => void,
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url} (HTTP ${response.status})`);
  }
  const total = Number(response.headers.get('content-length')) || 0;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onBytes(loaded, total);
  }
  return URL.createObjectURL(new Blob(chunks, { type: mimeType }));
}

async function loadSharedInstance(): Promise<FFmpeg> {
  if (sharedInstance?.loaded) {
    return sharedInstance;
  }

  if (!loadingPromise) {
    loadingPromise = (async () => {
      const failures: string[] = [];

      for (const baseUrl of CORE_BASE_URLS) {
        const ffmpeg = new FFmpeg();

        ffmpeg.on('progress', ({ progress }: { progress: number }) => {
          loadProgressRef.value = Math.min(progress, 1);
          activeTaskProgress?.(Math.min(progress, 1));
        });

        // ffmpeg.load() emits no progress events of its own — track real
        // download progress across both core assets ourselves.
        const assets = [
          { url: `${baseUrl}/ffmpeg-core.js`, mimeType: 'text/javascript' },
          { url: `${baseUrl}/ffmpeg-core.wasm`, mimeType: 'application/wasm' },
        ];
        const loadedBytes = assets.map(() => 0);
        const totalBytes = assets.map(() => 0);
        const updateProgress = () => {
          const total = totalBytes.reduce((a, b) => a + b, 0);
          if (total > 0) {
            const loaded = loadedBytes.reduce((a, b) => a + b, 0);
            loadProgressRef.value = Math.min(loaded / total, 1);
          }
        };

        let blobURLs: string[] = [];
        try {
          blobURLs = await Promise.all(
            assets.map((asset, i) =>
              downloadAsset(asset.url, asset.mimeType, (loaded, total) => {
                loadedBytes[i] = loaded;
                totalBytes[i] = total;
                updateProgress();
              }),
            ),
          );

          await ffmpeg.load({
            coreURL: blobURLs[0],
            wasmURL: blobURLs[1],
          });

          sharedInstance = ffmpeg;
          loadProgressRef.value = 1;
          return ffmpeg;
        } catch (e: unknown) {
          failures.push(`${baseUrl}: ${e instanceof Error ? e.message : String(e)}`);
          loadProgressRef.value = 0;
        } finally {
          blobURLs.forEach((url) => URL.revokeObjectURL(url));
        }
      }

      throw new Error(`FFmpeg core download failed — ${failures.join('; ')}`);
    })();
  }

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

export function useFFmpeg(): UseFFmpegReturn {
  async function load(): Promise<FFmpeg | undefined> {
    isLoadingRef.value = true;
    loadErrorRef.value = '';
    loadProgressRef.value = 0;
    try {
      const instance = await loadSharedInstance();
      isLoadedRef.value = true;
      return instance;
    } catch (e: unknown) {
      loadErrorRef.value =
        e instanceof Error ? e.message : 'FFmpeg failed to load';
      return undefined;
    } finally {
      isLoadingRef.value = false;
    }
  }

  async function exec(cmd: string[]): Promise<{ exitCode: number }> {
    const ffmpeg = sharedInstance;
    if (!ffmpeg) throw new Error('FFmpeg not loaded — call load() first');
    const exitCode = await ffmpeg.exec(cmd);
    return { exitCode };
  }

  async function readFile(path: string): Promise<Uint8Array> {
    const ffmpeg = sharedInstance;
    if (!ffmpeg) throw new Error('FFmpeg not loaded — call load() first');
    return ffmpeg.readFile(path) as Promise<Uint8Array>;
  }

  async function writeFile(path: string, data: Uint8Array): Promise<void> {
    const ffmpeg = sharedInstance;
    if (!ffmpeg) throw new Error('FFmpeg not loaded — call load() first');
    await ffmpeg.writeFile(path, data);
  }

  function dispose(): void {
    sharedInstance?.terminate();
    sharedInstance = null;
    loadingPromise = null;
    isLoadedRef.value = false;
    isLoadingRef.value = false;
    loadProgressRef.value = 0;
    loadErrorRef.value = '';
  }

  return {
    isLoaded: isLoadedRef,
    isLoading: isLoadingRef,
    loadProgress: loadProgressRef,
    loadError: loadErrorRef,
    load,
    exec,
    readFile,
    writeFile,
    dispose,
  };
}

type FFmpegTaskContext = {
  ffmpeg: FFmpeg;
  tempFile: (extension: string) => string;
};

let taskQueue: Promise<unknown> = Promise.resolve();

export async function runFFmpegTask<T>(
  task: (context: FFmpegTaskContext) => Promise<T>,
  onProgress?: (progress: number) => void,
): Promise<T> {
  if (!sharedInstance) throw new Error('FFmpeg not loaded — call load() first');
  const ffmpeg = sharedInstance;

  const run = taskQueue
    .catch(() => {})
    .then(async () => {
      const tempFiles = new Set<string>();

      const tempFile = (extension: string) => {
        const filename = `${crypto.randomUUID()}${extension}`;
        tempFiles.add(filename);
        return filename;
      };

      // Tasks are serialized, so a single slot is enough to route progress
      // events to whichever task is currently running.
      activeTaskProgress = onProgress ?? null;
      try {
        return await task({ ffmpeg, tempFile });
      } finally {
        if (activeTaskProgress === (onProgress ?? null)) activeTaskProgress = null;
        await Promise.all(
          [...tempFiles].map((file) => ffmpeg.deleteFile(file).catch(() => {})),
        );
      }
    });

  taskQueue = run.catch(() => {});
  return run;
}
