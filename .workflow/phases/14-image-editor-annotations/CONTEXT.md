# Phase 14: Image Editor Annotation Editing & History

## Context

Follow-up to phase 13 (same tool, same page). User report 2026-10-02 with a screenshot of `/image-editor`'s parameter block:

1. `添加文本` and `绘制线条` must show **only their own** parameters — the panel currently shows colour, line width and font size together regardless of the active tool.
2. The parameter rows must share **one** form: description on the left, the control on the right. Today only `颜色` does that; `线宽` and `字号` put their label above the control (a narrow-flex wrap artefact).
3. An already-added text or line must support **click to keep editing**.
4. **Undo and redo** are required.

## Decisions (clarified with the user, 2026-10-02)

1. **Select mode shows the selected annotation's parameters.** `选择` is the editing mode: clicking an existing annotation selects it and the panel switches to that annotation's parameters (`文字`: content / font size / colour; `线条`: colour / line width) plus a delete action. With nothing selected the parameter area is empty.
2. **Click-to-edit covers four behaviours**: select and change properties, drag to move (text and line), drag a line's endpoints, and delete the selected annotation.
3. **Undo/redo has both entry points**: buttons in the parameter block (disabled when unavailable) and `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y`. Keys typed inside an input are left alone so the browser's own input undo still works.
4. Derived from (1) and the "only its own parameters" rule, with the user's agreement that the panel is the single editing surface: **the text annotation's content is edited in the panel** (`文本`), replacing the old input that appeared below the canvas on double-click.

## Implementation decisions taken without asking

- **Parameter rows are stacked, one per row** (`display: flex; align-items: center`, label left, control immediately right, label `white-space: nowrap`). The user's screenshot shows the failure mode of the inline layout — at a narrow width the three label+control pairs wrap and the labels end up above their controls. One row per parameter cannot regress that way. If the user prefers the compact single-line variant, only `ImageEditor.vue`'s parameter block changes.
- **Selection is only possible while `选择` is active.** With `添加文本` or `绘制线条` active a click on an existing annotation is swallowed (`cancelBubble`) so it does not also create a new annotation.
- **Selection outline** is a Konva `Transformer` with every handle disabled (`resizeEnabled: false`, `rotateEnabled: false`, `enabledAnchors: []`), which draws a dashed box around text and lines alike and follows node changes without manual measurement. A selected line additionally renders two draggable endpoint circles.
- **History is a snapshot list** of the annotation array with a cursor (`states` / `cursor`): undo/redo swap the whole array. Structural changes (add, delete, clear all, drag end, endpoint drag end) commit immediately; property edits mutate live and commit through a 400 ms coalescing timer, so typing a word is one undo step. The history is capped at 100 states.
- **Undo covers annotation changes only** (add / move / property edit / endpoint / delete / clear all). Changing the picked image is not undoable.

## Boundary

- In scope: `apps/web/src/tools/image-editor/` (component + a new pure service module + its test), the phase records, and locale keys if new labels are needed.
- Out of scope: `image-crop` and `image-remove-background`; the file-box/single-column layout from phase 13 (unchanged); clearing annotations when a new image is picked (pre-existing behaviour, not part of this report).
