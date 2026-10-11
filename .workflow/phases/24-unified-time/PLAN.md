# Plan

1. Replace nine registered cards with one tool and legacy redirects.
2. Use one duration converter for the five duration tools; embed existing weekday, interval, Discord and truncation panels in tabs with one outer header.
3. Test duration boundaries, review registry/layout boundaries, run web tests, typecheck, scoped lint and build.
4. Record acceptance, commit and publish feature branch without merging.

## UI follow-up
Use a shared compact form/result panel: inputs first, labelled result rows with per-row/all copy, responsive grids. Reuse calculations, replace generic file/text controls for calendar and clock forms. Update Chinese/English labels, run tests/typecheck/lint/build. No new dependency or ADR required.

## Date/time popup follow-up
Replace datetime popups with shared side-by-side calendar and hour/minute/second selection, separated by a vertical rule. Preserve local timestamp/string models in interval, Discord and date converter. Validate type/build/tests and browser selection.

## Centered time wheels
Replace native listboxes with snap-aligned wheels: symmetric padding centers endpoint values, align on mount/external updates, mouse wheel/click/keyboard selection and settled touch scrolling. Check types/lint/build and browser center geometry.

## Smooth scrolling and mouse drag
Smoothly align click/wheel/keyboard changes, follow mouse drag directly with pointer capture, snap on release and suppress the trailing click. Preserve touch scrolling and reduced-motion preference. Check types/lint/build and browser interactions.

## Now then drag regression
Reproduced hour 09 resetting to 00 after Now and 73px upward drag. Remove competing native CSS snap while retaining JS release/settle alignment; stop ongoing animation on pointer down and suspend settling during pointer interaction. Re-run identical browser sequence.

## Time-only parity
Reuse shared picker with timeOnly mode for truncation: hide calendar/divider, preserve HH:mm:ss binding, reuse centered smooth draggable wheels and Now/Confirm. No duplicate interaction implementation.
- Audit follow-up: migrate ETA datetime and weekday date-only inputs to shared picker; add dateOnly presentation/format mode, preserve timestamp and yyyy-MM-dd contracts. Verify inventory, browser selection and standard checks.
