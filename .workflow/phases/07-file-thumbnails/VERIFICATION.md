# Engineering verification

- Commit/branch: `6e44df1` (kind + geometry), `4904961` (renderer), `158b51d` (control) on `feature/phase-07-file-thumbnails`, which sits on `master`'s phase-06 merge (`427f269`)
- Date: 2026-09-30
- Review: diff read against the phase scope. Changed files: `apps/web/src/utils/file-thumbnail.ts` + `.test.ts` (new), `apps/web/src/utils/thumbnail-render.ts` (new), `apps/web/src/components/ToolFileUpload.vue`. No tool component, no i18n key, no dependency changed. The pre-existing object-URL-lifecycle defect class in `.scratch/tool-interaction-audit/` was explicitly not extended: the list's thumbnails are data URLs and the only object URL (video) is released in a `finally`, which the browser check confirms by counting calls.

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Unit test (RED) | `pnpm --filter @toolnest/web test` | FAIL (expected) | With `file-thumbnail.test.ts` present and its module absent: `Failed to load url ./file-thumbnail … Does the file exist?` — 1 failed suite, 183 passed. |
| Unit test (GREEN) | `pnpm test` | PASS | web 32 files / 206 tests, server 8 files / 52 tests. My module contributes 18 of those (the web suite was 183 tests before `file-thumbnail.test.ts` and no expectation needed a second attempt — the geometry and kind rules went green on the first implementation). 5 of the remaining additions are another session's `category-anchor.test.ts`, present uncommitted in this tree — see the limitation below. |
| Lint (differential) | `eslint --stdin --stdin-filename` for the base component; `eslint <paths>` for the current four files | PASS | Base `427f269:ToolFileUpload.vue`: no output. Current four files: no output, exit 0. Repo-wide `pnpm lint` still fails on the pre-existing 231-error baseline and is not claimed as passing. |
| Typecheck | `pnpm type-check` | PASS | `tsc --noEmit` (shared, server) and `vue-tsc --noEmit` (web) both clean. |
| Build | `pnpm build` | PASS | `✓ built in 27.36s`. Chunking confirms pdf.js stayed lazy: `ToolFileUpload` is 8.21 kB JS + 1.75 kB CSS, and the PDF renderer resolves to the already-existing 334 kB `pdf-ksa_hnld.js` chunk shared with the pdf tools — the component does not pull pdf.js into the initial graph. |
| Integration | Chrome DevTools MCP against `pnpm dev:web` on `:3003` | PASS | Ten criteria in `ACCEPTANCE.md`, including per-format pixel assertions, the icon fallbacks, the replace/remove cases, dark-mode token resolution and object-URL accounting. |

## What the browser check actually established

The interesting claims are the ones a name-only list could fake, so each was measured against pixels:

- **The PDF thumbnail is the page, not a placeholder**: a text PDF gives 107 non-white pixels in the 76×76 canvas while a blank-page PDF through the same path gives 0.
- **The image thumbnail is that image**: the thumbnail's mean colour matched the source's centre square within 1 unit per channel.
- **The video thumbnail is a decoded frame**: centre pixel `[210,44,43]` against the fixture's `#d22b2b` = `[210,43,43]`, on both the paste and pick paths.
- **Rows own their thumbnails**: with two PDFs the profiles were `[107, 0]`; removing the first left `0`, and replacing a text page (107) with a blank page left `0` — no cached thumbnail crossed between entries.
- **Nothing leaks**: `URL.createObjectURL` was called 0 times across two PDF imports and a removal; the video path called it once and revoked once.

## Recorded deviations and limitations

1. **The thumbnail box is 38px, not the 40px in `CONTEXT.md`'s decision line.** Without a global `box-sizing` reset, a 40px box plus the row's 4px padding and 1px borders rendered a 58px row instead of the 48px step. The box is 38px with `box-sizing: border-box` declared on the row and the box, which lands the row exactly on 48px using only token values. The phase context records the correction.
2. **The gates ran in a working tree that also holds another session's uncommitted work** (`category-anchor.ts` + `.test.ts` and edits to `AppLayout`, `CategoryPage`, `HomePage`, `router`). Those files are disjoint from this phase's and both packages type-check and build clean, but the test *counts* above include that session's 5 tests, and a failure in their files would have been visible here.
3. **No reviewed screenshot**: the MCP screenshot tool rejects paths under `.scratch/`, and the response-attached image is not inspectable by the agent, so the visual claim rests on the pixel measurements.
4. **Not covered**: browsers without `createImageBitmap` (the image path would fall back to the icon rather than rendering), successful decoding of containers the browser lacks codecs for (mkv/avi — the failure path is verified, the success path is not), and very large PDFs.
5. **This phase's `STATE.md` and `ROADMAP.md` edits are deliberately left uncommitted.** The working tree is shared with a second session that is mid-flight on phase 08 (`category-anchor-scroll`), editing those two files and staging its own phase-08 documents while this phase was being recorded. Committing them here would write another phase's in-flight documentation into this commit, so the phase-07 records were committed with an explicit pathspec covering only `.workflow/phases/07-file-thumbnails/`. The on-disk `STATE.md` / `ROADMAP.md` already describe phase 07 correctly; whoever commits them next carries that text, and a merge of this branch will need the usual `.workflow/STATE.md` conflict resolution (phase 06's merge had exactly one).

## Codebase health review

Not triggered as a separate assessment: one new pure module plus one new DOM module consumed by an existing component, no dependency change, no new abstraction beyond the testability split the repo's vitest config forces (`.vue` internals are untestable). `thumbnail-render.ts` is the only place that knows about canvases, pdf.js and `<video>`; the accept/geometry rules it shares with the UI live in `file-thumbnail.ts` under test. If a second consumer ever needs a thumbnail (a gallery view, a drop zone preview), the renderer is already the seam.

## Follow-ups (not in this phase)

1. `THUMBNAIL_BOX` (38) and `.tool-file-upload__thumb`'s 38px are two literals that must agree; a comment links them in each file. Tokenizing it would require adding a size tier, which `DESIGN.md` rule 8 forbids.
2. Thumbnails are cached per list entry for its lifetime and never re-rendered; a very long session with many imports holds one 76×76 data URL per live entry, which is bounded by the list itself.
3. The phase-06 leftovers still apply: `common.upload` has no consumer, `images-to-gif` shows its own selection count next to the control's list, and the `dispose`/progress/cancel findings in `.scratch/tool-interaction-audit/` remain open.
