# Phase 26 — Base64 file input/output layout

User-approved scope: two stacked input/output rows matching text encryption; standard FileCard output, automatic MIME-based extension, one dot separator. Preserve raw Base64 manual extension.

## Plan and review
Reuse ToolTextPanel optional input/output action slots with unchanged fallbacks; delegate binary input to ToolFileUpload, output preview to FileCard. Use existing static MIME table. Update prior panel exclusion test to reflect new scope. No new dependency or ADR. Focused module review found no cycles or duplicated IO. Shared unrelated dirty work excluded.

## Acceptance
Desktop screenshot and DOM review PASS in main checkout for equal paired columns. Standard file preview shows decoded Hello text; PNG/PDF/text headers update filename, charset parameters accepted, raw Base64 retains suffix. Dot separator retained; duplicate suffix removed. Existing global mobile sidebar issue remains outside scope. Clipboard/download and binary import were not browser-exercised.

## Verification
Isolated feature/phase-26-base64-file-layout starts at private/master 742c5e3, fast-forwarded to local master 9b1e7d7 (existing token-generator commit retained).
pnpm --filter @toolnest/web test: initially 341/342, obsolete exclusion failed; updated contract and rerun PASS (342 tests).
pnpm --filter @toolnest/web build: PASS including vue-tsc; existing browser externalization/chunk size warnings.
pnpm exec eslint apps/web/src/components/ToolTextPanel.vue apps/web/src/tools/base64-file-converter/Base64FileConverter.vue: PASS.
Source/diff review PASS. No server changes, server checks not applicable.
User explicitly authorized merge to master. Remote publication is recorded below after completion.
