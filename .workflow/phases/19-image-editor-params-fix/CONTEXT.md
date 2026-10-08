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

## Follow-up findings from the same review (second pass)

9. **Colour swatch text overflowed** (defect). The phase-19 fix set `.param-color { width:32px }` but no height and did not hide the picker's hex label; the root kept naive-ui's default `--n-height:42px` and the `.n-color-picker__value` label (`#ff0000`) spilled out of the 32 px block. Fixed: `.param-color` is a fixed 32×32 square (`--n-height` overridden) with `.n-color-picker__value { display:none }`, so the block is a pure colour swatch like the phase-17 stroke block.
10. **Start-arrow preview pointed the wrong way** (defect). `arrowStylePreview` always drew a right-pointing arrowhead, so the start-arrow select showed a right arrow. Fixed by adding a `direction` parameter (`'end'` default, `'start'` mirrors the art with `translate(64,0) scale(-1,1)`), and splitting the shared `arrowRender` into `startArrowRender` / `endArrowRender`.
11. **Line-weight icon was a plain minus sign** (improvement). The four line-weight SizeFields (shape stroke, line stroke, pen stroke, leader stroke) used the `Minus` icon from @vicons/tabler, which is a single horizontal line. Replaced with a custom `lineWeightIcon` component that renders three stacked horizontal lines of increasing thickness (stroke-width 1.5 / 3 / 4.5), matching the conventional line-weight symbol found in drawing applications.

## Follow-up findings from the same review (third pass — colour picker appearance)

12. **Colour picker fill rendered offset** (defect). The NColorPicker's internal `.n-color-picker__fill` element was not constrained by the parent 32×32 container, causing the colour swatch to appear shifted to the bottom-right. Fixed by adding `position: relative; overflow: hidden` to `.param-color` and absolutely positioning the fill element (`top: 0; left: 0; width: 100%; height: 100%`).
13. **Colour picker needs colourful border to indicate clickability** (improvement). The plain 32×32 swatch did not visually suggest it was a colour picker. Added a 3 px gradient border using the CSS `background: linear-gradient(white, white) padding-box, linear-gradient(135deg, …) border-box` technique with a 2 px white inset `box-shadow` to separate the fill from the border. Initial colours were too dark (`#e03131, #1971c2, #2f9e44, #f08c00, #343a40`); replaced with brighter variants (`#ff6b6b, #4dabf7, #51cf66, #ffd43b, #cc5de8`) for better visibility.

## Follow-up findings from the same review (fourth pass — leader line params)

14. **Leader line params should be permanent** (improvement). The leader line toggle button (Vector icon chip) and conditional `v-if` made the width/style controls disappear when leader was disabled. User requested the params always be visible with a text label. Removed the toggle button and `v-if`, replaced with a `| 引导线：` text label (`<span class="param-label">`) followed by the SizeField and stroke-style select. Leader line is now always enabled by default (`enabled: true` in `numberLeaderOf`), and `leaderDraft` always initializes on number creation (removed the `if (d.leaderEnabled)` guard). Removed `leaderEnabled` from `numberDefaults` since it is no longer toggled.

## Boundary

- In scope: `apps/web/src/tools/image-editor/` (`ImageEditor.vue`, `SizeField.vue`, `params-previews.ts`), phase records.
- Out of scope: `image-editor.service.ts` pure logic (unchanged), merging to master (requires explicit user authorization).
