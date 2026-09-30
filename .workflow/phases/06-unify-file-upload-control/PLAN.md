# Implementation plan

- Branch/worktree: `feature/phase-06-unify-file-upload-control`, cut from `origin/master` (`15c8496`).
- Relevant files/interfaces:
  - `apps/web/src/components/ToolFileUpload.vue` — the target control. Contract used by the migration: props `accept` (default `''`), `multiple` (default `false`), emit `change: [files: File[]]`. It is **not modified** by this phase; all 29 input shapes already fit it.
  - `apps/web/src/tools/tool-file-import-controls.test.ts` (new) — the phase's automated guard: no tool renders a native file input, and the 28 migrated components render the shared control.
  - 28 tool components under `apps/web/src/tools/` — template + change-handler edits only.
  - `apps/web/src/locales/{zh,en}.json` — drop the key `common.uploadFile` once nothing references it.
- Risks:
  - A wrong `accept` or a dropped `multiple` silently changes what a tool accepts → the guard test pins both for the migrated set.
  - Handlers that keep the old `if (f)` guard leave a stale preview/result when the file is removed → handlers are rewritten to the empty-selection path, and the remove path is exercised in the browser.
  - Media tools share files (`images-to-gif` has a `generation` guard against a stale render, `video-add-audio` has two independent files) → each keeps its own variable/handler names rather than a uniform copy-paste.
  - `video-add-audio` needs a visible caption for *which* file is requested → keep its `<span>` captions next to the two controls.
- Commit granularity: one commit per mechanical family (media / image / base64) plus the guard test and the i18n cleanup, rather than 28 near-identical commits; every commit is independently buildable.

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | `tool-file-import-controls.test.ts`: assert no `.vue` under `src/tools/` renders `type="file"`, and that the migrated 28 components render `ToolFileUpload` with the expected `accept`/`multiple` | `pnpm test` — RED observed first (2 failed, 28 offenders, `.scratch/phase-06-evidence/guard-test-red.txt`), GREEN after the migrations | `d44b136 test(web): guard tools against bare native file inputs` | DONE |
| 2 | Media family (19 files): `audio-*`, `video-*`, `gif-change-speed`, `images-to-gif` → `ToolFileUpload`, handlers to the `File[]` contract, `multiple` on `audio-merge`/`video-merge`/`images-to-gif`, two labelled controls on `video-add-audio` | guard test phase 1 assertions on all 19; browser import + remove + paste on `/audio-trim`, paired-input check on `/video-add-audio`, multi-file on `/video-merge`, end-to-end GIF on `/images-to-gif` | `0b5a54c feat(web): unify media tool import controls on the shared upload control` | DONE |
| 3 | Image family (8 files): `image-{change-colors,create-transparent,crop,editor,remove-background,split,to-text-ocr}`, `jpg-to-png` → `ToolFileUpload`; drop the `<label for>`/`id` pair; handlers clear file, preview URL and derived result on an empty selection | browser import + split + remove-clears-everything on `/image-split`; guard test | `c3794c9 feat(web): unify image tool import controls on the shared upload control` | DONE |
| 4 | `base64-file-converter` → `ToolFileUpload` with no `accept`; the base64 output clears when the file is removed | browser import of an arbitrary file + remove on `/base64-file-converter`; guard test | `b9e7956 feat(web): unify base64 file import on the shared upload control` | DONE |
| 5 | i18n: remove `common.uploadFile` from `zh.json`/`en.json` after re-grepping that nothing references it | `grep 'common.uploadFile\|\.uploadImage' apps/web/src` → none; both locales parse; `pnpm build` PASS | `895a3ab chore(web): drop the unused uploadFile locale key`, `55b3421 chore(web): drop the orphaned jpgToPng uploadImage locale key` | DONE |
| 6 | Verify: `scripts/verify` components, differential lint of every changed file, browser acceptance sweep | `VERIFICATION.md` / `ACCEPTANCE.md`; tests + type-check + build PASS, lint FAIL on the 231-error baseline with a per-file delta of 0 | `docs(workflow): record phase 06 upload control unification` | DONE |

Scope log — three adjustments against the original plan, recorded rather than silently applied:

1. **The guard test is committed last, not first.** It is RED until the last migration lands, so committing it first would leave three consecutive commits with a failing suite. The RED observation (before any migration) is recorded in `VERIFICATION.md`; the test lands as its own commit after the code it guards.
2. **A second orphaned locale key appeared.** `tools.jpgToPng.uploadImage` was used only by the `<label>` this phase removed, so it became dead exactly like `common.uploadFile`. It is a separate one-line commit rather than an amend, per the repository's preference for new commits. `tools.imageToTextOcr.imageUpload` is still used (an `NCard` title) and was kept; `common.upload` was already unreferenced before this phase and was left alone.
3. **`video-add-audio`'s captions kept their `<span>`, losing only the trailing `: `.** The two captions sat inline beside a native input; the control is a block dragger, so the captions now read as headings above their controls.


`apps/web/src/components.d.ts` shows as modified after any build/dev run with an empty content diff (CRLF artefact, per `STATE.md`) and is never staged.
