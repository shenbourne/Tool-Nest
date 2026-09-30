# Phase context

- Phase: 06 — Unify the file-import control across the remaining tools
- Goal: Every tool that reads a local file presents the same import control — the shared `ToolFileUpload` (click, drag, paste, visible file list) — instead of an unstyled bare `<input type="file">`.
- Requirements: R-002 (unified, usable tool UI)
- Constraints: Vue 3 + naive-ui; bilingual (zh/en with English fallback); control-height baseline 42px per `DESIGN.md`; no new runtime dependency; no change to any tool's processing logic.
- Decisions already made: `ADR-0001` keeps the paste behavior inside the shared component, so migrating a tool is the only way it gains paste; the component stays the single implementation point. Scope confirmed with the user on 2026-09-30: **all 28 remaining tool components (29 inputs)**, not only the media ones.
- Open questions: none
- Boundary: IN scope — the 28 tool components under `apps/web/src/tools/` that still render a bare file input, the source-level guard test for that contract, and the i18n key that the migration makes dead. OUT of scope — every tool's conversion logic, `ToolFileUpload.vue` itself (it already satisfies all 29 shapes; only `video-add-audio` needs markup, not a prop), the FFmpeg composable, the object-URL/`dispose` defects logged in `.scratch/tool-interaction-audit/`, and the unmerged `tool-file-io-enhancement` branch.

## User report (evidence)

User report 2026-09-30: "这类音视频工具用的是原生 `<input type="file">`，而 phase 01 迁移到共享 ToolFileUpload 的 19 个是 PDF/图片工具，属既有 UI 不一致。将控件统一为PDF所用的控件UI".

The situation matches the repository exactly. Phase 01 built `ToolFileUpload.vue` and migrated the 19 tools that used a bare `<NUpload>`; phase 05 gave that control paste support. The remaining tools were explicitly deferred as "a separate UX decision" (`.workflow/phases/05-file-upload-paste/CONTEXT.md`) and recorded as the natural next phase in `STATE.md`.

| Family | Files | Inputs | Current affordance | After this phase |
| --- | --- | --- | --- | --- |
| Media (`audio-*`, `video-*`, `gif-*`, `images-to-gif`) | 19 | 20 | unstyled native input | `ToolFileUpload` with the same `accept` |
| `image-*`, `jpg-to-png` | 8 | 8 | native input + `<label for>` pair | `ToolFileUpload` |
| `base64-file-converter` (file → base64 card) | 1 | 1 | native input, no `accept` | `ToolFileUpload` |
| **Total** | **28** | **29** | | 47 tool components on the shared control once phase 01's 19 are counted |

## Shapes the migration has to preserve

- 25 single-file inputs (one of them, `video-add-audio`, is a *pair* of labelled inputs on one page), 3 multi-file inputs (`audio-merge`, `video-merge`, `images-to-gif` — all `multiple`), 1 input with no `accept` at all (`base64-file-converter`).
- `accept` values in use: `audio/*`, `video/*`, `image/*`, `image/gif`, `image/jpeg`, and empty.
- The 8 image tools paired the input with a `<label for="…">`; the control carries its own caption, so the label and the input's `id` go away. `common.uploadFile` (used by 6 of them) loses its last consumer — `jpg-to-png` uses `tools.jpgToPng.uploadImage`, which stays.

## Behavior deliberately added, not just restyled

The shared control has a **remove** button and a **file list**; a native input has neither. Removing the last file emits `change([])`, so every handler is rewritten from `files?.[0] ?? null` to the `File[]` contract and must **clear** its derived state (`file`, preview/object URL, previous result) instead of leaving the previous selection's output on screen next to an empty control. That is the same "state desync" class the repo already tracks, and it is why the image handlers lose their `if (f)` guard: with a remove affordance, an empty selection is a real event, not a no-op.
