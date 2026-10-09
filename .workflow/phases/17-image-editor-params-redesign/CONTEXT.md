# Phase 17: Image Editor Params Panel Redesign

## Context

User report 2026-10-07: the image-editor params panel (built in phase 15) laid every parameter out as a vertical "label left, control right" row. The user supplied a screenshot and asked for a complete redesign: all parameters laid out **horizontally** as a compact icon-toolbar strip, with graphical (SVG/canvas) representations instead of text labels wherever possible.

## Decisions (clarified with the user, 2026-10-07)

1. **Pure icon toolbar**: the params strip uses icon buttons with NTooltip hover labels — no visible text labels. (Follows the standing rule: 多工具并列的工具条用图标按钮 + hover tooltip.)
2. **Shape kind / line kind**: two icon chips side by side acting as a radio (矩形/椭圆; 直线/折线) — not a dropdown.
3. **Stroke style / arrow style / number format / eraser mode / mosaic effect**: keep the dropdown expansion, but every dropdown **option** is an SVG preview, not a name. The closed select shows the current value's SVG preview too (render-tag).
4. **Size / width numeric inputs**: shrink to a **square button** showing the current value; hovering it expands a floating popover with an NSlider that supports both mouse drag and scroll-wheel adjustment.
5. **Text content input**: removed from the params panel entirely. With the text tool active, clicking a blank canvas spot opens an **inline textarea at the click point**; Enter or blur commits, Esc cancels. Double-clicking an existing text annotation re-opens the inline editor in place with the current content.
6. **All other params** (colour, fill, stroke toggle, background toggle, leader toggle, corner radius) also switch to the horizontal + graphical layout.

## Implementation decisions taken without asking

- **New pure module** `params-previews.ts`: SVG preview render functions (via `h()`) for stroke style (dash arrays mirror `strokeDash` at width 2), arrow style (line + triangle/open/circle head), number format (`formatNumber(1, format)`), eraser mode, mosaic effect. A shared `svg()` helper normalises viewBox `0 0 64 20`.
- **New control** `SizeField.vue`: 32px square button + NPopover (manual trigger) containing a 140px NSlider; `@wheel` on the button nudges the value by `step`; value clamped to min/max; emits `update:value`.
- **Preview render plumbing**: `previewRenderLabel(preview)` / `previewRenderTag(preview)` factories adapt a `(value) => VNodeChild` preview fn to naive-ui's `render-label` / `render-tag` slots; typed as `PreviewFn = (value: never) => VNodeChild` to satisfy naive-ui generics.
- **Inline text editing**: `textEdit` ref holds `{ x, y, text, annotationId }`; the textarea is a sibling of the stage inside a `position:relative` wrapper, absolutely positioned at the click point (`translate(-50%,-50%)`). Commit creates a new annotation (via `textDefaults`) or replaces the existing one; both paths push history. Only the text tool's blank-canvas click opens the editor; select-mode double-click re-opens it.
- **Params strip markup**: `.image-editor__params-row` (flex-wrap horizontal) replaces the old `.image-editor__rows`; per-tool `<template v-if="activeTool===...">` blocks emit `.param-group` (icon radio), `.param-chip` toggle buttons, `.param-color` (32px NColorPicker), `.param-select` (72px, `--text` 110px), and SizeField instances.
- **Removed**: `NInput` / `NInputNumber` / `NSwitch` imports and the text-content input row; `shapeKindPreview` / `lineKindPreview` SVG previews (type selection uses NIcon chips instead, so the preview fns were unused).

## Boundary

- In scope: `apps/web/src/tools/image-editor/` (ImageEditor.vue, SizeField.vue, params-previews.ts), phase records.
- Out of scope: `image-editor.service.ts` pure logic (unchanged), other tools, merging to master (requires explicit user authorization).
