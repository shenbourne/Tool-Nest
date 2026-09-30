# Implementation plan

- Branch/worktree: `feature/phase-07-file-thumbnails`, stacked on the phase-06 tip `7eb7a12` (see `CONTEXT.md` for why it is not cut from `origin/master`).
- Relevant files/interfaces:
  - `apps/web/src/utils/file-thumbnail.ts` (new, pure) — `thumbnailKind(file)` and the square-box geometry (`coverSourceRect`, `containDestRect`). No DOM, so it runs under the repo's node-environment vitest.
  - `apps/web/src/utils/file-thumbnail.test.ts` (new) — the automated evidence for the rules that cannot be reached from a browser check.
  - `apps/web/src/utils/thumbnail-render.ts` (new, DOM) — `renderThumbnailDataUrl(file, box)`, resolving to a `data:` URL or `null`. Keeps the component free of canvas/pdf.js/video plumbing.
  - `apps/web/src/components/ToolFileUpload.vue` — 48px row, 40px thumbnail, icon fallback, per-entry cache with a stale-entry guard.
- Risks:
  - pdf.js is ~330 KB: it must stay a **dynamic** import so image/audio tools never load it (the existing pdf tools do the same).
  - A `<video>` frame grab can hang on an undecodable file → hard timeout, and the object URL revoked in `finally`.
  - Rendering is async and the list is mutable (remove, replace, paste) → a resolved thumbnail must be dropped if its entry is gone.
  - The 42px → 48px row change touches all 47 tools → verified by re-running the phase-06 tool sweep, not only one page.

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | `file-thumbnail.ts` + test: kind from MIME/extension, cover and contain rects, degenerate sizes | `pnpm test` — RED observed (module missing), then 18 tests GREEN on the first implementation | `6e44df1 feat(web): add file thumbnail kind and geometry rules` | DONE |
| 2 | `thumbnail-render.ts`: image (bitmap), PDF (dynamic pdf.js page 1), video (frame + timeout), all falling back to `null` | `pnpm type-check`, `pnpm build` (pdf.js stayed a lazy 334 kB chunk, control chunk 8.21 kB), browser pixel checks per format | `4904961 feat(web): render image, PDF and video thumbnails` | DONE |
| 3 | `ToolFileUpload.vue`: 48px rows, 38px thumbnail, icon fallback, async fill with stale guard | browser sweep across PDF/image/video/audio/multi-file/replace/remove, light + dark | `158b51d feat(web): show an imported file's thumbnail in the list` | DONE |
| 4 | Verify: gates, differential lint, browser acceptance sweep, records | `VERIFICATION.md` / `ACCEPTANCE.md` | `docs(workflow): record phase 07 file thumbnails` | DONE |

Scope log — two deviations, recorded rather than silently applied:

1. **The thumbnail box became 38px instead of 40px.** Measured in the browser: with no global `box-sizing` reset a 40px box plus the row's 4px padding and 1px borders produced a 58px row, not the 48px `DESIGN.md` step. Fixed by declaring `box-sizing: border-box` and sizing the box at 38px, which is exact with token values only. `THUMBNAIL_BOX` follows.
2. **The branch base changed during implementation.** Created from the phase-06 tip, then based on the phase-06 *merge* in `master` (`427f269`) after another session merged it; the phase's three commits were moved off `master` onto this branch with the user's authorization. Details in `CONTEXT.md`.

`apps/web/src/components.d.ts` shows as modified after any build/dev run with an empty content diff (CRLF artefact, per `STATE.md`) and is never staged.
