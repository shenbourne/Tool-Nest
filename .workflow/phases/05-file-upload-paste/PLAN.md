# Implementation plan

- Branch/worktree: `feature/phase-05-file-upload-paste`, cut from `origin/master` (`fcbc617`). Phase 04 (`fix/images-to-gif-frame-loss`) stays on its own unmerged branch; it touches no file in this phase.
- Relevant files/interfaces:
  - `apps/web/src/utils/clipboard-files.ts` (new) — pure helpers, no DOM access, importable by `vitest` in `environment: 'node'`.
  - `apps/web/src/utils/clipboard-files.test.ts` (new) — the phase's automated test evidence.
  - `apps/web/src/components/ToolFileUpload.vue` — the only consumer; gains the listener and the entry construction.
  - `apps/web/src/locales/{zh,en}.json` — `tool.fileUpload.*`.
  - `.workflow/adr/ADR-0001-file-upload-paste.md` — the mechanism decision.
- Risks:
  - A `document`-level listener can swallow unrelated pastes → only a clipboard carrying a matching file consumes the event.
  - Divergence between paste and drag filtering → the matcher mirrors naive-ui's `matchType` and is tested against the same atom shapes the 19 tools actually pass (`.pdf`, `image/*`).
  - Listener leak on unmount → registered/removed in `onMounted`/`onUnmounted`, and the criterion is checked in the browser.

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | `clipboard-files.ts` + test: `collectClipboardFiles` (files ∪ file-items, deduped) and `matchesAccept` (`.ext`, `image/*`, exact mime, comma list, unknown atom) | `pnpm test` — new file observed RED before the implementation, GREEN after | `8a8655c feat(web): add pure clipboard file helpers` | DONE |
| 2 | `ToolFileUpload.vue`: `document` paste listener (mount/unmount), ignore file-less clipboards, filter by `accept`, append when `multiple` else replace, warn on rejection, `emit('change')` | `pnpm type-check`, `pnpm build`, browser paste on `/compress-pdf` + real Ctrl+V; listener mount/unmount instrumented in-page | `d234553 feat(web): import a pasted file in the tool upload control` | DONE |
| 3 | i18n: `choose` / `replace` mention paste; new rejection message | zh + en both rendered in the browser | `d234553` (same commit — the rejection string is referenced by task 2's code, so splitting it would leave a broken intermediate commit) | DONE |
| 4 | Verify: `scripts/verify` components, differential lint of changed files, browser acceptance sweep | recorded in `VERIFICATION.md` / `ACCEPTANCE.md` | `docs(workflow): record phase 05 paste support` | DONE |

Scope log: no change to the goal or boundary. Two adjustments against the original plan, both recorded here rather than silently applied:

1. Tasks 2 and 3 became one commit. The "advertise paste in the copy" change is a separate user-visible edit, but the component's rejection path references `tool.fileUpload.rejected`, so committing the component without the key would leave a commit that renders a raw key path. Phase 01 and phase 04 both ship a test alongside the code it covers, so task 1 also stayed a single commit rather than the planned test/feat split.
2. The drop-and-pick regression criterion could not be checked behaviourally for the drop half — see the `NOT VERIFIED` row in `VERIFICATION.md`; the code path is untouched and that is the recorded substitute.

`apps/web/src/components.d.ts` shows as modified after any build/dev run with an empty content diff (CRLF artefact, per `STATE.md`) and is never staged.
