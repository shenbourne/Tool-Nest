# Phase 19: Image Editor Params Panel Fixes from User Review

## Context

User review of the phase 17 params-panel redesign (2026-10-07/08), with a screenshot of the shape-tool strip. Eight findings, four of which were real defects reproduced in a browser; the other four were interaction / presentation improvements. All were clarified with the user before implementing (the ambiguous ones via direct questions).

## Findings and resolutions

1. **Fill params block rendered broken** (defect). With fill enabled, the two `NColorPicker` blocks blew up to 850 px and 6 px instead of two 32 px squares. Root cause: `NColorPicker` sits inside `NTooltip`'s `#trigger` slot, so the scoped `data-v` attribute never reaches its root element and `.param-color { width:32px }` never matched (naive-ui's own `.n-color-picker { width:100% }` won). Fixed with `:deep(.param-color)` selectors.
2. **SizeField slider vanished / could not be dragged** (defect). The trigger button's `@mouseleave="show=false"` fired the moment the pointer moved down toward the popover, closing it before the slider could be used. Fixed by treating the button + popover as one hover unit with a 150 ms delayed close (`scheduleClose`/`cancelClose`).
3. **Start/end arrow SVG previews "not rendered"** (defect). The arrowheads were generated but invisible: the closed select's `.n-base-selection-input__content` is 34 px wide with `overflow:hidden`, clipping the 64 px-wide SVG exactly where the arrowhead sits. Fixed two ways: widened `.param-select` 72 px → 96 px, and made the SVG scale to its container (removed fixed `width`/`height` attributes, added `width:100%; aspect-ratio:64/20` in a **global** style block — NSelect teleports options/tag to `<body>`, outside scoped reach).
4. **Stroke-style sample too short to read** (improvement). Same widening as #3 (96 px) lets the dash pattern show fully.
5. **Number-format sample unclear** (improvement). Was a single glyph (`formatNumber(1, …)`); now shows the first three values (`1, 2, 3` / `a, b, c` / `i, ii, iii`).
6. **Sequence-number leader interaction** (verified already correct). User asked for "click = badge only, drag = badge + leader". The existing `placeNumber` + `leaderDraft` logic already does exactly this (a leader shorter than 8 px is discarded on mouseup). Confirmed in-browser: plain click → `leaderLine: null`; press-drag-release → `leaderLine` attached. No code change.
7. **Text not selected after creation** (improvement). `commitTextEdit` created the annotation but left nothing selected. Now it sets `selectedId` and switches to the select tool so the text can be dragged/rotated immediately.
8. **Select annotations from any tool** (improvement). `onAnnotationClick` previously only selected in select mode. Now any tool mode clicking an existing annotation selects it and hops to the select tool.

Also from the same review: every `SizeField` gained a small leading icon (line width = `Minus`, corner radius = `RadiusBottomLeft`, font/number size = `Typography`, arrow sizes = `ArrowLeft`/`ArrowRight`, stroke width = `BorderStyle`, background opacity = `Highlight`, brush sizes = `Brush`, mosaic strength = `GridDots`).

## Boundary

- In scope: `apps/web/src/tools/image-editor/` (`ImageEditor.vue`, `SizeField.vue`, `params-previews.ts`), phase records.
- Out of scope: `image-editor.service.ts` pure logic (unchanged), merging to master (requires explicit user authorization).
