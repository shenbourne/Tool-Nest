# Engineering verification

- Commit/branch: `c538dc3` on `fix/tool-file-upload-control` (branched from `e277797`)
- Date: 2026-09-28
- Review: diff reviewed against phase scope; no unintended changes. `AGENTS.md` shows as modified in the working tree — that is the user's own in-flight protocol rewrite, not part of this phase, and was deliberately left uncommitted.

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Tests | `pnpm test` | PASS | apps/web 26 files / 140 tests passed; apps/server 8 files / 52 tests passed |
| Lint | `pnpm lint` | FAIL | 232 errors, all pre-existing. Touched files: 16 errors vs 17 at base `e277797` — this phase removed one and added none. See below. |
| Typecheck | `pnpm type-check` | PASS | `tsc --noEmit` (shared, server) and `vue-tsc --noEmit` (web) all clean |
| Build | `pnpm build` | FAIL → PASS | At the phase 01 tip this failed only because of the pre-existing `apps/web/src/tools/generic-calculator/GenericCalculator.vue:28` duplicated `</script>` (present at base `e277797` and on `master`). Removed in follow-up 1 (commit `4b4f955`, merged as `5e4db5d`); the same command then reported `✓ built in 26.24s`. The merged tree is byte-identical to that commit for `apps/` and `packages/`. |
| Integration | Chrome DevTools MCP against `pnpm dev:web` on `:3004` | PASS | See `ACCEPTANCE.md` |

`scripts/verify` was run first; its combined exit code was non-zero because of the lint and build rows above. Tests were re-run separately because the combined run's output was truncated. After follow-up 1, only the pre-existing lint baseline still fails.

## Lint regression analysis

The 16 errors in files this phase touched are byte-for-byte the pre-existing set, confirmed by extracting the same 19 files from base `e277797` into a scratch directory and linting them with the same flat config:

- base: 17 errors
- branch: 16 errors

The one removed error is `no-explicit-any` on `pdf-merge/PdfMerge.vue:13` (`function onFiles(list: any[])`), which the migration to `File[]` eliminated. Categories, all pre-existing: `no-undef` for `onUnmounted` (6 files — the codebase relies on `unplugin-auto-import` and ESLint is not told about it), `no-explicit-any` in `catch` blocks (7), and unused naive-ui imports (`NAlert` in `image-resize`, `NInput` in `pdf-protect`, `NInputNumber` in `pdf-rotate`).

## Codebase health review

Trigger: this phase introduces a shared abstraction (`src/components/ToolFileUpload.vue`) consumed across 19 tool modules.

- Dependency direction is `src/tools/*` → `src/components/ToolFileUpload.vue` → `naive-ui`, matching the existing `tools/*` → `@/layouts/ToolLayout.vue` and `pages/*` → `@/components/ToolCard.vue`. No cycle introduced.
- Exactly one `NUpload` usage remains in `apps/web/src` (inside `ToolFileUpload.vue`); no parallel upload implementation was left behind.
- Naming follows the existing `Tool*` component prefix.
- No dead code added. `common.uploadFile` looks superseded but is still live in 6 tools that use native `<input type="file">` (`image-change-colors`, `image-create-transparent`, `image-crop`, `image-editor`, `image-remove-background`, `image-split`); migrating those is a separate UX decision, not a defect.
- Residual, pre-existing, not fixed here: the 16 lint errors above and the object-URL-lifecycle / swallowed-exception defects already tracked in `.scratch/tool-interaction-audit/findings.md` (D4, D11).

## Follow-ups (not in this phase)

1. ~~`GenericCalculator.vue:28` — delete the duplicated `</script>`; unblocks `pnpm build` repo-wide.~~ **DONE** in `4b4f955` (branch `fix/generic-calculator-build`, merged as `5e4db5d`). Beyond unblocking the build, the file had never compiled, so `/generic-calculator` was broken at runtime too; verified after the fix that the page renders and `2+3*4` evaluates to `14` with no console errors. Branch naming and this extra work are recorded here rather than as a numbered phase because it is a one-line typo fix, per "apply the lightest workflow that still records scope and evidence".
2. Decide whether the remaining `onUnmounted` `no-undef` errors should be fixed by adding auto-import globals to the ESLint config rather than per-file imports.
3. `.scratch/tool-interaction-audit/` — its triggers assume uploads work ("上传一个损坏的/伪装的文件"); that assumption was false until this phase, so every finding in it is downstream of a control that never rendered. Re-audit after this lands.
4. `GenericCalculator.vue` and the other natively-authored tools are worth a compile smoke check — the duplicated tag was invisible to `vue-tsc` and to `vitest`, and only `vite build` caught it.
