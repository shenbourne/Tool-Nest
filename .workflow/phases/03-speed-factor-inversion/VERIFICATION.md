# Engineering verification

- Branch: `fix/speed-factor-inversion`, stacked on `fix/ffmpeg-load-progress` (unmerged phase 02) at `34880b0`
- Commits: `6aae401` (video filters + shared module), `9437ba4` (GIF options + labels), `8d174df` (images-to-gif rate); the phase records follow in a fourth commit
- Date: 2026-09-29
- Review: self-review of every diff line, plus one independently dispatched reviewer agent (see below). The reviewer's findings were each re-verified against the code or the CLI before being accepted or rejected.

## Independent review

A general-purpose reviewer agent was given the two-commit diff (`git diff 34880b0..HEAD -- apps/web`) and the intent, and asked to check the filter math, hunt for other label/parameter disagreements, look for regression risk, and judge whether the new module was over- or under-specified. Outcome:

| Finding | Disposition |
| --- | --- |
| `setpts=PTS/s` and the `atempo` chain are mathematically right for a speed multiplier; reachable speeds `{0.25,0.5,1,1.5,2,4}` all emit legal `atempo` factors | Confirmed, no action |
| `images-to-gif` labelled 「帧时长（秒）」 but computed `fps=round(1/d)`, which is invalid for `d>2` and inaccurate for `1<d<2` | **Verified by CLI and fixed** (commit `8d174df`, criteria A-9/A-10) |
| No other tool in `apps/web/src` disagrees between a control's label and the applied parameter — `video-to-gif` fps, `video-compress` CRF map, `image-change-opacity`, `pdf-rotate`, `pdf-to-png`, `audio-change-speed` all check out | Confirmed independently; no action |
| No regression: all six `gifChangeSpeed.speed*` keys resolve in both locales, `speedSlower` and `atempoChain` have zero references, numstat is small, no whole-file CRLF churn, no dead code | Confirmed, no action |
| The `>100` branch of `audioAtempoFilter` is unreachable from both callers (max speed 4), and its `400x` test exercises dead behaviour | **Kept deliberately.** It is the other half of the single `[0.5, 100]` constraint the function documents, it was carried over from the pre-existing implementation rather than invented here, and removing it would turn a future out-of-range option into a silent illegal filter. Recorded rather than actioned |
| `audioAtempoFilter(0)`, negatives and `NaN` would loop forever or emit `atempo=NaN`; the module does not validate its input | Accepted as a known limitation, not guarded: the only callers pass a value taken from a fixed option list, and adding validation for an input no caller can produce would be speculative. Same reasoning as the `>100` branch above — the module's contract is a positive speed multiplier |

## Codebase health

Not triggered. The change is three single-tool defect fixes plus a 15-line pure module under the existing `apps/web/src/utils/` convention (`csv.ts`, `clipboard.ts`, both already unit-tested). No dependency direction changed, no module boundary moved, no recurring structural problem was exposed — the recurring *defect* pattern found here was already recorded as D6 in `.scratch/tool-interaction-audit/findings.md`.

## Gates

`bash scripts/verify` (default commands), run after the final code commit:

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Tests | `pnpm test` | PASS | web 158 passed / 27 files (145 + the 13 new `ffmpeg-speed.test.ts` cases); server 52 passed / 8 files |
| Lint | `pnpm lint` | FAIL (pre-existing baseline) | 231 errors / 88 files, none from this change — see the differential measurement below |
| Typecheck | `pnpm type-check` | PASS | `packages/shared`, `apps/server`, `apps/web` all clean |
| Build | `pnpm build` | PASS | `✓ built in 29.02s`; the shared module is emitted as `dist/assets/ffmpeg-speed-*.js` (0.29 kB) |

### Differential lint (the meaningful lint evidence)

`pnpm lint` fails on the repository baseline, so it cannot show that a change is clean. Instead each touched file was linted twice with `eslint --stdin --stdin-filename`, once with the `HEAD` content and once with the worktree content:

| File | Errors before | Errors after |
| --- | --- | --- |
| `tools/video-change-speed/VideoChangeSpeed.vue` | 6 | 6 |
| `tools/gif-change-speed/GifChangeSpeed.vue` | 7 | 7 |
| `tools/images-to-gif/ImagesToGif.vue` | 5 | 5 |
| `utils/ffmpeg-speed.ts` (new) | – | 0 |
| `utils/ffmpeg-speed.test.ts` (new) | – | 0 |

The remaining errors are the repo-wide `no-undef` noise on auto-imported `ref`/`computed`/`t` in every SFC, present identically at `HEAD`. `pnpm lint` runs with `--fix`; it produced no content change in the working tree (`git diff --stat` empty afterwards).

## Integration

- **Unit (TDD, observed red then green).** `src/utils/ffmpeg-speed.test.ts` first failed with *"Failed to load url ./ffmpeg-speed"*, then 10/10 passed for the video+audio builders, then the GIF block failed with *"gifSpeedFilter is not a function"* before the builder was added and 13/13 passed after. One of the first-draft tests was wrong (it compared PTS divisors, which are just the speeds) and was rewritten to assert the duration factor `1/s`; the correction is visible in the commits.
- **Local FFmpeg CLI** (9.0.2, generated fixture, exact filter strings from the module) — see `ACCEPTANCE.md` A-1…A-4, A-9 for the values. Pre-fix filters were run too, reproducing the reported ½-speed result (11.978 s from a 6.000 s clip at "2x").
- **Browser, dev server** (`vite --port 3411`): `/video-change-speed` 2x → 3.200 s and 0.25x → 23.981 s from the 6.000 s fixture with no error alert; `/gif-change-speed` showed the corrected label set and produced 15 frames / 1.500 s at `4x（极快）`; `/images-to-gif` per-frame delay equalled the setting at `d=0.5/1/3`.
- **Browser, production build** (`vite preview --port 3412` over the `pnpm build` output): `/video-change-speed` with `2x（较快）` produced 41,260 B / 3.200 s, byte-identical to the dev run.
- Inputs were injected with a `File` + `DataTransfer` on the real `<input type="file">` (the browser MCP rejected every workspace path for `upload_file`), and the produced blob was read back out of the component and measured with `HTMLVideoElement.duration` / `ImageDecoder` frame delays.

## Limitations

- Browser measurements of the fast speeds overshoot the exact ratio (3.200 s vs 3.000 s at 2x) because of AAC/frame padding in the container; `1x` is exactly 6.000 s and the slow paths are exact, so this is container overhead rather than a residual direction error. The `0.25x` measurement (23.981 s) and the theoretical 24.000 s differ by 0.08%.
- The local CLI is `ffmpeg` 9.0.2 while the app runs `@ffmpeg/core` 0.12.6; the two disagree on `images-to-gif`'s concat handling (recorded in `ACCEPTANCE.md`), so CLI numbers are not a substitute for the browser measurements on that tool. The filter-direction conclusions are identical in both.
- `AudioChangeSpeed.vue` was not exercised in a browser this phase: it is untouched and already correct (`atempo=<speed>`, labels equal to values), and would be broken by nothing here. It still inlines its own `atempo` string instead of using the new module; that is a consistency nit, not a defect, and was left alone to keep the diff to the reported class.
- The images-to-gif `exec` return code is still unchecked, so a future encoder failure would surface as a missing-output error rather than the exit code. Out of scope, unchanged from `HEAD`.
- Scratch artefacts for reproducing the CLI evidence (fixture generator + both gate logs) are left untracked in `.scratch/speed-evidence/`. The fixtures in the repository root used for the browser runs were deleted.
