# Plan

1. Replace nine registered cards with one tool and legacy redirects.
2. Use one duration converter for the five duration tools; embed existing weekday, interval, Discord and truncation panels in tabs with one outer header.
3. Test duration boundaries, review registry/layout boundaries, run web tests, typecheck, scoped lint and build.
4. Record acceptance, commit and publish feature branch without merging.

## UI follow-up
Use a shared compact form/result panel: inputs first, labelled result rows with per-row/all copy, responsive grids. Reuse calculations, replace generic file/text controls for calendar and clock forms. Update Chinese/English labels, run tests/typecheck/lint/build. No new dependency or ADR required.

## Date/time popup follow-up
Replace datetime popups with shared side-by-side calendar and hour/minute/second selection, separated by a vertical rule. Preserve local timestamp/string models in interval, Discord and date converter. Validate type/build/tests and browser selection.
