# Phase 17 Plan

Base: `feature/phase-14-image-editor-annotations` (phase 15 complete, rebased onto master 2026-10-07).

Spec: user screenshot + three rounds of clarification (2026-10-07).

## Tasks (each independently committable)

### T1 — SVG preview module + SizeField control

`params-previews.ts` (pure SVG render fns for stroke/arrow/number-format/eraser-mode/mosaic-effect) and `SizeField.vue` (square value button + hover NPopover with NSlider, wheel-adjustable).

### T2 — horizontal params strip + in-canvas text editing

Rewrite the params panel in `ImageEditor.vue` to the horizontal icon-toolbar layout (param-group icon radios, param-chip toggles, param-color, param-select with SVG render-label/render-tag, SizeField for numerics). Remove the text-content input row; add the inline textarea editor (click-to-create, Enter/blur commit, Esc cancel, double-click to re-edit).

### T3 — phase docs + STATE/ROADMAP

This directory, VERIFICATION.md, ACCEPTANCE.md check-off, STATE.md update.

## Risks

- naive-ui NSelect `render-label` / `render-tag` typing is generic-heavy; the `PreviewFn = (value: never) => VNodeChild` adapter keeps TS strict mode happy.
- Konva 9 only synthesises MouseEvent (not PointerEvent); the inline editor's blank-canvas click must go through the stage's existing click handler.
- The textarea blur commit and Esc cancel must not double-commit; the implementation commits on blur and treats Esc as an explicit cancel that suppresses the blur commit.
