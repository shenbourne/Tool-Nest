# ADR-0001: File import accepts a pasted file via the `paste` event

- Status: Accepted
- Date: 2026-09-30
- Context: The shared `ToolFileUpload` control (phase 01) offers click and drag only. Users expect to paste a file or a screenshot with Ctrl+V. Two implementations exist or were considered:
  1. A visible paste button per tool calling `navigator.clipboard.read()` — what the unmerged local branch `tool-file-io-enhancement` does across ~47 tools.
  2. A `document`-level `paste` listener inside the shared component reading `event.clipboardData`.
  Constraints: no clipboard permission prompt, no new dependency, one implementation shared by 19 tools, bilingual UI. Chrome/Edge/Firefox deliver a copied file (and a copied screenshot) through `ClipboardEvent.clipboardData` without permission; `navigator.clipboard.read()` requires a permission grant and a user gesture on a button, and exposes images only.
- Options:
  1. Per-tool paste button + `navigator.clipboard.read()`: needs a permission prompt, duplicates UI into every tool, and only handles images — cannot paste a `.pdf`.
  2. `paste` listener in `ToolFileUpload` reading `clipboardData`: no prompt, no visible chrome, handles any file type the drop path accepts, and lands in one file already shared by all 19 tools.
  3. Re-dispatch a synthetic `drop` event on `NUploadDragger` and let naive-ui mutate the list: reaches parity for free, but depends on naive-ui's undocumented internal drop wiring (`draggerInsideRef` gating), the same class of internals coupling phase 01 was forced to document.
- Decision: Option 2. The component owns a `document`-level listener while mounted, ignores clipboards that carry no files, filters candidates through a pure accept matcher that mirrors naive-ui's drag-and-drop semantics, appends (`multiple`) or replaces (single), and reports a rejected paste instead of failing silently. `UploadFileInfo` entries are built locally from naive-ui's **public** type rather than by synthesizing events into its internals.
- Consequences: The listener is global while a tool page with the control is mounted, so it also fires for pastes aimed at that tool's text inputs — mitigated by ignoring file-less clipboards. Pages that ever mount two controls would import into both; none does today (19 tools, one control each). The accept matcher duplicates naive-ui's `matchType` semantics on purpose, with tests, because the alternative is a deep import into `naive-ui/es/upload/src/utils.mjs`. The bare `<input type="file">` controls in ~28 tools remain unaffected and are out of scope.
- Supersedes: the paste half of the local `tool-file-io-enhancement` branch, if that branch is ever revived.
