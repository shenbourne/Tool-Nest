# Verification — 2026-10-12

Base: fetched private/master8a79a5d, local master ahead0/behind0. Isolated feature/phase-34-tool-dedup. Primary shared dirty branch left in place.

## Commands and results

- `pnpm --filter @toolnest/web test -- src/tools/tool-dedup.test.ts`: initial RED (missing new service imports); after implementation PASS5, final PASS6 with rejection sampling test. RED is a suite-import failure, not a claimed behavioral assertion failure.
- `pnpm --filter @toolnest/web test -- src/stores/tool.store.test.ts src/__tests__/registry.test.ts`: PASS10. Search subsequently tested against real search store too.
- `pnpm --filter @toolnest/web test`: final PASS57 files/416 tests. After search baseline lint cleanup, targeted store PASS3.
- `pnpm --filter @toolnest/web type-check`: PASS, including final search cleanup.
- `pnpm --filter @toolnest/web exec eslint` on every changed/new TS/Vue file: PASS. Search initially revealed existing unused ToolCategory/any errors; removed unused type and replaced tag cast with equivalent typed comparison, then scoped lint PASS. No --fix used.
- `pnpm --filter @toolnest/web build`: PASS, final42.21s; pre-existing dependency stream/eval/chunk warnings retained. Build includes vue-tsc. Generated auto-imports/components declarations excluded from commit because baseline generation drift is unrelated.
- `git diff --check`: PASS.
- Runtime source search for removed camelCase tool groups/createToken/generationActions.token: no matches. Legacy URL strings deliberately remain in redirects, aliases and tests.

## Browser

Isolated dev server127.0.0.1:5194, CUA in-app browser, Chinese/light desktop. All five legacy URLs redirected; calculator /math-evaluator redirected to existing unified page. CSV quoted multiline case produced correctly escaped transposed output. JSON tab indentation, invalid input alert/disabled output, subsequent valid-input recovery passed. Dedup toggle retained/removed blank row. Generator token preset switched off symbols; generation produced output/enabled actions. Secret DOM values are redacted by browser tooling: length512 and excluded characters validated through service regression tests, not browser value inspection. Homepage old JSON/token Chinese names each showed exactly one retained result after debounce.

Evidence in primary `.scratch/phase34-evidence/csv-merged.jpg` and `legacy-search.jpg`. Mobile/dark/English browser NOT RUN. No backend user-data writes for test favorites; preference persistence mocked in regression tests.

## Review

Ordinary review: authorized groups only, existing router redirectFrom reused; five duplicate directories removed; preserved options and legacy discovery. Migration inventory/requirements/roadmap now identify canonical tools. Historical phase records are kept as historical evidence rather than rewritten. Calculator already unified in master; remaining old localization dependencies moved to genericCalculator with unused keys removed.

Focused codebase-health review invoked because registry, stores and multiple tools changed. Traced metadata -> router/search -> favorite/recent cards. Found homepage Fuse missing aliases despite tool store supporting them; fixed and tested both stores. Found read-time recents sorting mutated source data; normalization now returns a sorted deduplicated copy. Tool prefs are normalized for display and persisted on next interaction; unknown paths retained. Pure per-tool services own conversion/generation, shared path helper owns metadata-based path resolution. No new dependencies, cycles or alternate registries added. No new ADR required. Harness audit SKIP: this phase is product code cleanup, not a recurring workflow investigation.

## Delivery

Source mirrored into primary checkout using scoped files and locale blocks; originals backed up under `.scratch/phase34-primary-backup`. Primary calculator synchronized to already-approved master implementation; obsolete math-evaluator directory removed. Unrelated primary edits retained. Final publication evidence appended after commit/push; master merge not authorized.

Primary mirror verification: pnpm --filter @toolnest/web test -- src/tools/tool-dedup.test.ts src/stores/tool.store.test.ts src/tools/generic-calculator PASS20; primary type-check PASS. Primary runtime residue scan no matches. Source4347acd published to private/feature/phase-34-tool-dedup; git ls-remote matched full4347acd22eca322ddaf866fda90c2fe462af1b65. Initial TLS EOF and transient auth failures cleared on third push. Master untouched.

2026-10-12 password/token slider follow-up: one component, NSlider follows numeric input; flex row wraps and slider expands; four switches NSpace justify=center/32px spacing. Found NInputNumber precision disables updateValueOnInput in installed source; replaced precision0 with Number.isInteger validator, then actual browser confirmed immediate numeric/slider/preset sync and centering. Targeted tool-dedup6 PASS, component eslint PASS; final build/typecheck result follows. No new tests for this reversible UI edit; interaction checked in browser. No architecture/dependency changes, scoped ordinary review sufficient; no health/harness audit.
Final slider follow-up production build PASS21.66s (includes vue-tsc); pre-existing dependency/chunk warnings retained. Component eslint and git diff --check PASS. Scoped component mirror ready; unrelated edits excluded.
