# Verification — Phase35, 2026-10-12

## Scope and state

Final user instruction supersedes earlier preset/tab proposals: one List Converter page, no tabs/presets, default Auto detect input and Trim item whitespace ON. Sorting/wrapping/joining remain configurable operations. Old three tools redirect to this page and no old query preset can override defaults.

Isolated feature/phase-35-list-consolidation created from fetched private/master8a79a5d then fast-forwarded to committed local mastera0c18fd (previous authorized phase34 changes, local ahead6/behind0). Primary shared dirty checkout preserved. This phase has no master merge authorization.

## Actual checks

- RED: initial seven regression tests failed; explicit newline input `b,2\na,1` incorrectly produced `1\n2\na\nb` instead of sorted whole lines. Initial preset helper failures were also observed, then those helpers/tests were superseded by user's no-preset decision.
- Final `pnpm --filter @toolnest/web test`: PASS57 files/419 tests. Removed old sort service's five tests are represented by natural/case-insensitive/numeric/blank/empty cases in new list-operations tests. Existing16 delimiter tests retained; new7 operation tests and preference regression pass.
- Scoped `pnpm --filter @toolnest/web exec eslint` for retained component/service/index, new operation tests, registry/preferences/text-panel contracts: PASS. Final component/service/new tests rechecked after removing tabs.
- Final `pnpm --filter @toolnest/web build`: PASS35.20s, includes vue-tsc. Existing stream externalization/eval/chunk-size dependency warnings retained.
- `git diff --check`: PASS.
- Runtime source search: no listSort/listWrap/textJoin locale groups, sortLines service, NTabs/NTab, preset helpers or route watchers in retained tool. Historical URL strings remain only for compatibility/test evidence.
- Server checks SKIP: no backend or persistence API change. scripts/verify not invoked because repository lint uses --fix; equivalent non-mutating scoped gates used.

## Browser evidence

CUA in-app browser at127.0.0.1:5195, Chinese/light, current viewport772px wide. Final former `?preset=wrap` route displays no modes, Auto detect and checked Trim. ` b, a , b ` -> `b,a,b`. Manual ascending sorting, dedup and prefix/suffix controls compose without resetting input. Service tests provide exact prefix/suffix and line-preservation assertions. Independent custom delimiters verified with `a,b::c,d` -> `a,b | c,d`. All three legacy routes observed redirecting during this phase; final /text-join goes directly to canonical page with common defaults. Existing obsolete preset query is ignored by design. Final screenshot `.scratch/phase35-evidence/list-unified.jpg` in primary workspace. Live preview/tab retained for user review after user interacted with preview during steering.

English/dark/mobile browser NOT RUN. Dev preview's reused dependency junction caused existing font serving warnings; visual check uses fallback font. Production build passes. Copy/export/import shared components retained and existing contract tests pass; no actual download/export smoke test this phase.

## Review and codebase health

Ordinary review: optional explicit inputSeparator leaves existing auto behavior unchanged; manual newline mode resolves embedded-comma issue; custom separators are literal strings (no regex execution). Empty custom input delimiter reports feedback and suppresses output; empty output delimiter remains valid for concatenation. Defaults are one shared readonly constant consumed by UI and tests. No duplicate tool pages or preset state remain.

Focused codebase-health review triggered by registry, three removed tools, retained service/UI and compatibility tests. Traced registry -> existing router redirectFrom -> unified component -> shared pipeline; preference normalization and search aliases use phase34 mechanism. No shared routing contract/dependency changes, cycles, extra registries or mode implementations. Found pre-existing list pipe label interpreted as i18n plural separator; scoped label changed to plain Pipe/竖线 and verified in browser. No architecture ADR required, ADR0001 file-import unaffected. Harness audit SKIP: no recurring workflow investigation requested.

## Delivery

Scoped mirroring uses file/locale-block backups and preserves unrelated primary edits. Final commit/publication and primary checks recorded after execution. Feature branch publication does not merge master.

## Expanded final separator requirements

User added Auto detect for all sibling list inputs, then default Same as input output and both controls everywhere. Nine list-* tools now use ListSeparators/useListSeparators/list-input. Output sentinel null is distinct from literal custom strings; automatic input uses undefined. Newline-first detection preserves whole lines and actual CRLF for same-output mode; literal custom delimiters remain exact. Existing converter's16 delimiter tests pass.

RED observed: automatic multiline conversion previously split embedded commas, producing `New York | US\nLondon | UK` instead of `New York, US | London, UK`; shared parser initially missing. GREEN: shared parser10, composable2 and unified operations9 tests pass. Final full59 test files/433 tests PASS, scoped component/composable/parser/nine tools eslint PASS, final production build36.18s including vue-tsc PASS. Initial extraction left obsolete error ref; removed it, and eliminated existing unnecessary unwrap regex escape before final gates.

Live Chinese/light browser verified all nine tools show input Auto/output Same defaults and actual operations: duplicate `a,a,b,b,c,c`; frequency `a (2),b (1)`; reverse `c,b,a`; rotate `b,c,a`; truncate `a,b,c`; unwrap quoted items `a,b,c`; group preserves labels with comma-separated group items; shuffle has same members and output newline override preserves ordering. Converter semicolon input preserves semicolon output and trims item spaces. All custom/manual/default control behavior shares one component; format changes do not rerun shuffle.

Focused health review expanded to shared controls/parser/composable and eight sibling operation boundaries. Group labels remain structural newlines; chosen output delimiter applies to items within each group. Frequency map changed from inherited object dictionary to Map to count arbitrary string labels correctly. No backend/dependency changes. Concurrent master37e5c89 ToolCard-only update integrated without discarding phase edits. Live preview retained for user review. Current scope is nine list-* tools; line-specific Remove Duplicate Lines remains a text tool with its established line semantics.

2026-10-12 latest user scope: remove List Duplicate completely (page, catalog, translations and text-panel contract); inventory marked excluded. Remaining eight list tools keep shared Auto input/Same output controls. Earlier nine-tool checks describe superseded scope.

## Final removal verification

PASS: List Duplicate source/page/metadata/zh-en locale groups removed, no compatibility redirect added; registry regression asserts route excluded, text-panel contract updated, migration124 marked excluded. Browser old /list-duplicate shows 页面不存在; screenshot .scratch/phase35-evidence/list-duplicate-removed.jpg in primary. Remaining eight list tools retain unified separators. Full pnpm --filter @toolnest/web test PASS59 files/434 tests; production build PASS27.09s including vue-tsc; scoped eslint PASS; git diff --check PASS. Remote refreshed; HEAD37e5c89 is ahead7/behind0 of private/master and equal local master before phase commit. Primary scoped run51 PASS/1 FAIL due unrelated preexisting base64-file-converter ToolTextPanel exclusion mismatch, primary type-check PASS; unrelated source preserved.

Review: removed tool has no retained aliases or redirect, locale JSON parses, operation helpers still used by eight tools. Acceptance complete in isolated feature scope. Server/integration API checks SKIP because no backend change; scripts/verify SKIP because its lint mutates all sources, equivalent scoped non-mutating checks used. Live preview intentionally retained; no master merge authorized.
`nPublication PASS: implementation0d783f89916c6cec9c9eff7e5575aa313a7f10db pushed private/feature/phase-35-list-consolidation; git ls-remote equals git rev-parse HEAD. No master merge. Delivery record committed separately.
