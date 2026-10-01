# Phase 11: Text Tool Two-Column Actions Layout

## Context

Phase 09 unified all *file*-based tools (PDF/audio/video/image) on `ToolFilePanel`:
two columns (input | output), one actions row (`导入文件 粘贴文件` left, `复制文件 导出文件`
right), parameters below. The *text*-based tools (~84 of them: JSON/XML/YAML/TOML/CSV/TSV/
SQL/HTML/Markdown/base64/Docker converters, list-* and text-* tools, math/time converters)
still render one `NCard` per textarea with ad-hoc button rows, so they have no import,
paste, copy, or export actions at all.

User requirement (grilling-confirmed 2026-10-02):

1. **Two columns.** Each column keeps its existing title + textarea on top; below the
   textarea comes the PDF-style actions bar; parameters / declarations (if any) go at
   the bottom of the page.
2. **Button distribution** (user picked explicitly): input column = `导入文件` `粘贴文件`;
   output column = `复制` `导出文件`. Together the two columns carry exactly the four
   buttons of the PDF actions bar.
3. **Scope**: all two-textarea text tools (~85). Structured data formats **plus** pure
   text / list tools — i.e. every tool whose page is fundamentally
   "input textarea → transform → output textarea".
4. **Frontend only**: no backend / processing-logic changes.
5. Overall UI must stay consistent with the PDF processing tools (same panel idioms,
   same tokens).

## Out of scope (excluded with reasons)

- `base64-file-converter` — file-based; already migrated to `ToolFileUpload` in phase 06.
- `meta-tag-generator` — multi-field form generator, not an input→output text pair.
- `rsa-key-pair-generator` — no input textarea (key size is a number param; both
  textareas are independent outputs).
- `bip39-generator` — generate section is output-only; validate result is a status
  alert, not a text output.

Special handling inside scope:

- `encryption`, `text-to-binary`, `text-to-unicode` — two independent input→output
  sections each; rendered as **two stacked `ToolTextPanel` instances**.
- `jwt-parser` — one input, two outputs (header / payload): output column stacks both
  textareas; panel copy/export uses the payload JSON.
- `html-entities` — one input, two outputs (escaped / unescaped): output column stacks
  both; copy/export uses the escaped output.

## Concurrent-session note

Another session is running **phase 10** (`feature/phase-10-file-box-layout` in its own
worktree, `output-multiple` grid for multi-output *file* tools; its uncommitted edits to
`tool-file-import-controls.test.ts` were on master when this phase started). To avoid
entangling, phase 11 works in a dedicated worktree (`.worktrees/phase-11-text-tool-actions`)
on branch `feature/phase-11-text-tool-actions` cut from local `master` (`b44a61a`, which is
`origin/master` + 47 already-merged local phase commits). Phase 11 does **not** touch
`ToolFilePanel.vue`, `ToolFileUpload.vue`, or `tool-file-import-controls.test.ts`.

## Key decisions

- New shared component `apps/web/src/components/ToolTextPanel.vue` (sibling of
  `ToolFilePanel.vue`), same visual tokens: two `surface-soft`/hairline columns,
  per-column actions row, `#params` slot at the bottom.
- `v-model:input-text` writes the tool's input ref (component emits file text / clipboard
  text); `:output-text` feeds the built-in copy/export (disabled when empty).
- Paste = `navigator.clipboard.readText()` via new `readClipboardText()` in
  `apps/web/src/utils/clipboard.ts` (mirrors the write helpers' secure-context fallback
  reporting); failure surfaces `tool.pasteFailed` message instead of silently ignoring.
- Import = hidden native `<input type="file">` **inside the component** (components/ is
  not scanned by the import-controls guard test), read via `File.text()`; failure
  surfaces `tool.importFailed`.
- Export = Blob download named by per-tool `export-name` (extension matches the output
  format where obvious, else `.txt`).
- Existing textarea `id`s (`xxxField0/1`) are preserved (test tooling relies on them).
- Redundant per-tool copy buttons are removed (the panel owns copy now); action buttons
  (转换/生成/替换…) and selects move to the `#params` slot; error/warning alerts move
  there too ("其他声明区").
- Guard test `apps/web/src/tools/tool-text-panels.test.ts` pins the in-scope/out-of-scope
  split so future tools can't drift; the expected list grows batch by batch so every
  commit stays green.
