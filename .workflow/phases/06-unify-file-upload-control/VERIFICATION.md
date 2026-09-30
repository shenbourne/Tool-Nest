# Verification

Tree verified: `feature/phase-06-unify-file-upload-control` at `55b3421` (base `origin/master` `15c8496`). Commands were run from the repository root on 2026-09-30 unless noted.

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| Tests | `pnpm test` (via `scripts/verify`) | PASS — 183 web tests in 30 files, 52 server tests in 8 files (was 181/29 before this phase; +2 from the new guard test) | `.scratch/phase-06-evidence/verify-final.log` |
| Type check | `pnpm type-check` (via `scripts/verify`) | PASS | same log |
| Build | `pnpm build` (via `scripts/verify`) | PASS — built in 19.15 s; this is the check that catches malformed SFC structure (`vue-tsc`/`vitest` do not) | same log |
| Lint | `pnpm lint` (via `scripts/verify`) | **FAIL — 231 errors in 88 files**, identical to the pre-phase baseline recorded in `STATE.md` (231/88). Every error is a pre-existing rule violation (`no-explicit-any`, `no-unused-vars`, `vue/require-v-for-key`) | same log |
| Differential lint | `node .scratch/phase-06-evidence/differential-lint.mjs 15c8496` — per-file eslint error count now vs at the base commit | **PASS — TOTAL delta 0.** Each of the 30 changed files has exactly its base count (e.g. `video-crop` 8→8, `gif-change-speed` 7→7, `base64-file-converter` 0→0); the new test file has 0 | `.scratch/phase-06-evidence/differential-lint.txt` |
| Guard test (RED) | `npx vitest run src/tools/tool-file-import-controls.test.ts` before the migration | FAIL as expected — 2 failed tests, 28 offending components listed, 28 controls missing | `.scratch/phase-06-evidence/guard-test-red.txt` |
| Guard test (GREEN) | same command after the migration | PASS — 2 tests | `.scratch/phase-06-evidence/verify-final.log` |
| Browser acceptance | Chrome DevTools MCP against `http://localhost:3000` (dev server already running; Vite serves the working tree, so each navigation compiled the migrated file from disk) | See `ACCEPTANCE.md` — 8 routes exercised: `/audio-trim`, `/video-add-audio`, `/image-split`, `/base64-file-converter`, `/video-merge`, `/images-to-gif`, `/gif-change-speed`, `/audio-extract` | measurements in `ACCEPTANCE.md` |
| Working tree after `--fix` | `git status --short` after `scripts/verify` | Clean — `scripts/verify` runs `pnpm lint --fix`, and it changed nothing outside this phase's files. The only modified non-phase entry is `apps/web/src/components.d.ts`, the known empty-diff CRLF artefact, left unstaged | repository state |

## Not verified

- **20 of the 28 migrated pages were not opened in a browser.** Live checks covered every distinct control shape (single audio, single video, paired inputs, multi-file video, multi-file image, `image/gif`, `image/jpeg`-class image tool, no-accept). The remaining pages share one of those shapes and their `accept`/`multiple`/control count are pinned by the guard test, which reads the components from disk; that is the substitute for a live click, not a claim that they were clicked.
- **The drop path was not exercised.** Phase 05 recorded that a synthetic `DragEvent` cannot import into `NUpload` (naive-ui resolves `dataTransfer.items` through `webkitGetAsEntry()` and skips null entries) — its silence is not evidence of a bug. The drag code path is untouched by this phase.
- **Visual styling was not judged visually.** The evidence is geometry (`594×126` / `586×126`), `border-style: dashed`, and the rendered caption/hint strings; the screenshot could not be saved into the workspace (the MCP refuses paths under the workspace root).
- **`image-to-text-ocr`, `image-editor`, `image-crop` and `image-remove-background` were not run end-to-end**, because their processing needs the OCR/Konva/background-removal paths (heavy or network-bound). `image-split` covers the canvas-based image family end-to-end.
- The first multi-file probe in this session first read `ToolFileUpload`'s own `files` computed instead of the tool's ref (both are named `files`) and reported 1 file next to 2 listed names. Re-probing the tool component directly showed control list, DOM list and tool state agreeing at every step. Recorded because that intermediate reading is not valid evidence.
