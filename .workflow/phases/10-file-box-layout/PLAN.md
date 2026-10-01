# Implementation plan

- Branch/worktree: `feature/phase-10-file-box-layout`, cut from local `master` `b44a61a` (the main worktree is shared with another session; that session is working in `.worktrees/phase-09-thumbnail-preview`, so this branch stays on the main worktree).
- Relevant files/interfaces:
  - `apps/web/src/components/FileCard.vue` — the file item. Contract: the preview element is `width: 100%; height: 128px`, the image is `object-fit: contain` (thumbnails are square data URLs, so a wide cell letterboxes them instead of cropping), the filename is one ellipsised line below. The **container** decides the shape.
  - `apps/web/src/components/ToolFileUpload.vue` — the input box. `compact` is removed; `multiple` alone selects single vs multi. Keeps `NUpload`/`NUploadDragger` so drag-and-drop import keeps working in both shapes, keeps `triggerSelect()`/`triggerPaste()`, the document paste listener and the per-entry thumbnail cache.
  - `apps/web/src/utils/file-reorder.ts` (new) — pure `moveItem(list, from, to)` used by the drag handler, unit-tested under the node-environment vitest config like `file-thumbnail.ts`.
  - `apps/web/src/components/ToolFilePanel.vue` — gains `outputMultiple`, which turns the output column into a 128 px grid; a single output stays one full-width card (the `flex: 1` stretch is dropped).
  - `apps/web/src/tools/**` — `compact` removed from every `<ToolFileUpload>`; the two duplicate reorder lists deleted; the three multi-output tools hand their grid to the panel.
- Risks:
  - `FileCard` currently sits in a two-root template, so per-card drag listeners cannot fall through; the drag handlers go on the `<li>`/cell wrapper instead.
  - `video-merge` keeps its own `files` array for the FFmpeg concat list — the reorder must travel through the control's `change` event or the merge order silently stops following the tiles.
  - The repo's `pnpm lint` already fails on a 231-error baseline; only per-file differential lint counts.
  - `apps/web/src/components.d.ts` is a CRLF artefact — never stage it.

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | Phase records | this file + `CONTEXT.md` | pending | Planned |
| 2 | `utils/file-reorder.ts` + `file-reorder.test.ts` | `pnpm test` (pure module, forward/backward/no-op/immutability) | pending | Planned |
| 3 | `FileCard` preview 100%×128 px, `object-fit: contain` | browser measurement of a tile vs a wide card | pending | Planned |
| 4 | `ToolFileUpload` single/multi rendering + drag reorder, `compact` dropped | browser: empty zone, wide card, tile grid, drag order | pending | Planned |
| 5 | `ToolFilePanel` `outputMultiple` + no single-card stretch | browser: single output card vs multi grid | pending | Planned |
| 6 | Migrate tools (`compact`, hand lists, output grids, locale keys) | guard test + browser over the affected routes | pending | Planned |
| 7 | Guard test pins the box contract | `pnpm test` | pending | Planned |
| 8 | Verification + acceptance records | `scripts/verify`, differential lint, browser | pending | Planned |

Update this plan when discoveries change the implementation. Record scope changes rather than silently replacing them.
