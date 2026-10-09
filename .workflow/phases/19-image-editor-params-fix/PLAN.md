# Phase 19 Plan

Base: `feature/phase-14-image-editor-annotations` (phase 17 params redesign complete).

Spec: user review feedback 2026-10-07/08 (screenshot + eight findings, four clarified by direct questions).

## Tasks

### T1 — defect fixes

- `:deep(.param-color)` sizing so the two colour pickers stay 32 px (fill-block fix).
- SizeField hover-unit + 150 ms delayed close (slider fix).
- `.param-select` 72→96 px + SVG scales to container in a global style block (arrow/stroke clipping fix).

### T2 — presentation + interaction improvements

- `numberFormatPreview` shows three values.
- `commitTextEdit` selects the new text and switches to the select tool.
- `onAnnotationClick` selects from any tool mode.
- SizeField leading icons for every numeric parameter.

### T3 — verification + docs + commit

Browser-verify each fix, run test/type-check/build/lint, write this directory, update STATE/ROADMAP, one atomic commit.

## Notes

- Finding 6 (leader click-vs-drag) needed no change — verified the existing behaviour already matches the request.
