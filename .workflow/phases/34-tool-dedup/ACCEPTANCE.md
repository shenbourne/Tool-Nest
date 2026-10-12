# Acceptance

- PASS: four canonical catalog entries; five duplicate entries removed (209 -> 204 against current master). Registry tests guarantee unique canonical/legacy paths. Actual browser visited all five removed routes and /math-evaluator, with expected redirects. Old Chinese JSON/token search names each returned one retained tool.
- PASS: quoted/multiline/uneven CSV regression and actual browser output; JSON 1–8 spaces/tab, invalid-input output suppression and error recovery tested. Browser tab indentation/error recovery passed.
- PASS: first-occurrence ordering, case/space distinction, CRLF and both empty-line modes tested; browser switch produced a blank retained row then removed it.
- PASS: password16/symbols and token64/no-symbols presets, exclusion, bounds1/512, empty alphabet and crypto rejection sampling regression tests. Actual browser switched to token, generated output and enabled copy/export. Browser inspection redacts secret values: exact length/charset verified in service tests, not claimed from redacted DOM values.
- PASS: real Pinia tool store with mocked persistence resolves favorites/recents once, allows unfavoriting, persists canonical usage and retains unknown data. Server persistence implementation unchanged.
- PASS: latest master already contained unified calculator. Deleted duplicate tool modules/obsolete translations; calculator errors now use canonical locale group. /math-evaluator browser redirects and division-by-zero shows Chinese error.
- PASS: final full416 tests, targeted store3 after lint cleanup, typecheck, scoped lint and production build. Chinese/light desktop browser coverage; mobile/dark/English browser NOT RUN. No server/integration suite rerun because backend and persistence API unchanged.
