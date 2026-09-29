# Roadmap

The detailed delivery sequence remains authoritative in `DEVELOPMENT_PLAN.md`. Register active protocol phases here as they are created; do not duplicate their implementation task lists.

| Phase | Outcome | Requirements | Status | Dependencies |
| --- | --- | --- | --- | --- |
| 01 — Tool file import controls | All 19 local-file tools expose a working file-import control via a shared `ToolFileUpload` component | R-002 | COMPLETE, merged to `master` at `88969cd`. Acceptance PASS; tests/typecheck/build PASS; lint blocked by the pre-existing 232-error baseline | None |
| 02 — FFmpeg load progress stuck at 0% | Audio/video/GIF tools load the FFmpeg core with real progress, and report the reason when the load fails | Defect fix (user report 2026-09-28) | COMPLETE, merged to `master` at `183296d` (merge commit `chore(merge): integrate phase 02 ffmpeg load progress fix`). Root causes: no load-time progress events, a Vite-pre-bundled worker URL that 404s, and an unreachable unpkg CDN. Acceptance PASS; tests/typecheck/build PASS; lint blocked by the pre-existing baseline | Phase 01 (shares the media tool pages) |
| 03 — Speed controls run in the opposite direction to their labels | Every media speed control produces the speed it claims: `2x` is twice as fast, `0.25x` is a quarter speed, and the labelled frame duration is honoured | Defect fix (user report 2026-09-28) | COMPLETE, merged to `master` at `8970c50` (merge commit `chore(merge): integrate phase 03 speed factor fix`), after phase 02 as planned. Fixed `video-change-speed` (all options inverted), `gif-change-speed` (inverted notation in the labels) and `images-to-gif` (`fps=round(1/d)`, invalid above `d=2`). Merged content verified byte-identical to the verified branch tip | Phase 02 (same tool files) |
| Unassigned | Existing ToolNest delivery work, to be split into the next numbered phase before new non-trivial implementation | R-001–R-005 | In progress | See `DEVELOPMENT_PLAN.md` |
