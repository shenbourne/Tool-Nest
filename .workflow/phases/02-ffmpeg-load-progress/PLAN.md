# Implementation plan

- Branch/worktree: `fix/ffmpeg-load-progress` (from `master`)
- Relevant files/interfaces:
  - `apps/web/vite.config.ts` — `optimizeDeps.exclude: ['@ffmpeg/ffmpeg']`.
  - `apps/web/src/composables/useFFmpeg.ts` — streaming `downloadAsset()` with byte progress; `CORE_BASE_URLS` (jsdelivr → unpkg) tried in order; new `loadError: Ref<string>` in `UseFFmpegReturn`; `load()` returns `Promise<FFmpeg | undefined>` and reports failures instead of rejecting.
  - `apps/web/src/composables/__tests__/useFFmpeg.test.ts` — `fetch` mock with a fake chunked reader; asserts intermediate progress, source order, fallback, total failure, retry.
  - 19 media tool `*.vue` files (`audio-*`, `video-*`, `gif-change-speed`, `images-to-gif`) — destructure `loadError`, render `<NAlert v-if="loadError" type="error" :title="loadError" />`.
- Risks: a mirror without `content-length` leaves progress at 0 (error path still works); blob URLs are revoked right after `ffmpeg.load()` resolves (mirrors the previous `toBlobURL` lifetime).

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | Rewrite `useFFmpeg.test.ts` for streaming progress + `loadError` (red against the old composable) | `pnpm vitest run …/useFFmpeg.test.ts` red: `toBlobURL` path throws, 9 failed | pending | Done |
| 2 | Streaming download + `loadError` in `useFFmpeg.ts` | 9/9 green | pending | Done |
| 3 | CDN fallback (jsdelivr first, unpkg second) + tests for order/fallback/exhaustion | 12/12 green | pending | Done |
| 4 | Load-error alert in 19 tool templates | `git diff --numstat` = `2 1` per file; differential lint unchanged (base = now) | pending | Done |
| 5 | Discovery during browser verification: dev worker URL 404s, so `ffmpeg.load()` never settles — `optimizeDeps.exclude` added | Vite log line + `deps/worker.js` 404 + load/completion before/after | pending | Done |
| 6 | Browser + gate verification (dev and production build), phase records | see `VERIFICATION.md`, `ACCEPTANCE.md` | pending | Done |

## Scope changes recorded during the phase

- The plan originally assumed a progress-display bug only. Browser reproduction showed the load never completed at all (task 5) and that unpkg is unreachable from the user's browser (task 3). Both were folded into this phase because the reported symptom ("stuck at 0%") is produced by them; the user chose the jsdelivr→unpkg fallback over local bundling.
