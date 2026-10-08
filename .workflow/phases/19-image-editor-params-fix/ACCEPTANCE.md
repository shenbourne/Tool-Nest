# Phase 19 Acceptance Criteria

Evidence for each check goes into `VERIFICATION.md`.

## Defect fixes

- [x] AC-1 With shape fill enabled, both colour pickers render as 32 px squares side by side (no 850 px / 6 px blow-up).
- [x] AC-2 Hovering a SizeField opens the slider; moving the pointer from the box into the slider does not close it; the slider adjusts by drag and by wheel.
- [x] AC-3 The closed start/end-arrow select shows the full SVG sample including the arrowhead (not clipped at 34 px).
- [x] AC-4 The stroke-style select is wide enough to read the dash pattern (96 px).

## Presentation + interaction

- [x] AC-5 The number-format dropdown options read as sequences: `1, 2, 3` / `a, b, c` / `A, B, C` / `i, ii, iii` / `I, II, III`.
- [x] AC-6 Sequence-number leader: a plain click places a badge with no leader; press-drag-release attaches the leader.
- [x] AC-7 Creating a text annotation selects it and switches to the select tool.
- [x] AC-8 Clicking an existing annotation from any tool mode selects it and switches to the select tool.
- [x] AC-9 Every SizeField shows a small leading icon hinting its parameter.

## Follow-up fixes (second review pass)

- [x] AC-11 Both colour blocks (stroke + fill) render as pure 32×32 swatches with the hex label hidden.
- [x] AC-12 The start-arrow select shows a left-pointing arrow (in the closed tag and every dropdown option); the end-arrow select stays right-pointing.
- [x] AC-13 The line-weight SizeField icon shows three stacked horizontal lines of increasing thickness (thin → medium → thick), replacing the previous Minus icon.
- [x] AC-14 Both colour pickers (stroke + fill) render as 32×32 swatches with a bright gradient border (red → blue → green → yellow → purple) and a white inset gap separating the fill from the border.

## Non-regression

- [x] AC-10 `pnpm --filter @toolnest/web test`, `type-check`, `build` pass; changed-file lint clean.
