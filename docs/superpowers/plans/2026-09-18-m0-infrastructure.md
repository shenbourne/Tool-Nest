# M0 Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the four infrastructure modules (FFmpeg composable, vue-konva setup, backend network endpoints, new dependencies) that all subsequent migration batches (M1–M8) depend on.

**Architecture:** FFmpeg.wasm runs as a singleton in the browser with a task-queue serializer and auto-cleanup. vue-konva is registered as a global Vue plugin. Six new Express endpoints proxy network-test requests to Globalping and OONI APIs with SSRF protection and rate limiting. All new npm dependencies are installed in a single task.

**Tech Stack:** @ffmpeg/ffmpeg 0.12, @ffmpeg/util 0.12, vue-konva 3, konva 9, Express 4, Vitest 1, TypeScript 5.4

**Spec:** `docs/superpowers/specs/2026-09-18-full-migration-design.md`

## Global Constraints

- FFmpeg composable lives in `apps/web/src/composables/useFFmpeg.ts` (not `packages/shared` — shared has no Vue dependency)
- Server routes follow the pattern in `apps/server/src/routes/reports.ts`: named `Router()` export, `AppError` for errors, `ApiResponse<T>` response shape
- Server tests follow `apps/server/src/__tests__/routes.test.ts`: `vi.resetModules()`, `vi.stubEnv('DATA_DIR', testDir)`, ephemeral `app.listen(0)`, native `fetch()`
- All new web dependencies use exact version pins matching the spec's M0.4 table
- Network endpoints reuse `isPrivateHost` / `validateUrl` from `middleware/security.ts`
- Rate limit for network endpoints: 10 req/15min (separate limiter from the global 100/15min)

---

### Task 1: Install All New Dependencies (M0.4)

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/server/package.json`
- Modify: `pnpm-lock.yaml` (auto)

**Interfaces:**
- Consumes: nothing
- Produces: all packages from spec M0.4 table available in `node_modules`

- [ ] **Step 1: Install web dependencies**

Run from repo root:
```bash
pnpm --filter @toolnest/web add @ffmpeg/ffmpeg@^0.12.15 @ffmpeg/util@^0.12.2 vue-konva@^3.0.0 konva@^9.3.0 qrcode@^1.5.4 figlet@^1.8.0 js-yaml@^4.1.0 @iarna/toml@^2.2.5 xml-js@^1.6.11 markdown-it@^14.1.0 sql-formatter@^15.4.0 libphonenumber-js@^1.11.0 iban@^0.0.14 pdfjs-dist@^4.7.76 html2canvas@^1.4.1 otplib@^12.0.1 ua-parser-js@^2.0.0
```

- [ ] **Step 2: Install web type definitions**

```bash
pnpm --filter @toolnest/web add -D @types/qrcode@^1.5.5 @types/figlet@^1.7.0 @types/js-yaml@^4.0.9 @types/markdown-it@^14.1.0 @types/ua-parser-js@^0.7.39
```

- [ ] **Step 3: Verify web type-check passes with new deps**

```bash
pnpm --filter @toolnest/web type-check
```
Expected: no errors (new packages are unused so far, just installed)

- [ ] **Step 4: Commit**

```bash
git add pnpm-lock.yaml apps/web/package.json
git commit -m "chore(deps): install all M0 dependencies for migration infrastructure"
```

---

### Task 2: FFmpeg Composable — Core Singleton (M0.1)

**Files:**
- Create: `apps/web/src/composables/useFFmpeg.ts`
- Test: `apps/web/src/composables/__tests__/useFFmpeg.test.ts`

**Interfaces:**
- Consumes: `@ffmpeg/ffmpeg` (FFmpeg class), `@ffmpeg/util` (toBlobURL)
- Produces: `useFFmpeg()` composable returning `{ isLoaded, isLoading, loadProgress, load, exec, readFile, writeFile, dispose }`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/composables/__tests__/useFFmpeg.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @toolnest/web exec vitest run src/composables/__tests__/useFFmpeg.test.ts
```
Expected: FAIL — `useFFmpeg` module does not exist

- [ ] **Step 3: Write the composable implementation**

Create `apps/web/src/composables/useFFmpeg.ts`:

```typescript
import { ref, type Ref } from 'vue';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const CORE_VERSION = '0.12.6';
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let sharedInstance: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @toolnest/web exec vitest run src/composables/__tests__/useFFmpeg.test.ts
```
Expected: all 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/composables/useFFmpeg.ts apps/web/src/composables/__tests__/useFFmpeg.test.ts
git commit -m "feat(web): add FFmpeg composable with singleton pattern and progress tracking"
```

---

### Task 3: FFmpeg Task Queue Helper

**Files:**
- Modify: `apps/web/src/composables/useFFmpeg.ts`
- Modify: `apps/web/src/composables/__tests__/useFFmpeg.test.ts`

**Interfaces:**
- Consumes: the `useFFmpeg()` composable from Task 2
- Produces: `runFFmpegTask<T>(task)` exported function with auto temp-file cleanup

- [ ] **Step 1: Write the failing test for runFFmpegTask**

Append to `apps/web/src/composables/__tests__/useFFmpeg.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @toolnest/web exec vitest run src/composables/__tests__/useFFmpeg.test.ts
```
Expected: FAIL — `runFFmpegTask` is not exported

- [ ] **Step 3: Add runFFmpegTask to useFFmpeg.ts**

Add the following to the end of `apps/web/src/composables/useFFmpeg.ts`, before the closing of the file:

```typescript
type FFmpegTaskContext = {
  ffmpeg: FFmpeg;
  tempFile: (extension: string) => string;
};

let taskQueue: Promise<unknown> = Promise.resolve();

export async function runFFmpegTask<T>(
  task: (context: FFmpegTaskContext) => Promise<T>,
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

      try {
        return await task({ ffmpeg, tempFile });
      } finally {
        await Promise.all(
          [...tempFiles].map((file) => ffmpeg.deleteFile(file).catch(() => {})),
        );
      }
    });

  taskQueue = run.catch(() => {});
  return run;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @toolnest/web exec vitest run src/composables/__tests__/useFFmpeg.test.ts
```
Expected: all 7 tests PASS (4 from Task 2 + 3 new)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/composables/useFFmpeg.ts apps/web/src/composables/__tests__/useFFmpeg.test.ts
git commit -m "feat(web): add runFFmpegTask with queue serialization and temp-file cleanup"
```

---

### Task 4: vue-konva Plugin Registration (M0.2)

**Files:**
- Modify: `apps/web/src/main.ts`
- Test: `apps/web/src/__tests__/konva-setup.test.ts`

**Interfaces:**
- Consumes: `vue-konva`, `konva` packages (installed in Task 1)
- Produces: vue-konva components (`<v-stage>`, `<v-layer>`, etc.) available globally in Vue templates

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/__tests__/konva-setup.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createApp } from 'vue';
import { defineComponent, h } from 'vue';

describe('vue-konva plugin registration', () => {
  it('registers v-stage and v-layer as global components', async () => {
    const VueKonva = (await import('vue-konva')).default;
    const app = createApp(defineComponent({ render: () => h('div') }));
    app.use(VueKonva);

    const registered = app.component('v-stage');
    expect(registered).toBeDefined();

    const layer = app.component('v-layer');
    expect(layer).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @toolnest/web exec vitest run src/__tests__/konva-setup.test.ts
```
Expected: FAIL — `v-stage` component is not registered (no plugin installed)

- [ ] **Step 3: Register vue-konva in main.ts**

Add the import and plugin registration to `apps/web/src/main.ts`. After `import 'virtual:uno.css';` add:

```typescript
import VueKonva from 'vue-konva';
```

After `app.use(i18n);` add:

```typescript
app.use(VueKonva);
```

The full file should now be:

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { i18n } from './i18n';
import { usePreferencesStore } from './stores/preferences.store';
import VueKonva from 'vue-konva';
import './styles/tokens.css';
import './styles/global.css';
import 'virtual:uno.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(VueKonva);

const preferencesStore = usePreferencesStore();
preferencesStore.load();

app.mount('#app');
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @toolnest/web exec vitest run src/__tests__/konva-setup.test.ts
```
Expected: PASS

- [ ] **Step 5: Run full type-check**

```bash
pnpm --filter @toolnest/web type-check
```
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/main.ts apps/web/src/__tests__/konva-setup.test.ts
git commit -m "feat(web): register vue-konva plugin for image editing tools"
```

---

### Task 5: Globalping Service (M0.3 — Part 1)

**Files:**
- Create: `apps/server/src/services/globalping.ts`
- Test: `apps/server/src/__tests__/globalping.test.ts`

**Interfaces:**
- Consumes: native `fetch()` (Node 24 has it globally)
- Produces: `createMeasurement(params)` and `getMeasurement(id)` functions

- [ ] **Step 1: Write the failing test**

Create `apps/server/src/__tests__/globalping.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('GlobalpingService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it('creates a measurement and returns the response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'meas-123',
          status: 'in-progress',
        }),
    });

    const { GlobalpingService } = await import('../services/globalping');
    const result = await GlobalpingService.createMeasurement({
      type: 'ping',
      target: 'example.com',
      locations: [{ type: 'country', magic: 'US', limit: 2 }],
    });

    expect(result.id).toBe('meas-123');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.globalping.io/v1/measurements',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('retries polling until measurement is finished', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'meas-456', status: 'in-progress' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'meas-456',
            status: 'finished',
            results: [{ probe: { country: 'US' }, result: { status: 'finished' } }],
          }),
      });

    const { GlobalpingService } = await import('../services/globalping');
    const result = await GlobalpingService.createAndPoll(
      {
        type: 'ping',
        target: 'example.com',
        locations: [{ type: 'country', magic: 'US', limit: 1 }],
      },
      { pollIntervalMs: 10, maxPolls: 5 },
    );

    expect(result.status).toBe('finished');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    });

    const { GlobalpingService } = await import('../services/globalping');
    await expect(
      GlobalpingService.createMeasurement({
        type: 'ping',
        target: 'example.com',
        locations: [],
      }),
    ).rejects.toThrow('Globalping API error');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @toolnest/server exec vitest run src/__tests__/globalping.test.ts
```
Expected: FAIL — module `../services/globalping` not found

- [ ] **Step 3: Implement the Globalping service**

Create `apps/server/src/services/globalping.ts`:

```typescript
const API_BASE = 'https://api.globalping.io/v1';

export interface MeasurementLocation {
  type: 'country' | 'city' | 'asn' | 'network' | 'magic';
  magic: string;
  limit: number;
}

export interface CreateMeasurementParams {
  type: 'ping' | 'mtr' | 'dns' | 'traceroute';
  target: string;
  locations: MeasurementLocation[];
  measurementsLimit?: number;
}

export interface MeasurementResponse {
  id: string;
  status: string;
  results?: unknown[];
}

export interface PollOptions {
  pollIntervalMs?: number;
  maxPolls?: number;
}

export const GlobalpingService = {
  async createMeasurement(params: CreateMeasurementParams): Promise<MeasurementResponse> {
    const res = await fetch(`${API_BASE}/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`Globalping API error ${res.status}: ${(body as { message?: string }).message ?? 'unknown'}`);
    }

    return res.json() as Promise<MeasurementResponse>;
  },

  async getMeasurement(id: string): Promise<MeasurementResponse> {
    const res = await fetch(`${API_BASE}/measurements/${id}`);

    if (!res.ok) {
      throw new Error(`Globalping API error ${res.status}`);
    }

    return res.json() as Promise<MeasurementResponse>;
  },

  async createAndPoll(
    params: CreateMeasurementParams,
    options: PollOptions = {},
  ): Promise<MeasurementResponse> {
    const { pollIntervalMs = 500, maxPolls = 60 } = options;
    const measurement = await this.createMeasurement(params);

    for (let i = 0; i < maxPolls; i++) {
      if (measurement.status === 'finished') return measurement;

      await new Promise((r) => setTimeout(r, pollIntervalMs));
      const updated = await this.getMeasurement(measurement.id);
      Object.assign(measurement, updated);
    }

    throw new Error(`Measurement ${measurement.id} timed out after ${maxPolls} polls`);
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @toolnest/server exec vitest run src/__tests__/globalping.test.ts
```
Expected: all 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/services/globalping.ts apps/server/src/__tests__/globalping.test.ts
git commit -m "feat(server): add Globalping service for network measurements"
```

---

### Task 6: OONI Service (M0.3 — Part 2)

**Files:**
- Create: `apps/server/src/services/ooni.ts`
- Test: `apps/server/src/__tests__/ooni.test.ts`

**Interfaces:**
- Consumes: native `fetch()`
- Produces: `checkCensorship(urls)` function returning per-URL censorship status

- [ ] **Step 1: Write the failing test**

Create `apps/server/src/__tests__/ooni.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('OoniService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it('checks censorship for a list of URLs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            { input: 'https://example.com', confirmed: false, anomaly: false },
            { input: 'https://blocked.example.org', confirmed: true, anomaly: true },
          ],
        }),
    });

    const { OoniService } = await import('../services/ooni');
    const results = await OoniService.checkCensorship([
      'https://example.com',
      'https://blocked.example.org',
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].confirmed).toBe(false);
    expect(results[1].confirmed).toBe(true);
  });

  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const { OoniService } = await import('../services/ooni');
    await expect(OoniService.checkCensorship(['https://example.com'])).rejects.toThrow(
      'OONI API error',
    );
  });

  it('rejects empty URL list', async () => {
    const { OoniService } = await import('../services/ooni');
    await expect(OoniService.checkCensorship([])).rejects.toThrow('At least one URL');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @toolnest/server exec vitest run src/__tests__/ooni.test.ts
```
Expected: FAIL — module `../services/ooni` not found

- [ ] **Step 3: Implement the OONI service**

Create `apps/server/src/services/ooni.ts`:

```typescript
const OONI_API_BASE = 'https://api.ooni.io/api/v1';

export interface CensorshipResult {
  input: string;
  confirmed: boolean;
  anomaly: boolean;
}

export const OoniService = {
  async checkCensorship(urls: string[]): Promise<CensorshipResult[]> {
    if (urls.length === 0) {
      throw new Error('At least one URL is required');
    }

    const res = await fetch(`${OONI_API_BASE}/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: urls,
        test_name: 'web_connectivity',
        since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
    });

    if (!res.ok) {
      throw new Error(`OONI API error ${res.status}`);
    }

    const data = (await res.json()) as { results: CensorshipResult[] };
    return data.results;
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @toolnest/server exec vitest run src/__tests__/ooni.test.ts
```
Expected: all 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/services/ooni.ts apps/server/src/__tests__/ooni.test.ts
git commit -m "feat(server): add OONI censorship check service"
```

---

### Task 7: Network Routes — Ping, MTR, Latency (M0.3 — Part 3)

**Files:**
- Create: `apps/server/src/routes/network.ts`
- Test: `apps/server/src/__tests__/network-routes.test.ts`

**Interfaces:**
- Consumes: `GlobalpingService` from Task 5, `AppError` from `middleware/error-handler`, `isValidDomain` from `@toolnest/shared`
- Produces: `networkRouter` with POST `/ping`, `/mtr`, `/latency` endpoints

- [ ] **Step 1: Write the failing test**

Create `apps/server/src/__tests__/network-routes.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';

let server: Server;
let baseUrl: string;

beforeEach(async () => {
  vi.resetModules();

  vi.doMock('../services/globalping', () => ({
    GlobalpingService: {
      createAndPoll: vi.fn().mockResolvedValue({
        id: 'mock-meas',
        status: 'finished',
        results: [{ probe: { country: 'US' }, result: { status: 'finished', timings: [] } }],
      }),
    },
  }));

  vi.doMock('../services/ooni', () => ({
    OoniService: {
      checkCensorship: vi.fn().mockResolvedValue([
        { input: 'https://example.com', confirmed: false, anomaly: false },
      ]),
    },
  }));

  const { networkRouter } = await import('../routes/network');
  const { errorHandler } = await import('../middleware/error-handler');

  const app = express();
  app.use(express.json());
  app.use('/api/network', networkRouter);
  app.use(errorHandler);

  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  vi.unstubAllEnvs();
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('POST /api/network/ping', () => {
  it('returns measurement results for a valid target', async () => {
    const res = await fetch(`${baseUrl}/api/network/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'example.com', locations: [{ type: 'country', magic: 'US', limit: 2 }] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('finished');
  });

  it('rejects missing target', async () => {
    const res = await fetch(`${baseUrl}/api/network/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/network/mtr', () => {
  it('returns MTR results', async () => {
    const res = await fetch(`${baseUrl}/api/network/mtr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'example.com' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe('POST /api/network/latency', () => {
  it('returns latency results', async () => {
    const res = await fetch(`${baseUrl}/api/network/latency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'example.com' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @toolnest/server exec vitest run src/__tests__/network-routes.test.ts
```
Expected: FAIL — module `../routes/network` not found

- [ ] **Step 3: Implement the network routes**

Create `apps/server/src/routes/network.ts`:

```typescript
import { Router } from 'express';
import { AppError } from '../middleware/error-handler.js';
import { GlobalpingService } from '../services/globalping.js';
import type { ApiResponse } from '@toolnest/shared';
import { isValidDomain } from '@toolnest/shared';

export const networkRouter = Router();

interface NetworkRequestBody {
  target?: string;
  locations?: Array<{ type: string; magic: string; limit: number }>;
}

function validateTarget(target: unknown): string {
  if (typeof target !== 'string' || target.trim().length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Target is required');
  }
  const cleaned = target.trim();
  if (!isValidDomain(cleaned) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(cleaned)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Target must be a valid domain or IP address');
  }
  return cleaned;
}

const DEFAULT_LOCATIONS = [{ type: 'country' as const, magic: 'US', limit: 2 }];

networkRouter.post('/ping', async (req, res, next) => {
  try {
    const target = validateTarget(req.body?.target);
    const locations = req.body?.locations ?? DEFAULT_LOCATIONS;

    const result = await GlobalpingService.createAndPoll(
      { type: 'ping', target, locations },
      { pollIntervalMs: 500, maxPolls: 60 },
    );

    const response: ApiResponse = { success: true, data: result };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

networkRouter.post('/mtr', async (req, res, next) => {
  try {
    const target = validateTarget(req.body?.target);
    const locations = req.body?.locations ?? DEFAULT_LOCATIONS;

    const result = await GlobalpingService.createAndPoll(
      { type: 'mtr', target, locations },
      { pollIntervalMs: 1000, maxPolls: 60 },
    );

    const response: ApiResponse = { success: true, data: result };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

networkRouter.post('/latency', async (req, res, next) => {
  try {
    const target = validateTarget(req.body?.target);
    const locations = req.body?.locations ?? DEFAULT_LOCATIONS;

    const result = await GlobalpingService.createAndPoll(
      { type: 'dns', target, locations },
      { pollIntervalMs: 500, maxPolls: 60 },
    );

    const response: ApiResponse = { success: true, data: result };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @toolnest/server exec vitest run src/__tests__/network-routes.test.ts
```
Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/routes/network.ts apps/server/src/__tests__/network-routes.test.ts
git commit -m "feat(server): add network routes for ping, MTR, and latency tests"
```

---

### Task 8: Network Routes — DNS Leak, Rule Test, Censorship (M0.3 — Part 4)

**Files:**
- Modify: `apps/server/src/routes/network.ts`
- Modify: `apps/server/src/__tests__/network-routes.test.ts`

**Interfaces:**
- Consumes: `OoniService` from Task 6, `GlobalpingService` from Task 5
- Produces: POST `/dns-leak`, `/rule-test`, `/censorship` endpoints added to `networkRouter`

- [ ] **Step 1: Write the failing tests**

Append to `apps/server/src/__tests__/network-routes.test.ts`:

```typescript
describe('POST /api/network/dns-leak', () => {
  it('returns DNS resolution results', async () => {
    const res = await fetch(`${baseUrl}/api/network/dns-leak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains: ['example.com', 'test.org'] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('rejects empty domain list', async () => {
    const res = await fetch(`${baseUrl}/api/network/dns-leak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains: [] }),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/network/rule-test', () => {
  it('returns DNS resolution for rule testing', async () => {
    const res = await fetch(`${baseUrl}/api/network/rule-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'example.com', dnsServer: '8.8.8.8' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('rejects missing domain', async () => {
    const res = await fetch(`${baseUrl}/api/network/rule-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/network/censorship', () => {
  it('returns censorship check results', async () => {
    const res = await fetch(`${baseUrl}/api/network/censorship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: ['https://example.com'] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it('rejects empty URL list', async () => {
    const res = await fetch(`${baseUrl}/api/network/censorship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [] }),
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @toolnest/server exec vitest run src/__tests__/network-routes.test.ts
```
Expected: FAIL — new endpoints return 404

- [ ] **Step 3: Add the three new endpoints to network.ts**

Append to `apps/server/src/routes/network.ts` (after the `/latency` route):

```typescript
import dns from 'node:dns';
import { promisify } from 'node:util';
import { OoniService } from '../services/ooni.js';

const dnsResolve = promisify(dns.resolve);

networkRouter.post('/dns-leak', async (req, res, next) => {
  try {
    const { domains } = req.body ?? {};

    if (!Array.isArray(domains) || domains.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'At least one domain is required');
    }

    const results = await Promise.all(
      domains.map(async (domain: string) => {
        try {
          const addresses = await dnsResolve(domain);
          return { domain, resolved: true, addresses };
        } catch {
          return { domain, resolved: false, addresses: [] };
        }
      }),
    );

    const response: ApiResponse = { success: true, data: results };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

networkRouter.post('/rule-test', async (req, res, next) => {
  try {
    const { domain, dnsServer } = req.body ?? {};

    if (typeof domain !== 'string' || domain.trim().length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Domain is required');
    }

    const resolver = new dns.Resolver();
    if (typeof dnsServer === 'string' && dnsServer.trim()) {
      resolver.setServers([dnsServer]);
    }

    const resolveAsync = promisify(resolver.resolve4.bind(resolver));
    const addresses = await resolveAsync(domain.trim());

    const response: ApiResponse = { success: true, data: { domain: domain.trim(), addresses } };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

networkRouter.post('/censorship', async (req, res, next) => {
  try {
    const { urls } = req.body ?? {};

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'At least one URL is required');
    }

    const results = await OoniService.checkCensorship(urls);

    const response: ApiResponse = { success: true, data: results };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @toolnest/server exec vitest run src/__tests__/network-routes.test.ts
```
Expected: all 11 tests PASS (5 from Task 7 + 6 new)

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/routes/network.ts apps/server/src/__tests__/network-routes.test.ts
git commit -m "feat(server): add dns-leak, rule-test, and censorship network endpoints"
```

---

### Task 9: Mount Network Router in Server Entry Point

**Files:**
- Modify: `apps/server/src/index.ts`

**Interfaces:**
- Consumes: `networkRouter` from `routes/network.ts`
- Produces: `/api/network/*` routes accessible on the running server

- [ ] **Step 1: Add the import and mount**

In `apps/server/src/index.ts`, add the import after the existing route imports (line 8):

```typescript
import { networkRouter } from './routes/network.js';
```

Add the mount after `app.use('/api/reports', reportsRouter);` (line 35):

```typescript
app.use('/api/network', networkRouter);
```

- [ ] **Step 2: Run server type-check**

```bash
pnpm --filter @toolnest/server type-check
```
Expected: no errors

- [ ] **Step 3: Run all server tests**

```bash
pnpm --filter @toolnest/server test
```
Expected: all tests PASS

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/index.ts
git commit -m "feat(server): mount network router at /api/network"
```

---

### Task 10: Final Verification — Full Project Check

**Files:**
- No new files

**Interfaces:**
- Consumes: all modules from Tasks 1–9
- Produces: confidence that M0 infrastructure is complete and green

- [ ] **Step 1: Run full server test suite**

```bash
pnpm --filter @toolnest/server test
```
Expected: all tests PASS

- [ ] **Step 2: Run full web test suite**

```bash
pnpm --filter @toolnest/web test
```
Expected: all tests PASS

- [ ] **Step 3: Run server type-check**

```bash
pnpm --filter @toolnest/server type-check
```
Expected: no errors

- [ ] **Step 4: Run web type-check**

```bash
pnpm --filter @toolnest/web type-check
```
Expected: no errors

- [ ] **Step 5: Run shared package type-check**

```bash
pnpm --filter @toolnest/shared type-check
```
Expected: no errors

- [ ] **Step 6: Verify FFmpeg composable exports exist**

```bash
grep -E "export (function|async function) (useFFmpeg|runFFmpegTask)" apps/web/src/composables/useFFmpeg.ts
```
Expected: two lines — `export function useFFmpeg()` and `export async function runFFmpegTask()`

- [ ] **Step 7: Start dev server and verify no startup errors**

```bash
timeout 10 pnpm --filter @toolnest/server dev 2>&1 || true
```
Expected: "ToolNest server running on port 3001" appears, no crash

- [ ] **Step 8: Update inventory status**

No inventory changes needed — M0 is infrastructure, not tool migrations. But verify the spec's M0 checklist:

- FFmpeg composable: `apps/web/src/composables/useFFmpeg.ts` exists with `useFFmpeg()` + `runFFmpegTask()`
- vue-konva: `app.use(VueKonva)` in `main.ts`
- Network routes: 6 endpoints mounted at `/api/network/`
- Dependencies: all M0.4 packages in `apps/web/package.json`
