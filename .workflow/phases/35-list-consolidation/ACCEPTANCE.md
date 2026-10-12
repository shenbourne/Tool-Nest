# Acceptance

- PASS: one List Converter entry; three legacy tools removed. Registry/preferences tests confirm redirects, old search names and single favorites/recent entry. Final browser has no tabs/mode controls; /text-join redirects to /list-converter with common defaults. /list-sort and /list-wrap redirects were observed before the final UI simplification; metadata/router unchanged afterward.
- PASS: independent input/output selectors and custom fields; service and browser demonstrated `a,b::c,d` with input `::` and output ` | ` -> `a,b | c,d`.
- PASS: shared DEFAULT_LIST_OPTIONS sets Auto detect and Trim ON; final browser confirmed these defaults even at former `?preset=wrap` URL. Explicit newline plus disabled cleanup preserves commas/spaces/blank entries in regression tests; natural/case-insensitive sort retained.
- PASS: one cleanup/dedup/sort/wrap/join pipeline; service tests cover composition and empty input. Final single-page browser controls sorted/deduplicated items and applied prefix/suffix without changing input.
- PASS: bilingual control keys valid, existing ToolTextPanel import/copy/export retained. No route or preset watcher remains to reset options. Final direct legacy route opens common defaults.
- PASS: full419 tests, scoped eslint, build including vue-tsc PASS; real Chinese/light desktop browser validated final defaults/no tabs and manual operations. English/dark/mobile browser NOT RUN. Existing font-file serving warning in dependency-junction dev preview uses fallback fonts; production build PASS.

- Expanded final PASS: nine retained list-* tools have identical input/output selector controls; input Auto detect, output Same as input defaults. Shared parser/composable/output-following tests PASS; full433 tests, scoped lint, typecheck/build PASS36.18s. Live browser checked converter, duplicate, frequency, group, reverse, rotate, shuffle, truncate and unwrap. Group headers retained; inside-group items honor output delimiter. Shuffle delimiter override retained order and members. Converter auto semicolon input ` b; a ` -> `b;a`; reverse comma input -> `c,b,a`. Empty/custom separators and CRLF covered by tests. English/dark/mobile browser still NOT RUN.

2026-10-12 latest user scope: remove List Duplicate completely (page, catalog, translations and text-panel contract); inventory marked excluded. Remaining eight list tools keep shared Auto input/Same output controls. Earlier nine-tool checks describe superseded scope.

Final scope PASS: eight shared-control tools; removed List Duplicate catalog/page/locales verified by registry regression, source search and browser not-found page. Full434 tests/build/lint PASS. Phase35 implementation and acceptance complete; feature publication next, merge separate.
