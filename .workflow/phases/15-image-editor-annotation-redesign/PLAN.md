# Phase 15 Plan

Base: `feature/phase-14-image-editor-annotations` stacked on phase 13 `02c0a2f`.

Spec: `docs/superpowers/specs/2026-10-06-image-editor-annotation-redesign-design.md`
Plan: `docs/superpowers/plans/2026-10-06-image-editor-annotation-redesign.md`

## Tasks (each independently committable)

### T1 — service rewrite (`image-editor.service.ts`, `image-editor.service.test.ts`)

Rewrite the pure module with 7 annotation types, strokeDash, formatNumber (Excel-style alpha carry), arrowPoints, distToSegment, rectFromPoints, applyMosaic + pure mosaicImageData/boxBlurImageData, and the snapshot history. 20+ unit tests.

### T2 — component shell (`ImageEditor.vue`)

Icon toolbar (8 NTooltip-wrapped buttons), params footer with row layout, history wiring, select/move/delete, createCanvas skeleton. Locale keys added.

### T3 — shape + line tools

Rect/ellipse with fill/cornerRadius; straight/polyline with start/end arrows (style + size); endpoint/vertex drag.

### T4 — pen + text tools

Pen: tension spline, dash styles. Text: stroke/background/rotation handle.

### T5 — sequence number tool

Auto-increment counter, 5 formats, optional leader line with arrow.

### T6 — eraser tool

Rect/brush modes, wheel brush size, brush preview, clear-all with NPopconfirm.

### T7 — mosaic tool + final gates

Rect/brush mosaic/blur with live offscreen cache rendering; export integration; final test/type-check/build gates.

### T8 — phase docs + STATE/ROADMAP

This directory, VERIFICATION.md, and STATE.md update.

## Risks

- Mosaic live rendering requires offscreen canvas cache invalidation on multiple triggers; missed invalidation yields stale pixels.
- Konva 9 synthetic event dispatch in browser tests requires MouseEvent (not PointerEvent).
- Hidden tabs suspend rAF; patch to synchronous before reading pixels.
- Locale files are CRLF; edits must preserve line endings.
