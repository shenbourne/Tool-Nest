# Phase 14 Verification

All evidence gathered 2026-10-06 in the `phase-14-image-editor-annotations` worktree
(branch `feature/phase-14-image-editor-annotations`, stacked on phase 13's `02c0a2f`).

Browser verification ran against `http://localhost:3041/image-editor` (dev server
`pnpm exec vite --port 3041 --strictPort --config apps/web/vite.config.ts apps/web`).
The tab was hidden (`document.hidden === true`), so `window.requestAnimationFrame` was
patched to run callbacks synchronously before reading Konva pixels (see the
chrome-hidden-tab memory). Synthetic Konva interactions dispatch `MouseEvent`
(`mousedown`/`mousemove`/`mouseup`/`click`) on the stage's `<canvas>`; Konva 9 does not
respond to synthetic `PointerEvent` here. Vue panel reads are taken in a separate
`evaluate_script` call after a `setTimeout`, because same-tick DOM reads under-report
Vue/Konva updates.

## Automated gates

- `pnpm --filter @toolnest/web test` — **pass**. 34 files, 235 tests, incl. the 13 new
  `src/tools/image-editor/image-editor.service.test.ts` cases (params matrix, history
  walk / commit-truncates-redo / no-shared-references / cap, `moveLine` /
  `moveLineEndpoint` immutability).
- `pnpm --filter @toolnest/web type-check` — **pass** (`vue-tsc --noEmit`, no output).
- `pnpm --filter @toolnest/web build` — **pass** (`✓ built in 40.63s`).
- Differential eslint:
  - `image-editor.service.ts` + `.test.ts` — 0 problems.
  - `ImageEditor.vue` — 0 problems (exit 0); the HEAD version had 3
    `@typescript-eslint/no-explicit-any` errors, so the rewrite strictly improves the
    file's lint posture (the new `KonvaNode` / `KonvaPointerEvent` interfaces replaced
    the `any` event params).
  - `locales/zh.json` / `en.json` — both parse as valid JSON.

## Browser evidence per acceptance criterion

Fixture: 240×160 PNG (blue background `#3060a0`, white rect, red rect) injected through
the hidden file input via `DataTransfer`. Stage sized 240×160.

- **AC-1 / AC-6** — `添加文本` active: rows are `颜色：`/`字号：`/`文本：` only (no
  `线宽`). Each row `labelLeft 281 < controlLeft 328`, `verticalDelta 0` (< 2 px),
  label left of control, none above.
- **AC-2** — drew a line (points `[48, 31.5, 192, 95.5]`); `绘制线条` active shows
  `颜色：`/`线宽：` only (no `字号`/`文本`).
- **AC-3** — `选择` with nothing selected: no `.image-editor__row` elements.
- **AC-4** — clicked the text in `选择`: a `Transformer` attaches (`nodeCount 1`,
  dashed outline) and rows become `颜色：`/`字号：`/`文本：` + a `删除选中` button.
- **AC-5** — clicked the line in `选择`: rows become `颜色：`/`线宽：` + `删除选中`,
  and two endpoint `Circle` handles render.
- **AC-7** — clicking empty stage in `选择` clears the selection (rows empty, no
  Transformer). Clicking an existing annotation with `添加文本`/`绘制线条` active does
  not select it and does not create a duplicate: this was the `cancelBubble` bug
  (`e.target.cancelBubble` on the node instead of `e.cancelBubble` on the Konva event);
  after the fix the hit pixel at the annotation resolves to the shape and select-mode
  clicks select, tool-mode clicks neither select nor duplicate.
- **AC-8** — edited the selected text's content (`文本` → `Hello`) and font size
  (24 → 40): the Konva `Text` node reflects both (`text "Hello"`, `fontSize 40`).
  Edited the selected line's width (3 → 8): the Konva `Line` node `strokeWidth 8`.
  Export canvas (replicating `createCanvas` at natural 240×160) sampled: text glyph at
  (140,155) = RGB(255,0,0), line body at (157,96) = RGB(160,48,48) (red over blue),
  background (10,10) = RGB(48,96,160) — image + both annotations export with correct
  colour and position.
- **AC-9** — dragged the line body by (+20,+20): both endpoints shifted equally
  (`(70,39.5)→(90,59.5)`, `(204,113.5)→(224,133.5)`) and the node translation reset to
  `(0,0)`. Dragged the text by (+15,+10): `(120,119.5)→(135,129.5)`.
- **AC-10** — selected the line shows two endpoint circles. Dragged the first endpoint
  from (60,49.5) to (70,40): `dragTarget "Circle"`, only that endpoint moved
  (`(60,49.5)→(70,39.5)`), the other stayed at (204,113.5), line node stayed `(0,0)`.
- **AC-11** — `删除选中` removed the selected text (only the Line remained, selection
  cleared). With the line selected, `Delete` removed it (no annotations remained).
- **AC-12** — after edits the `撤销` button enabled / `重做` disabled at the tip.
  `撤销` restored a deleted annotation (and `重做` re-deleted it). `Ctrl+Z` undid,
  `Ctrl+Shift+Z` redid, `Ctrl+Y` redid — each verified by reading the Konva node list
  before/after a single `document`-targeted keydown. With focus inside the `文本` input
  (`document.activeElement === input`), `Ctrl+Z` left the annotations unchanged — the
  input-focus guard holds and the browser's own input undo is preserved.
- **AC-13** — undo/redo stepped correctly through add, move, property edit, endpoint
  change and delete (each transition observed on the Konva node list). Commit-truncates-
  redo and the 400 ms property coalescing are covered by the service unit tests.
- **AC-14** — phase 13 non-regression: the Konva `Image` node has a loaded `image()`
  (the hidden DOM `<img>` loader is present), the stage is centred and 240×160, the file
  box is the single full-width column, and the `konva-image-load` guard test still
  passes. `accept="image/*"` is still on the file input.
- **AC-15** — see Automated gates above.

## Notes / limitations

- Synthetic keyboard events were dispatched to `document` only (the component's
  listener target); dispatching to both `document` and `window` double-fires the handler
  and was the source of one transient mis-read during testing, not a product bug.
- Endpoint grabbing: the line's `hitStrokeWidth: 12` overlaps the radius-6 endpoint
  circles, but the circles render above the line and win the hit test at their centre
  (verified via the hit-canvas pixel colour), so endpoint drags are reachable.
- No merge to `master` and no push were performed (not authorised); the branch stays
  local at `feature/phase-14-image-editor-annotations`.
