# Implementation plan

- Branch/worktree: `fix/tool-file-upload-control`
- Relevant files/interfaces:
  - new `apps/web/src/components/ToolFileUpload.vue` (auto-registered via `unplugin-vue-components` `dirs: ['src/components']`)
  - `apps/web/src/locales/{zh,en}.json`
  - 19 tool components under `apps/web/src/tools/`
- Risks:
  - naive-ui disables the trigger once `max` is reached, so the file list must stay visible or users cannot replace a file.
  - `pdf-merge` needs `multiple` and takes 2+ files; its handler differs from the single-file tools.

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | Add `ToolFileUpload.vue` + zh/en i18n keys | Component renders a visible drop zone; type-check passes | pending | Planned |
| 2 | Migrate the 9 image tools | One commit per tool; `/convert-to-jpg` shows a picker | pending | Planned |
| 3 | Migrate the 10 PDF tools | One commit per tool; `/convert-to-pdf` shows a picker | pending | Planned |
| 4 | End-to-end: select a real image, convert, download | Browser evidence on both reported tools | pending | Planned |
| 5 | `scripts/verify` + record evidence | Exit codes in `VERIFICATION.md` | pending | Planned |

Update this plan when discoveries change the implementation. Record scope changes rather than silently replacing them.

## Scope change log

- Initial scope was the two tools in the bug report (`convert-to-pdf`, `convert-to-jpg`). Widened to all 19 bare `<NUpload>` sites after `grep` showed the identical defect everywhere; fixing two would leave 17 tools equally unusable.
- Added `fix(convert-to-pdf): keep image object URL alive until jsPDF reads it`. With the import control finally usable, the pre-existing conversion path was exercised for the first time and failed: `process()` revoked the image's object URL on the first line of `img.onload`, before `pdf.addImage` re-read it (`Uncaught (in promise)` at `ConvertToPdf.vue:26`, blob request `ERR_FILE_NOT_FOUND`), and hardcoded format `'JPEG'` for every input. Fixed by revoking in a `finally` after `addImage` and deriving the format from the file type. This was required to make acceptance criterion 5 pass; it is not the D4 silent-failure work, which stays with the audit.
