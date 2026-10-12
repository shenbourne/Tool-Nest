# Plan

1. Regression tests for explicit newline/custom parsing, retained sort/wrap/join operations, independent delimiters and complete pipeline; RED observed for embedded commas incorrectly split before implementation, then GREEN. Final tests also verify common auto/trim defaults.
2. Extend existing ListOptions compatibly with inputSeparator; share DEFAULT_LIST_OPTIONS between UI and tests. Keep current automatic input detection logic.
3. Latest steering: one page, no tabs/presets. Separate input/output delimiter selectors/custom fields and existing transform controls. Remove earlier route/preset state and translations so old preset URLs cannot override common Auto/Trim defaults.
4. Remove three tool directories and migrate sorting tests; keep old URLs/search via metadata. Bilingual UI and migration inventory/requirements/roadmap reflect the user decision.
5. Registry/preferences regression, full front-end tests, scoped lint/typecheck/build, real browser defaults/delimiters/manual operations/legacy routing validation. Ordinary review and focused cross-module health for registry -> route -> controls -> pipeline. No harness audit warranted.
6. Mirror scoped component/service/metadata/locales/deletions into primary, preserving unrelated changes; fetch/compare/commit/push isolated feature branch and record actual evidence. Master merge remains separate.

Expanded user steering: all nine retained list-* tools share input/output delimiter controls. Default input Auto detect, default output Same as input; auto detection prefers whole lines before punctuation. Shared ListSeparators component/useListSeparators/list-input helper implement one contract. Grouping applies output delimiter inside each group while preserving labeled group boundaries. Shuffle output delimiter changes must retain the existing shuffled order. Add parser/composable/output-following regressions, browser verify all eight sibling operations and explicit delimiter override. Integrated concurrent local master37e5c89 ToolCard height-only update before implementation.

2026-10-12 latest user scope: remove List Duplicate completely (page, catalog, translations and text-panel contract); inventory marked excluded. Remaining eight list tools keep shared Auto input/Same output controls. Earlier nine-tool checks describe superseded scope.
