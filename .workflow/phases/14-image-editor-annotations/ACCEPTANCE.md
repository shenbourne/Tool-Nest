# Phase 14 Acceptance Criteria

Evidence for each check goes into `VERIFICATION.md`.

## Parameter visibility (only the active tool's parameters)

- [x] AC-1 With `添加文本` active: the panel shows colour, font size and the text field, and **no** line-width row.
- [x] AC-2 With `绘制线条` active: the panel shows colour and line width, and **no** font-size or text row.
- [x] AC-3 In `选择` with nothing selected: the parameter area contains no parameter rows.
- [x] AC-4 In `选择` with a text annotation selected: colour, font size, text and a delete action are shown.
- [x] AC-5 In `选择` with a line annotation selected: colour, line width and a delete action are shown.

## Row layout

- [x] AC-6 Every parameter row renders its label to the left of its control and vertically centred with it: for each row the label's and control's vertical midpoints differ by less than 2 px, and the label's left edge is left of the control's. No label sits above its control.

## Selection and editing

- [x] AC-7 Clicking an existing text or line while `选择` is active selects it and draws a dashed outline around it; clicking empty stage space clears the selection; clicking an existing annotation while `添加文本`/`绘制线条` is active does not select it and does not create a new annotation.
- [x] AC-8 Changing a selected annotation's colour, font size or line width, or a selected text's content, updates the canvas immediately and changes the exported PNG accordingly.
- [x] AC-9 Dragging a text or a line moves it (for a line both endpoints shift by the same delta), and the export matches the new position.
- [x] AC-10 A selected line shows two endpoint handles; dragging one moves only that endpoint and the export matches.
- [x] AC-11 The delete action (panel button and `Delete`/`Backspace`) removes only the selected annotation; both are inert when nothing is selected or when the key event comes from an input.

## Undo / redo

- [x] AC-12 Undo/redo buttons are disabled exactly when there is no undo/redo available; `Ctrl+Z` undoes, `Ctrl+Shift+Z` and `Ctrl+Y` redo; none of them intercept a key pressed inside a text field.
- [x] AC-13 Undo/redo step through add, move, property edit, endpoint change, delete and clear-all; a new action after an undo discards the redo tail.

## Non-regression

- [x] AC-14 Phase 13 behaviour still holds: one full-width file box holding only the canvas, centred on both axes, clickable empty-state import area, action bar unchanged, copy/export produce the edited PNG, `accept="image/*"` still enforced, and the Konva load guard still passes.
- [x] AC-15 `pnpm --filter @toolnest/web test`, `type-check` and `build` pass; differential lint adds no new errors.
