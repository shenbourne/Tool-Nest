# Implementation plan

- Branch/worktree: `feature/phase-10-file-box-layout`, cut from local `master` `b44a61a`. Developed in the main worktree; **moved to `.worktrees/phase-10-file-box-layout` mid-phase** after another session took the main worktree (see VERIFICATION.md).
- Relevant files/interfaces:
  - `apps/web/src/components/FileCard.vue` — the file item. Contract: the preview element is `width: 100%; height: 128px`, the image is `object-fit: contain` (thumbnails are square data URLs, so a wide cell letterboxes them instead of cropping), the filename is one ellipsised line below. The **container** decides the shape.
  - `apps/web/src/components/ToolFileUpload.vue` — the input box. `compact` is removed; `multiple` alone selects single vs multi. Keeps `NUpload`/`NUploadDragger` so drag-and-drop import keeps working in both shapes, keeps `triggerSelect()`/`triggerPaste()`, the document paste listener and the per-entry thumbnail cache. naive's `n-upload-trigger` wrapper is `inline-block` and would shrink-wrap the grid to one column, so it is widened with `:deep()`.
  - `apps/web/src/utils/file-reorder.ts` — pure `moveItem(list, from, to)` used by the drag handler, unit-tested under the node-environment vitest config like `file-thumbnail.ts`.
  - `apps/web/src/components/ToolFilePanel.vue` — gains `outputMultiple`, which turns the output column into a 128 px grid; a single output stays one full-width card (the `flex: 1` stretch is dropped).
  - `apps/web/src/tools/**` — `compact` removed from every `<ToolFileUpload>`; the two duplicate reorder lists deleted; the three multi-output tools hand their grid to the panel.
- Risks (all realised and handled, see VERIFICATION.md):
  - `FileCard` sits in a two-root template, so per-card drag listeners cannot fall through; the drag handlers went on the `<li>`/cell wrapper instead.
  - `video-merge` keeps its own `files` array for the FFmpeg concat list — the reorder travels through the control's `change` event; verified the merge order follows the tiles.
  - The repo's `pnpm lint` already fails on a 231-error baseline; only per-file differential lint counts (0 added / 0 removed).
  - `apps/web/src/components.d.ts` / `auto-imports.d.ts` are CRLF/dev-server artefacts — never staged.

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | Phase records | CONTEXT.md + this file | `cbe4b93` | Done |
| 2 | `utils/file-reorder.ts` + test | 7 unit tests PASS | `f284398` | Done |
| 3 | `FileCard` preview 100%×128 px, `object-fit: contain` | browser: tile 128×128, wide card 392×128 | `fe9a10e` | Done |
| 4 | `ToolFileUpload` single/multi rendering + drag reorder, `compact` dropped | browser: empty zone, wide card, tile grid, drag order, drop highlight | `1c2c2b0`, `dd18abe` | Done |
| 5 | `ToolFilePanel` `outputMultiple` + no single-card stretch | browser: single output card vs multi grid | `8b8510a` | Done |
| 6 | Migrate tools (`compact`, hand lists, output grids, locale keys) | guard test + browser over the affected routes | `1b5b9f5`, `12780b7` | Done |
| 7 | Guard test pins the box contract | 4 tests in `tool-file-import-controls.test.ts` PASS | `8b37647` | Done |
| 8 | Verification + acceptance records | `pnpm test` 228 web + 52 server PASS, type-check PASS, build PASS (38.14 s), differential lint 0/0, browser evidence below | this file set | Done |

Update this plan when discoveries change the implementation. Record scope changes rather than silently replacing them.
