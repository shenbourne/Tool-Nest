# Project state

- Current milestone: ToolNest unified developer-tools application
- Current phase: 03 — Speed controls run in the opposite direction to their labels (`.workflow/phases/03-speed-factor-inversion/`) — IMPLEMENTED, verified, merge pending authorization
- Status: branch `fix/speed-factor-inversion`, **stacked on `fix/ffmpeg-load-progress`** (still unmerged) at `34880b0`, because phase 02 rewrote the load controls in the same two `.vue` files. Holds `6aae401` (video filters + shared pure module), `9437ba4` (GIF option values + labels), `8d174df` (`images-to-gif` frame rate), plus the phase-records commit. Acceptance PASS, engineering checks PASS except the pre-existing lint baseline
- Completed: reported defect fixed, plus the same defect class found in two more tools. (a) `video-change-speed` applied the option value as an FFmpeg *duration* factor (`setpts=2*PTS`, `atempo=1/2`), so `2x（较快）` played at half speed — every option was inverted; the filters now come from `apps/web/src/utils/ffmpeg-speed.ts`, which states the convention that the option value is the playback-speed multiplier. (b) `gif-change-speed` had the same inverted notation with a self-contradicting label (`0.25x（极快）`); its values were re-paired and its labels rewritten so `Nx` means the same thing in all three speed tools. (c) `images-to-gif` labelled its control 「帧时长（秒）」 but computed `fps=round(1/d)`, which failed outright for `d>2` and ran ~1.1–2× fast for `1<d<2`; now `fps=1/d`
- In progress: nothing
- Blockers: none technical. `pnpm lint` still fails on the pre-existing baseline (231 errors / 88 files, unchanged by this work; every touched file was diff-linted against `HEAD` and shows an identical error count)
- Last verification: 2026-09-29 — `pnpm test` PASS (158 web + 52 server), `pnpm type-check` PASS, `pnpm build` PASS, differential lint on all changed files clean. Browser evidence (dev `:3411` and the built app via `vite preview :3412`) plus local `ffmpeg` 9.0.2: a 6.000 s clip gives 3.200 s at `2x（较快）`, 23.981 s at `0.25x（极慢）` and exactly 6.000 s at `1x`; pre-fix filters reproduced the reported 11.978 s. Details in `ACCEPTANCE.md` / `VERIFICATION.md`
- Next action: get the user's decision on merging. **Order matters: `fix/ffmpeg-load-progress` first, then `fix/speed-factor-inversion`,** because the latter is based on the former. Then consider the follow-ups below
- Follow-ups, none of them blocking: fix the pre-existing `images-to-gif` defect where the app's `ffmpeg-core` 0.12.6 emits one frame fewer than the number of images (recorded in phase 03 `ACCEPTANCE.md`); bundle `@ffmpeg/core` locally instead of relying on CDNs; remove the now-unused `@ffmpeg/util` dependency; the `dispose`/progress/cancel findings in `.scratch/tool-interaction-audit/`
- Updated: 2026-09-29

Keep this short and factual so another agent can resume without chat history.

## Notes for the next agent

### Repository mechanics

- Do not trust a green `pnpm lint`; it fails on a pre-existing baseline. Use per-file differential lint (`eslint --stdin --stdin-filename` against `git show HEAD:<path>`) for changed files.
- The `.qoder/hooks/commit-lint.mjs` hook validates **every** `-m` argument as a commit subject, so multi-line commit bodies (`-m subject -m body` or heredoc) are rejected. Use a single-line Conventional Commit subject; put detail in the phase docs.
- `pnpm build` and the dev server regenerate `apps/web/src/components.d.ts` (unplugin-vue-components). This file often shows as modified with an **empty** `git diff` — it is a CRLF artefact, not a change; do not stage it.
- `vue-tsc` and `vitest` do not catch malformed SFC structure; only `vite build` does.
- `apps/web/vitest.config.ts` runs in `environment: 'node'` and includes only `src/**/*.test.ts`, so logic inside `.vue` files is untestable. Pure helpers belong in a `.ts` module (`src/utils/*.test.ts` next to `src/utils/*.ts`, or a per-tool `*.service.ts`).

### Media-tool domain rules established in phases 02–03

- A speed control's option value is the **playback-speed multiplier**. Video: `setpts=PTS/<speed>`; audio: `atempo=<speed>` (chained, because `atempo` accepts only `[0.5, 100]`); GIF: `[0:v]setpts=PTS/<speed>,fps=10[v]`. Build these through `apps/web/src/utils/ffmpeg-speed.ts` rather than inline — an inverted `setpts` still produces a valid, playable file, so the mistake is invisible without a duration check.
- `@ffmpeg/ffmpeg` must stay out of Vite's `optimizeDeps`; pre-bundling rewrites its worker URL to a non-existent `node_modules/.vite/deps/worker.js` and `ffmpeg.load()` then never settles.
- `unpkg.com` is unreachable from this machine's browser (~35 s then `ERR_CONNECTION_CLOSED`); `cdn.jsdelivr.net` works, and leads the fallback list.
- The app's `ffmpeg-core` 0.12.6 and local `ffmpeg` 9.0.2 are not interchangeable: on the `images-to-gif` concat list the app drops the trailing image's `duration` while the CLI honours it. Verify behaviour that depends on FFmpeg version differences in the browser, not only with the CLI.

### Browser verification recipe (Chrome DevTools MCP)

- `upload_file` rejects every path under this workspace, so generate the fixture with the local `ffmpeg`, serve it, and inject it in-page: `fetch('/@fs/D:/…/fixture.mp4')` on the dev server (or cross-origin from the dev server when testing a `vite preview` build, which sends permissive CORS), then build a `File` and assign it to the real `<input type="file">` through a `DataTransfer` plus a `change` event.
- To read a tool's result, walk up from `.n-card` via `el.__vueParentComponent` and read `setupState.resultData`. **This only works in dev builds** — production builds have no `__vueParentComponent`. In a production build, install a `URL.createObjectURL` wrapper and click the download button instead (the page's main world is shared with `evaluate_script`, so the wrapper does catch the blob).
- Measure media with real decoders: `HTMLVideoElement.duration` for video, `ImageDecoder` (`await dec.tracks.ready`, then sum `image.duration`) for GIF frame count and total duration.
- Keep a single `evaluate_script` call under roughly 20 s of work; long polling loops make the MCP call fail with "tool invocation did not complete".
