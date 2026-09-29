# Phase context

- Phase: 02 — FFmpeg load progress stuck at 0%
- Goal: In every audio/video/GIF tool, clicking 「加载 FFmpeg」 either loads the core with visible, advancing progress, or reports a clear reason why it failed. No silently hanging spinner.
- Source: user bug report 2026-09-28 (screenshot of `/audio-converter`, 「加载 FFmpeg」 spinner with the progress bar pinned at 0%). Durable requirement IDs do not apply; this is a defect fix.
- Constraints:
  - `@ffmpeg/ffmpeg` 0.12.15 emits `progress` only during `exec()`. The `load()` path emits nothing (`node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js` LOAD handler returns only `LOADED`), and `toBlobURL()` reports no bytes.
  - `ffmpeg-wasm` needs the library's own `worker.js` at runtime; the library creates it via `new Worker(new URL('./worker.js', import.meta.url))` and never subscribes to worker errors, so any worker startup failure hangs `ffmpeg.load()` forever.

## Root causes (all three had to be fixed for the tool to work)

1. **No load-time progress** — `useFFmpeg.ts` only updated `loadProgressRef` from `ffmpeg.on('progress')`, which never fires during `load()`. All 19 media tools render `<NProgress :percentage="loadProgress * 100">` while `isLoading`, so the bar sat at 0% for the entire core download (9.26 MB wasm + ~32 KB js).
2. **Worker never started (the actual hang)** — Vite's dependency pre-bundling rewrote `new Worker(new URL('./worker.js', import.meta.url))` to `/@fs/…/apps/web/node_modules/.vite/deps/worker.js?worker_file&type=module`, a file that does not exist (404). The worker therefore never started, `ffmpeg.load()` never settled, and the button spinner ran forever. Evidence: `fetch('/node_modules/.vite/deps/worker.js')` → 404; the rewritten URL inside the pre-bundled dep; and Vite's own log line *"The file does not exist at …/deps/worker.js which is in the optimize deps directory. The dependency might be incompatible with the dep optimizer. Try adding it to `optimizeDeps.exclude`."*
3. **Unreachable CDN** — `unpkg.com` is not reachable from the user's browser: `fetch` failed after ~35 s in-page while `cdn.jsdelivr.net` returned 200 in 678 ms (wasm 9.26 MB, `access-control-allow-origin: *`). Even with (1) and (2) fixed, the load would still fail on unpkg.

## Decisions already made

- Core download progress is tracked by our own streaming `fetch` reader (bytes received / `content-length` across both assets) instead of `toBlobURL`, which cannot report progress.
- Core sources are tried in order **jsdelivr → unpkg** (user decision, 2026-09-28). Bundling `@ffmpeg/core` into the app (no CDN dependency, +9.3 MB static asset and a larger Docker image) was deliberately **not** done in this phase and remains an open option.
- `@ffmpeg/ffmpeg` is excluded from `optimizeDeps` (dev-only config; the production build already bundled the worker as `dist/assets/worker-*.js`).
- Load failures are exposed as `loadError` and rendered by the tools; `load()` no longer leaks an unhandled rejection from `@click="load"`.

## Boundary

- In scope: `apps/web/vite.config.ts`, `apps/web/src/composables/useFFmpeg.ts`, its unit tests, and the load-error alert in the 19 tool templates that render the load button.
- Out of scope: per-task (exec) progress display, local bundling of `@ffmpeg/core`, removing the now-unused `@ffmpeg/util` dependency, and the audit findings (dispose/leak, filter-argument bugs) recorded in `.scratch/tool-interaction-audit/`.
