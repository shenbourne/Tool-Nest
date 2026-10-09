# Phase 15: Image Editor Annotation Complete Redesign

## Context

User report 2026-10-06: completely rebuild `/image-editor`'s annotation functionality, modeled on PixPin (https://pixpin.cn/docs/mark/base-use). The phase 14 implementation (text + line only) is superseded. Seven tools with full parameter panels, icon toolbar, live mosaic/blur rendering, and snapshot-based undo/redo.

## Decisions (clarified with the user, 2026-10-06)

1. **Seven tools**: 矩形/椭圆 (one tool, panel toggle), 直线/折线 (one tool, panel toggle; arrows are parameters not a subtype), 序列号, 涂鸦笔, 文字, 橡皮擦, 马赛克. Plus 选择 for editing.
2. **Line styles** (5 types): 实线、长虚线、短虚线、点划线、两点划线. Dash values **scale with stroke width** (not fixed).
3. **Arrows** are line parameters: start/end independent toggles + style (无/三角/开放/圆形) + size.
4. **Sequence number**: auto-increment counter (1, 2, 3...); formats: number / lower-alpha / upper-alpha / lower-roman / upper-roman; letters wrap Excel-style (aa, ab...); deletion does not renumber; clear-all or format change resets. Optional leader line with arrow.
5. **Text**: stroke (on/off + color + width), background (on/off + color + opacity), rotation handle (select mode only).
6. **Mosaic/blur**: **live rendering** — the editor shows the actual pixelated/blurred result overlaid on the original (not a placeholder box); export renders the same. Effects: mosaic (block size) / gaussian blur (radius), strength adjustable.
7. **Eraser**: rect marquee / brush track modes; wheel adjusts brush size; one history step per application; clear-all button.
8. **Toolbar**: 7 tools + select, **icon buttons** (@vicons/tabler) with NTooltip hover labels.
9. **Parameter panel**: unified "label left, control right, vertically centred" row layout (phase 14 style).
10. **Undo/redo**: covers all annotation add/delete/edit/move/property/clear; buttons + Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y.

## Implementation decisions taken without asking

- **Component split**: `image-editor.service.ts` (pure logic: types, strokeDash, formatNumber, arrowPoints, distToSegment, rectFromPoints, applyMosaic + pure mosaicImageData/boxBlurImageData, history) + `ImageEditor.vue` (orchestration). Coordinates normalized (0-1 relative to stage) for export scaling.
- **Mosaic cache**: offscreen source canvas rebuilt on image/stage change; per-annotation cache canvases from `applyMosaic`; invalidated on region/effect/strength change or drag-move.
- **History**: snapshot list with cursor; structural changes commit immediately; property edits coalesce via 400ms timer; cap 100 states.
- **Selection**: only in select mode; Transformer outline + endpoint/vertex handles for lines; rotation handle for text.
- **SDD execution**: superpowers subagent-driven-development; 8 tasks, each one atomic commit.

## Boundary

- In scope: `apps/web/src/tools/image-editor/` (service + component + test), locale keys, phase records.
- Out of scope: `image-crop`, `image-remove-background`; merging to master (requires explicit user authorization).
