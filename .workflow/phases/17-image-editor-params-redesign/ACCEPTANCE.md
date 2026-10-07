# Phase 17 Acceptance Criteria

Evidence for each check goes into `VERIFICATION.md`.

## Params strip layout

- [x] AC-1 The params panel renders as a single horizontal flex-wrap strip (`.image-editor__params-row`); no vertical `.image-editor__row` label/control rows remain.
- [x] AC-2 Every control in the strip is graphical: icon chips, icon toggle buttons, colour pickers, SVG-preview selects, or SizeField squares — no visible text labels (NTooltip hover labels only).

## Kind selection (shape / line)

- [x] AC-3 With 形状 active: kind is a two-icon radio (矩形/椭圆) shown side by side; the active kind is highlighted.
- [x] AC-4 With 线条 active: kind is a two-icon radio (直线/折线) shown side by side; the active kind is highlighted.

## SVG-preview dropdowns

- [x] AC-5 With 形状 active: the stroke-style select opens a dropdown whose 5 options are SVG line previews with no text.
- [x] AC-6 With 线条 active: the start/end arrow-style selects open dropdowns whose options are SVG arrow previews with no text.
- [x] AC-7 With 序号 active: the number-format select opens a dropdown whose options are SVG format previews with no text.
- [x] AC-8 The closed select shows the current value's SVG preview (render-tag), not a text name.

## SizeField

- [x] AC-9 Every numeric parameter (widths, sizes, radii, strengths) renders as a square button showing the current value.
- [x] AC-10 Hovering a SizeField expands a floating popover containing an NSlider.
- [x] AC-11 The SizeField slider supports mouse drag; scrolling the wheel over the SizeField nudges the value by its step.

## In-canvas text editing

- [x] AC-12 With 文字 active, the params panel has **no** text-content input.
- [x] AC-13 Clicking a blank canvas spot opens an inline textarea at the click point.
- [x] AC-14 Typing + Enter commits and creates a text annotation at that spot; the textarea disappears.
- [x] AC-15 In select mode, double-clicking an existing text annotation re-opens the inline textarea in place with the current content.

## Non-regression

- [x] AC-16 All 7 tools + select still function; undo/redo, export, and phase 13 file-box behaviour are unchanged.
- [x] AC-17 `pnpm --filter @toolnest/web test`, `type-check`, `build` pass; differential lint adds no new errors.
