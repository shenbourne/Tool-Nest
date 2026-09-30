# Phase context

- Phase: 07 — Show a thumbnail of each imported file in the shared control
- Goal: Every file in `ToolFileUpload`'s list shows a thumbnail of its own content, so the user can confirm the import without reading the file name — for images, the image itself; for PDFs, the first page; for videos, the first frame; for anything else, a type icon.
- Requirements: R-002 (unified, usable tool UI)
- Constraints: Vue 3 + naive-ui; bilingual (zh/en, English fallback); `DESIGN.md` tokens only (no hardcoded colors, no new token tiers); control-height ladder 36/42/48/54px; no new runtime dependency (pdf.js and canvas are already in use); the 47 tools' processing logic is untouched.
- Decisions already made: user answers on 2026-09-30 — coverage is **images + PDF first page + video first frame**, with a type icon for everything else; presentation is a **48px row** (the `DESIGN.md` "large" step) with a thumbnail in that row. `ADR-0001` still governs paste, which now composes with this (a pasted file is thumbnailed like a picked one). **Correction recorded 2026-09-30:** the thumbnail renders at **38px**, not the 40px the answered option read, because the app has no global `box-sizing` reset and 40 + 2×4px padding + 2×1px border rendered a 58px row. 38px with `box-sizing: border-box` on the row and the box lands it exactly on 48px using token values only; the renderer's `THUMBNAIL_BOX` matches. See `ACCEPTANCE.md` "Recorded deviations".
- Open questions: none
- Boundary: IN scope — `apps/web/src/components/ToolFileUpload.vue`, two new modules under `apps/web/src/utils/` (pure geometry/kind rules, and the DOM renderer), and their tests and docs. OUT of scope — per-tool preview panes (many image tools already render their own large preview; this phase does not remove or merge those), audio waveforms, archive/zip contents, the phase 06 migrations, and the object-URL/`dispose` defects in `.scratch/tool-interaction-audit/`.

## User report (evidence)

User report 2026-09-30: "导入的文件应当显示缩略图" — after phase 06 every tool shows one import control, and that control's list currently shows only the file name plus 移除.

## Branch base, and why it is not the remote base

`AGENTS.md` says a new phase branches from the fetched remote base. This one is based on the phase-06 merge in local `master` (`427f269`) instead, for a verifiable reason:

- Phase 06 is what puts the control on the media, image and base64 tools. On `origin/master` (`15c8496`, which predates it) only the 19 PDF/image tools render the control, and none of them accepts `video/*` or `audio/*`, so the video-frame and icon-fallback behaviours could not be exercised in the browser at all — the two riskiest code paths in this phase.

The branch was first created from the phase-06 tip `7eb7a12`; while the phase was being implemented another session merged phase 06 into local `master` (`37c7898` merge, `427f269` records) and left this shared working tree checked out on `master`, so the phase's three commits initially landed on `master` itself. With the user's authorization (2026-09-30) `master` was moved back to `427f269` and the commits were placed on `feature/phase-07-file-thumbnails` (now based on `427f269`). No pushed commit was involved: `origin/master` is `15c8496`, an ancestor of `427f269`, and the only commits that left `master` were this phase's three unpublished ones. Nothing in this phase touches a file phase 06 changed, so an eventual merge into `master` is additive.

## Rendering rules

| Input | Source of the thumbnail | Failure mode |
| --- | --- | --- |
| `image/*` | `createImageBitmap(file)` → centre-cropped square on canvas | decode error → icon |
| `application/pdf` / `.pdf` | dynamic `import('pdfjs-dist')`, page 1 rendered to a canvas (the same worker pattern `pdf-to-png` uses) | encrypted/corrupt PDF, or the pdf.js chunk failing to load → icon |
| `video/*` | `<video>` + object URL, seek to a small offset, draw the frame to a canvas | codec the browser cannot decode, or a decode that never settles → icon |
| anything else | — | icon (`FileMusic` for `audio/*`, otherwise `File`) |

Two properties the implementation must hold regardless of input:

1. **A thumbnail failure is never an error the user sees.** Every rendering path resolves to `null` on any problem, and the row falls back to the icon. Importing a file must not be blocked, slowed indefinitely, or broken by its preview.
2. **The file list must not add object-URL churn.** The repo already carries an object-URL-lifecycle defect class (`.scratch/tool-interaction-audit/`, D11). Thumbnails are therefore produced as **data URLs** and cached per list entry: images via `createImageBitmap` (no URL at all), PDFs and videos via a canvas draw. The one object URL the video path needs is revoked in a `finally`, and the browser check counts `createObjectURL`/`revokeObjectURL` calls to prove the balance.
