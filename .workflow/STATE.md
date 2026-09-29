# Project state

- Current milestone: ToolNest unified developer-tools application
- Current phase: none active. Phases 02 and 03 are both merged into `master`; the next non-trivial work needs a new numbered phase (see the unassigned backlog in `ROADMAP.md` / `DEVELOPMENT_PLAN.md`)
- Status: `master` tip `8970c50`, ten commits ahead of `origin/master` and **not pushed** (remote writes are the user's call). Phase 02 was merged at `183296d`, phase 03 at `8970c50`, in that order. Both feature branches (`fix/ffmpeg-load-progress` `34880b0`, `fix/speed-factor-inversion` `f9dcd27`) are kept, not deleted. Merged `apps`/`packages` content is byte-identical to the verified phase-03 tip (`apps` tree `41c144c6`); the gate below was re-run on merged `master`
- Completed: phase 02 — media tools load the FFmpeg core with real progress and report load failures. Phase 03 — every media speed control does what it says: `video-change-speed` had all six options inverted (the reported `2x（较快）` was half speed), `gif-change-speed` carried the same inverted notation in its labels, and `images-to-gif` computed `fps=round(1/d)`, which failed outright above `d=2`. A pure module (`apps/web/src/utils/ffmpeg-speed.ts`) now owns the convention that a speed option's value is the playback-speed multiplier
- In progress: nothing
- Blockers: none. `pnpm lint` still fails on the pre-existing baseline (231 errors / 88 files) and did so before both phases; every file touched by phase 03 was diff-linted against its base with an identical error count
- Last verification: 2026-09-29, on merged `master` — `pnpm test` PASS (158 web + 52 server), `pnpm type-check` PASS, `pnpm build` PASS (19.18s), `pnpm lint` FAIL on the pre-existing baseline only. Content-level proof: `git diff fix/speed-factor-inversion HEAD -- apps packages` is empty and the `apps` tree hash matches. Phase 03's browser and CLI evidence is in `.workflow/phases/03-speed-factor-inversion/ACCEPTANCE.md` / `VERIFICATION.md`
- Next action: decide whether to push `master` to `origin` (10 commits: phases 02 and 03). Then pick the next phase from the backlog below
- Follow-ups, none of them blocking: fix the pre-existing `images-to-gif` defect where the app's `ffmpeg-core` 0.12.6 emits one frame fewer than the number of images (recorded in phase 03 `ACCEPTANCE.md`); bundle `@ffmpeg/core` locally instead of relying on CDNs; remove the now-unused `@ffmpeg/util` dependency; the `dispose`/progress/cancel findings in `.scratch/tool-interaction-audit/`; `apps/web/src/components.d.ts` shows as modified after any build or dev run but has an **empty** content diff — a CRLF artefact, do not stage it
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
