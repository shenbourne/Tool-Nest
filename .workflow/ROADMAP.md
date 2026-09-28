# Roadmap

The detailed delivery sequence remains authoritative in `DEVELOPMENT_PLAN.md`. Register active protocol phases here as they are created; do not duplicate their implementation task lists.

| Phase | Outcome | Requirements | Status | Dependencies |
| --- | --- | --- | --- | --- |
| 01 — Tool file import controls | All 19 local-file tools expose a working file-import control via a shared `ToolFileUpload` component | R-002 | COMPLETE, merged to `master` at `88969cd`. Acceptance PASS; tests/typecheck/build PASS; lint blocked by the pre-existing 232-error baseline | None |
| Unassigned | Existing ToolNest delivery work, to be split into the next numbered phase before new non-trivial implementation | R-001–R-005 | In progress | See `DEVELOPMENT_PLAN.md` |
