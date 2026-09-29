# Phase context

- Phase: 05 — Paste a file into the tool file-import control
- Goal: On any tool page whose file import uses the shared `ToolFileUpload` control, the user can paste a file from the clipboard (Ctrl+V / ⌘V) anywhere on the page and it is imported exactly as if it had been picked or dropped.
- Requirements: R-002 (unified, usable tool UI)
- Constraints: Vue 3 + naive-ui; bilingual (zh/en with English fallback); control-height baseline 42px per `DESIGN.md`; no new runtime dependency; no clipboard permission prompt.
- Decisions already made: `ADR-0001` (`.workflow/adr/ADR-0001-file-upload-paste.md`) — consume the `paste` event's `clipboardData`, not `navigator.clipboard.read()`; scope is the shared component, not the raw inputs.
- Open questions: none
- Boundary: IN scope — `apps/web/src/components/ToolFileUpload.vue` (19 PDF/image tools), its i18n strings, and the pure accept-matching helper it needs. OUT of scope — the `ToolLayout`-less bare `<input type="file">` controls in the ~28 media and text tools (a separate UX decision, see below); the `tool-file-io-enhancement` branch; anything already listed in `.scratch/tool-interaction-audit/findings.md`.

## User report (evidence)

User report 2026-09-30, with a screenshot of `/compress-pdf`: "这类导入文件的控件应当同时支持粘贴文件到网页内" — the file-import control should also accept a pasted file. The screenshot shows the phase 01 control: a `NUploadDragger` with `点击或拖拽文件到此处` / `支持格式：.pdf`, which today offers click and drag only.

Two distinct control families exist in `apps/web/src/tools/`:

| Family | Count | Current import affordance | Paste support |
| --- | --- | --- | --- |
| `@/components/ToolFileUpload.vue` (from phase 01) | 19 (`compress-pdf`, `convert-to-*`, `image-{compress,flip,opacity,resize,rotate,watermark}`, `pdf-*`) | `NUploadDragger` — click + drag | this phase |
| bare `<input type="file">` | ~28 media/text tools (`audio-*`, `video-*`, `gif-*`, `images-to-gif`, `image-{change-colors,crop,editor,split,…}`, `base64-file-converter`) | unstyled native input | not this phase |

The user's answer to the scope question was **only the shared `ToolFileUpload` component**. The bare inputs already diverge from the app's control style and are the subject of separate findings; touching them here would mix an unrelated restyle into this phase.

Related but deliberately unused history: the local, unmerged branch `tool-file-io-enhancement` (10 commits, 99 files, +3435 lines, branched from `5e8aa2b` — i.e. from **before** phase 01 introduced the shared component). It adds a per-tool 粘贴 button built on `navigator.clipboard.read()`, duplicated into ~47 tools. It is not on `origin` (only `master` is), and its per-tool duplication is superseded by the shared-component architecture, so this phase implements the capability once in the component instead of rebasing that branch. Recorded here so the next agent does not re-open the question.

## Semantics chosen

- Clipboard carrying **no files** (plain text, e.g. copying a URL) is ignored completely, so each tool's own text inputs keep working and nothing intercepts a normal text paste.
- Pasted files are filtered through the control's `accept` using the **same semantics naive-ui applies to drag-and-drop** (`.ext` suffix, `type/subtype` with `*`, comma-separated list, unknown atoms accept everything), so paste and drop cannot disagree.
- Any file that does not match is **not imported and is reported** — a silent no-op after an explicit Ctrl+V reads as a broken control, which is the D4-class defect this repo keeps tracking.
- `multiple: false` controls (17 of 19) **replace** the current selection, matching the existing pick behavior; `multiple: true` (`pdf-merge`) **appends**.
