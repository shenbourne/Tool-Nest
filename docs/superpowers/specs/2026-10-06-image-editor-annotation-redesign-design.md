# Image Editor Annotation Redesign — Design Spec

Date: 2026-10-06. Status: user-approved. Phase: 15 (follow-up to phases 13/14, same `/image-editor` page).

## Goal

Completely rebuild the `/image-editor` annotation feature, modelled on PixPin
(https://pixpin.cn/docs/mark/base-use). Seven annotation tools plus a select tool,
each with per-tool parameters, icon toolbar, live mosaic/blur rendering, and full
undo/redo.

## Tools (7 + select)

The toolbar shows **icon buttons** (`@vicons/tabler`), not text; each wraps in an
`NTooltip` showing the tool name on hover. Active tool highlighted.

1. **矩形/椭圆** — one tool, panel switches rect/ellipse.
   Params: border colour, width (1–20), stroke style, fill on/off + colour, corner
   radius (rect only, 0–100).
2. **直线/折线** — one tool, panel switches straight/polyline. Arrows are a
   *parameter*, not a subtype.
   Params: line colour, width (1–20), stroke style, start arrow (none/triangle/open/
   circle + size), end arrow (same + size).
   Straight: press-drag. Polyline: repeated clicks add vertices, double-click/Enter
   finishes, Esc discards the in-progress polyline; each vertex draggable when
   selected.
3. **序列号** — auto-incrementing number badge + optional leader line with arrow.
   Params: number format (number / lower-alpha / upper-alpha / lower-roman /
   upper-roman), colour, size (16–72), font family, leader line on/off + width +
   stroke style. Letters pass 26 via Excel-style carry (aa, ab…). Deleting a number
   does not renumber; only clear-all or a format change resets the counter.
4. **涂鸦笔** — freehand path.
   Params: colour, width (1–30), stroke style.
5. **文字** — with rotation, stroke, background.
   Params: content, colour, size (8–120), font family, stroke (on/off + colour +
   width), background (on/off + colour + opacity). Rotation via a canvas rotation
   handle, not the panel.
6. **橡皮擦** — deletes hit annotations (an erase is a history step, not an
   annotation). Rectangular marquee / brush-track modes, wheel adjusts brush size,
   clear-all button (with confirm).
7. **马赛克** — rectangular marquee / brush-track modes (wheel adjusts brush size).
   Params: effect (mosaic = block size 2–40 / gaussian blur = radius 1–20),
   strength. **Renders the processed region live over the original** (from an
   offscreen canvas cache) without modifying the original; export renders the same.

## Stroke style

Five styles — solid, long-dash, short-dash, dash-dot, dash-dot-dot — mapped to Konva
`dash` arrays that **scale with stroke width** (user decision), keeping the pattern
proportional at any width.

## Data model

Discriminated union `Annotation` in `image-editor.service.ts`:

- `ShapeAnnotation { kind: 'rect'|'ellipse', bbox, stroke, strokeWidth, strokeStyle,
  fillEnabled, fill, cornerRadius }`
- `LineAnnotation { kind: 'straight'|'polyline', points[], stroke, strokeWidth,
  strokeStyle, startArrow, endArrow }` — arrows as `{ style, size } | null`.
- `NumberAnnotation { x, y, value, format, color, size, fontFamily, leaderLine }`.
- `PenAnnotation { points[], stroke, strokeWidth, strokeStyle }`.
- `TextAnnotation { x, y, text, fontSize, color, fontFamily, rotation, stroke,
  background }`.
- `MosaicAnnotation { region: rect|path+brushSize, effect, strength }` — plus a
  runtime-only offscreen-canvas cache (not serialised, rebuilt on image change).

Coordinates are normalised (0–1 relative to stage) so export scales to the source
resolution. The eraser produces **deletions**, not annotations — erased items enter
the history snapshot so undo restores them.

## Component split

- `image-editor.service.ts` — pure logic: types, stroke-style mapping, arrow
  geometry, number formatting, hit-testing geometry, mosaic/blur pixel processing,
  undo history (snapshot mechanism from phase 14), per-tool param-row descriptors.
- `ImageEditor.vue` — orchestration: icon toolbar, dynamic params panel, Konva stage
  (image + `v-rect`/`v-ellipse`/`v-line`/`v-arrow`/`v-text`/mosaic-cache `v-image`),
  selection Transformer + vertex/endpoint handles + text rotation handle, the
  interaction state machine (tool / drawing / dragging / brush preview), and
  `createCanvas()` export.

Params panel rows keep the phase-14 layout: label left, control right, vertically
centred. Controls: `NColorPicker`, `NInputNumber`, `NSelect`, `NSwitch`, `NInput`.
Panel footer always shows undo/redo, delete-selected (when selected), clear-all.

## Interaction

- Select: click to select (dashed Transformer outline), drag to move, panel edits
  properties, Delete removes.
- Drawing tools swallow clicks on existing annotations (`cancelBubble`) so they do
  not also select/duplicate.
- Esc cancels an in-progress polyline / returns to select.
- Global: `Ctrl+Z` undo, `Ctrl+Shift+Z` / `Ctrl+Y` redo, `Delete` remove selected,
  wheel adjusts brush size in eraser/mosaic brush mode.
- Undo/redo covers every annotation add/delete/move/property/clear; each eraser
  application is one step. Keys pressed inside a text field are left to the browser.

## Testing & delivery

`image-editor.service.test.ts` covers the pure functions (stroke mapping, number
format, hit geometry, mosaic pixelation, history). `.vue` interaction is verified in
a real browser (Konva 9 needs synthetic `MouseEvent`; hidden tabs suspend rAF).
Delivered in per-tool batches, each an atomic commit; gates are `test` / `type-check`
/ `build` plus per-file differential lint (repo lint baseline is pre-existing red).
