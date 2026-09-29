# Implementation plan

- Branch/worktree: `fix/speed-factor-inversion`, stacked on `fix/ffmpeg-load-progress` (unmerged phase 02). Phase 02 already rewrote the load controls in the same two `.vue` files, so branching from `master` would guarantee a conflict; the branches are to be merged in order.
- Relevant files/interfaces:
  - `apps/web/src/utils/ffmpeg-speed.ts` (new, pure) — `videoSetptsFilter(speed)` → `setpts=PTS/<speed>`; `audioAtempoFilter(speed)` → `atempo=` chain over the speed multiplier; `gifSpeedFilter(speed)` → `[0:v]setpts=PTS/<speed>,fps=10[v]`.
  - `apps/web/src/utils/ffmpeg-speed.test.ts` (new) — asserts the direction property (larger speed ⇒ shorter PTS), the `PTS/<speed>` form, the atempo chain for `0.25`, and the GIF filter.
  - `apps/web/src/tools/video-change-speed/VideoChangeSpeed.vue` — drop the inline `setpts`/`atempoChain`; call the module for both filters. Option values and labels stay as they are.
  - `apps/web/src/tools/gif-change-speed/GifChangeSpeed.vue` — option values become the speed multiplier (`0.25/0.5/1/1.5/2/4` ascending) with matching label keys; filter comes from the module.
  - `apps/web/src/locales/{zh,en}.json` — rewrite the six `tools.gifChangeSpeed.speed*` labels; `speedSlower` is replaced by `speedFast`, so key names match the values they describe.
  - `apps/web/src/tools/images-to-gif/ImagesToGif.vue` — one line: the output rate becomes `fps=1 / frameDuration` instead of `Math.round(1 / frameDuration)`, so the 「帧时长（秒）」control is honoured across its whole 0.1–10 range.
- Risks: re-pairing the GIF values changes what an existing value means, so the labels and the filter must change together (a partial edit re-creates the bug in the other direction); `fps=10` in the GIF chain is unrelated to speed and must be preserved; the options are only reachable through the select, so no other caller depends on the old values.

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | Phase records + branch | this file | (with task 6) | Done |
| 2 | Unit tests for the filter builders (red) | `pnpm vitest run src/utils/ffmpeg-speed.test.ts` red: module not found | 1 | Done |
| 3 | `ffmpeg-speed.ts` + wire `video-change-speed` to it | tests green; browser `2x` output duration ≈ half the input | 1 | Done |
| 4 | Wire `gif-change-speed` + relabel locales | tests green; browser `4x` output plays 4× faster | 2 | Done |
| 4b | `images-to-gif`: `fps=1 / frameDuration` (same defect class, found by the option sweep and confirmed by CLI) | CLI: `d=3` no longer errors (9.000 s), `d=1.5` → 4.500 s; browser: per-frame duration equals the setting | 3 | Done |
| 5 | Gates + browser and local-ffmpeg duration evidence | see `VERIFICATION.md`, `ACCEPTANCE.md` | 2, 3 | Done |
| 6 | Phase records closed out | `STATE.md`, `ROADMAP.md` | 4 | Done |

## Task-to-acceptance map

- Tasks 2–3 → A-1, A-2, A-3, A-5
- Task 4 → A-4, A-5
- Task 4b → A-9, A-10
- Task 5 → all criteria, plus the engineering gate table in `VERIFICATION.md`

## Scope changes recorded during the phase

- The report named one tool; the same inverted-notation defect was found in `gif-change-speed` and the user elected to unify it in this phase rather than leave it.
- A mechanical sweep of all 18 numeric option controls in the app (label text vs. option value) found no further label/value mismatches, and `setpts`/`atempo` appear in no other tool.
- An independent review pass over the finished diff surfaced a third instance of the same class in `images-to-gif` (label says seconds, arithmetic rounds the rate), which the label/value sweep could not see because that control is an `NInputNumber`, not an option list. It was verified by CLI and folded into the phase as task 4b; the review's other notes are recorded in `VERIFICATION.md`.
