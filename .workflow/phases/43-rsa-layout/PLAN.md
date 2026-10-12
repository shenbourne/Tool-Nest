# Plan

1. Change only RSA component template/styles: conditional equal-width output grid with two shared output-only panels; equal textarea heights and distinct PEM names.
2. Place controls below outputs in a shrinkable nonwrapping flex row; stack key outputs on narrow screens.
3. Verify desktop1440x1000 and mobile390x844 screenshots, generation/hiding, both copy buttons and PEM downloads. Run scoped lint, web typecheck/tests/build.
4. Review, record acceptance/evidence, commit only phase43 source/docs, fetch/compare and publish feature; no master merge.

TDD skipped for local presentation-only change; browser behavior/action checks are meaningful validation. Architecture/health review not applicable: existing shared component, single tool, no new abstraction or contract.

Scope revision: remove key-grid v-if; verify empty panels remain visible with four disabled actions. Earlier hidden screenshot records superseded behavior.
