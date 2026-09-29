# Implementation plan

- Branch/worktree: `fix/images-to-gif-frame-loss`, cut from `master` `fcbc617` (local `origin/master` ref). `git fetch origin` fails on this machine — TLS handshake is cut (`unexpected eof while reading`, with and without `http.sslVerify`) — so the base could not be re-confirmed against the real remote; recorded in `STATE.md`.
- Relevant files/interfaces:
  - `apps/web/src/utils/image-slideshow.ts` (new, pure) — `buildImagesToGifCommand({ inputNames, listName, outputName, frameDuration })` → `{ listContent, args }`. Owns the repeated terminal entry and the `-frames:v` cap.
  - `apps/web/src/utils/image-slideshow.test.ts` (new) — pins `n + 1` list entries with only the last name repeated, `n` frame-slots, `fps = 1 / frameDuration` unrounded, and `-frames:v n`.
  - `apps/web/src/tools/images-to-gif/ImagesToGif.vue` — replace the inline list/argv construction with the module call; no change to controls, labels, or the download path.
  - `.scratch/frame-loss-evidence/` (untracked) — the Node harness that runs the real core artifact plus the measured outputs.
- Risks: `-frames:v` semantics for the GIF encoder (verified to cap, not pad, on both FFmpeg versions); the repeated entry must repeat the *last* name only, or the frame order breaks; `frameDuration` from `NInputNumber` can be `null` when cleared (pre-existing, out of scope, must not get worse).

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | Phase records + branch + remote-sync attempt | this file, `CONTEXT.md` | (with task 6) | Done |
| 2 | Unit tests for the command builder (red) | `pnpm test` red: `Failed to load url ./image-slideshow`; green after task 3 (165 tests) | `72d5e70` | Done |
| 3 | `image-slideshow.ts` + wire `ImagesToGif.vue` | tests green; core harness: 3 images → 3 frames, red/green/blue | `72d5e70` | Done |
| 3b | Multi-count and cross-version sweep on the core | core `n = 1,2,3,5` × `d = 0.1…10` → `n` frames; core and CLI 9.0.2 agree on all 20 cases | `72d5e70` | Done |
| 4 | Browser verification on the dev server | `/images-to-gif`, 3 PNGs, `d = 0.5 / 1 / 3` → 3 frames with delays `0.5 / 1 / 3`, colours red, green, blue; 1 image → 1 frame (pre-fix: 0 bytes) | `72d5e70` | Done |
| 5 | Gates: differential lint, type-check, test, build | see `VERIFICATION.md` | `72d5e70` | Done |
| 6 | Phase records closed out | `STATE.md` | (this commit) | Done |

## Task-to-acceptance map

- Tasks 2–3 → A-1, A-2
- Task 3b → A-3, A-4 (core-versus-CLI agreement)
- Task 4 → A-5, A-6, A-7
- Task 5 → the engineering gate table in `VERIFICATION.md`

## Scope changes recorded during the phase

- The single-image path turned out to be a second, more severe instance of the same pipeline problem: the old command produced a 0-byte file and no frame at all for one image, verified both in the core log (`Output file is empty, nothing was encoded`) and in the browser (`readFile` → 0 bytes). The fix covers it (A-6), so it was folded into this phase rather than filed separately.
- The single-image *stored delay* could not be fixed (no command shape expresses it on FFmpeg 5.1.4, whose `gif` encoder has no `delay` option) and is invisible, so it is recorded as a known limitation instead of a scope change.
- Phase 03's attribution of the defect to the concat demuxer ignoring the trailing `duration` was measured to be wrong; the corrected mechanism is in `CONTEXT.md` and `STATE.md`.
