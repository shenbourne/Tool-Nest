# Project state

- Current milestone: ToolNest unified developer-tools application
- Current phase: 05 — paste a file into the shared file-import control (`.workflow/phases/05-file-upload-paste/`), on branch `feature/phase-05-file-upload-paste` cut from `origin/master` `fcbc617`. Code commits `8a8655c` (pure clipboard helpers) and `d234553` (component + copy)
- Status: phase 05 is code-complete and verified; the branch is local-only (tracks `origin/master`, not pushed). `master` == `origin/master` == `fcbc617`: the earlier note here that `master` was ten commits ahead and unpushed no longer holds — those commits were pushed, verified with `git rev-list --left-right --count master...origin/master` = `0 0` and `git ls-remote --heads origin`. Phase 04 (`fix/images-to-gif-frame-loss`, 3 commits ahead of `master`) is complete and verified on its own branch and still unmerged — its STATE/phase documents live on that branch, not here
- Completed: phase 02 — media tools load the FFmpeg core with real progress and report load failures. Phase 03 — every media speed control does what it says (see `ROADMAP.md`). Phase 05 — every one of the 19 tools using `ToolFileUpload` now imports a file pasted with Ctrl+V anywhere on the page, filtered by the same `accept` rules naive-ui applies to a drop, appending in `multiple` controls and replacing in single-file ones, with a warning instead of a silent no-op when the pasted file is unsupported. Implemented as a `document` paste listener in the component plus the pure module `apps/web/src/utils/clipboard-files.ts`; rationale in `ADR-0001`
- In progress: nothing
- Blockers: none. `pnpm lint` still fails on the pre-existing baseline (231 errors / 88 files) and did so before phase 05; the four code files it touched or added were diff-linted against their base and linted clean, and the repo total is unchanged
- Last verification: 2026-09-30, on `feature/phase-05-file-upload-paste` — `scripts/verify`: `pnpm test` PASS (174 web + 52 server), `pnpm type-check` PASS, `pnpm build` PASS (32.63 s), `pnpm lint` FAIL on the pre-existing baseline only. Behavioural evidence in `ACCEPTANCE.md`: synthetic paste events plus two real OS-clipboard Ctrl+V pastes (`powershell Set-Clipboard -Path` + `press_key 'Control+v'`) importing a PDF and a PNG end-to-end, the rejection warning, the text-clipboard no-op, and listener mount/unmount instrumented in-page
- Next action: decide whether to push `feature/phase-05-file-upload-paste` and merge it into `master`, and separately whether to push and merge phase 04's `fix/images-to-gif-frame-loss` (both need the user's authorization). Then pick the next phase from the backlog below
- Follow-ups, none of them blocking: the ~28 media/text tools whose import control is still a bare `<input type="file">` have no paste support and diverge from the app's control style — migrating them to `ToolFileUpload` is the natural next phase and would bring paste for free; the local unmerged `tool-file-io-enhancement` branch (10 commits, per-tool paste/export) is superseded for paste by `ADR-0001`; bundle `@ffmpeg/core` locally instead of relying on CDNs; remove the now-unused `@ffmpeg/util` dependency; `images-to-gif`'s `NInputNumber` can hold `null` when cleared, which would emit `duration null` and `fps=Infinity` (pre-existing, unrelated); a one-frame GIF stores the GIF encoder's default hold instead of the requested one (phase 04 `ACCEPTANCE.md`); the `dispose`/progress/cancel findings in `.scratch/tool-interaction-audit/`; `apps/web/src/components.d.ts` shows as modified after any build or dev run but has an **empty** content diff — a CRLF artefact, do not stage it
- Updated: 2026-09-30

Keep this short and factual so another agent can resume without chat history.

## Notes for the next agent

### Repository mechanics

- Do not trust a green `pnpm lint`; it fails on a pre-existing baseline. Use per-file differential lint (`eslint --stdin --stdin-filename` against `git show HEAD:<path>`) for changed files. `scripts/verify` runs `pnpm lint`, which passes `--fix`; after running it, check `git status` for edits outside your phase.
- The `.qoder/hooks/commit-lint.mjs` hook validates **every** `-m` argument as a commit subject, so multi-line commit bodies (`-m subject -m body` or heredoc) are rejected. Use a single-line Conventional Commit subject; put detail in the phase docs.
- `pnpm build` and the dev server regenerate `apps/web/src/components.d.ts` (unplugin-vue-components). This file often shows as modified with an **empty** `git diff` — it is a CRLF artefact, not a change; do not stage it.
- `vue-tsc` and `vitest` do not catch malformed SFC structure; only `vite build` does.
- `apps/web/vitest.config.ts` runs in `environment: 'node'` and includes only `src/**/*.test.ts`, so logic inside `.vue` files is untestable. Pure helpers belong in a `.ts` module (`src/utils/*.test.ts` next to `src/utils/*.ts`, or a per-tool `*.service.ts`).
- The phase docs are per-branch: `STATE.md` and everything under `.workflow/phases/` differ between `master`, the phase-04 branch and the phase-05 branch. Expect conflicts when phases are merged, and resolve by keeping the newer phase's own records plus the other phase's status line.

### Media-tool domain rules established in phases 02–03

- A speed control's option value is the **playback-speed multiplier**. Video: `setpts=PTS/<speed>`; audio: `atempo=<speed>` (chained, because `atempo` accepts only `[0.5, 100]`); GIF: `[0:v]setpts=PTS/<speed>,fps=10[v]`. Build these through `apps/web/src/utils/ffmpeg-speed.ts` rather than inline — an inverted `setpts` still produces a valid, playable file, so the mistake is invisible without a duration check.
- `@ffmpeg/ffmpeg` must stay out of Vite's `optimizeDeps`; pre-bundling rewrites its worker URL to a non-existent `node_modules/.vite/deps/worker.js` and `ffmpeg.load()` then never settles.
- `unpkg.com` is unreachable from this machine's browser (~35 s then `ERR_CONNECTION_CLOSED`); `cdn.jsdelivr.net` works, and leads the fallback list.
- The app's `ffmpeg-core` 0.12.6 (FFmpeg **5.1.4**) and local `ffmpeg` **9.0.2** are not interchangeable. Verify behaviour that depends on the core version against the core, not the CLI.

### Paste support in the file-import control (established in phase 05)

- The `paste` listener lives on `document` inside `ToolFileUpload.vue`, because a paste with nothing focused is dispatched at the document, not at the control (`focus` was on `BODY` in the recorded tests). It ignores clipboards carrying no files, so the tools' own text inputs keep working.
- `apps/web/src/utils/clipboard-files.ts` mirrors naive-ui's drag-and-drop filter (`matchType`) rather than deep-importing `naive-ui/es/upload/src/utils.mjs`. If paste and drop ever disagree, that module is the place to fix.
- Accept semantics that matter for these tools: `.pdf` matches by name suffix, `image/*` by MIME type, an empty `accept` means everything, and an atom that is neither an extension nor a MIME type accepts everything (naive-ui's fall-through, kept identical).

### Browser verification recipe (Chrome DevTools MCP)

- `upload_file` rejects every path under this workspace, so generate the fixture, serve it, and inject it in-page: `fetch('/@fs/D:/…/fixture.mp4')` on the dev server (or cross-origin from the dev server when testing a `vite preview` build, which sends permissive CORS), then build a `File` and assign it to the real `<input type="file">` through a `DataTransfer` plus a `change` event.
- Pasting: `new ClipboardEvent('paste', { clipboardData: dt })` **does** attach the `DataTransfer` in this Chrome, and `dt.items.add(file)` populates both `dt.items` and `dt.files`, so a synthetic event exercises the real handler. For a genuine end-to-end check use the OS clipboard: `powershell Set-Clipboard -Path <file>`, then chrome-devtools `press_key 'Control+v'` — the renderer reads the clipboard with focus on `BODY`.
- A synthetic `DragEvent` **cannot** import into `NUpload`: naive-ui resolves `dataTransfer.items` through `webkitGetAsEntry()` and skips null entries with no `dataTransfer.files` fallback (`naive-ui/es/upload/src/UploadTrigger.mjs:55-66`). Do not read a synthetic drop's silence as a bug.
- Listener hygiene is observable by monkey-patching `document.add/removeEventListener` for `'paste'` and navigating with `__vue_app__.config.globalProperties.$router.push(...)`. Use a real in-app navigation rather than `history.pushState`+`popstate`, which does not mount lazy route components.
- To read a tool's result, walk up from `.n-card` via `el.__vueParentComponent` and read `setupState.resultData`. **This only works in dev builds** — production builds have no `__vueParentComponent`. In a production build, install a `URL.createObjectURL` wrapper and click the download button instead (the page's main world is shared with `evaluate_script`, so the wrapper does catch the blob).
- Measure media with real decoders: `HTMLVideoElement.duration` for video, `ImageDecoder` (`await dec.tracks.ready`, then sum `image.duration`) for GIF frame count and total duration.
- The web dev server's configured port is `3000`, but a stale process can hold it and Vite silently moves to `3002`/`3003` — read the startup log rather than assuming the port.
- Keep a single `evaluate_script` call under roughly 20 s of work; long polling loops make the MCP call fail with "tool invocation did not complete".
