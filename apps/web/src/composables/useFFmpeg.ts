import { ref, type Ref } from 'vue';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const CORE_VERSION = '0.12.6';
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let sharedInstance: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;
// Progress listener for the task currently holding the serialized queue.
let activeTaskProgress: ((progress: number) => void) | null = null;

const isLoadedRef: Ref<boolean> = ref(false);
const isLoadingRef: Ref<boolean> = ref(false);
const loadProgressRef: Ref<number> = ref(0);

export interface UseFFmpegReturn {
  isLoaded: Ref<boolean>;
  isLoading: Ref<boolean>;
  loadProgress: Ref<number>;
  load(): Promise<FFmpeg>;
  exec(cmd: string[]): Promise<{ exitCode: number }>;
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  dispose(): void;
}

async function loadSharedInstance(): Promise<FFmpeg> {
  if (sharedInstance?.loaded) {
    return sharedInstance;
  }

  if (!loadingPromise) {
    loadingPromise = (async () => {
      const ffmpeg = new FFmpeg();

      ffmpeg.on('progress', ({ progress }: { progress: number }) => {
        loadProgressRef.value = Math.min(progress, 1);
        activeTaskProgress?.(Math.min(progress, 1));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      sharedInstance = ffmpeg;
      loadProgressRef.value = 1;
      return ffmpeg;
    })();
  }

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

export function useFFmpeg(): UseFFmpegReturn {
  async function load(): Promise<FFmpeg> {
    isLoadingRef.value = true;
    try {
      const instance = await loadSharedInstance();
      isLoadedRef.value = true;
      return instance;
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
  }

  return {
    isLoaded: isLoadedRef,
    isLoading: isLoadingRef,
    loadProgress: loadProgressRef,
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
