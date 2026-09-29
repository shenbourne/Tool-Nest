# Acceptance verification

Requirement source: user bug report 2026-09-28 — 「视频变速x2选项其实是变慢了1/2，与控件标称不符，找出类似的错误并修缮」, plus the user's 2026-09-28 decision to unify `gif-change-speed` in the same phase. Verified by Chrome DevTools MCP against a real browser (dev server and production build) and against the local `ffmpeg` 9.0.2 CLI; all checks performed by the agent on 2026-09-29.

## Fixture

`.scratch/speed-evidence/verify-speed-filters.sh` builds the input with `ffmpeg -f lavfi`: `in.mp4` = 6.000 s, 160×120, 10 fps, H.264 + AAC sine (71,739 B); `in.gif` = 6.000 s, 60 frames. The CLI steps use the exact filter strings that `apps/web/src/utils/ffmpeg-speed.ts` emits and that `ffmpeg-speed.test.ts` pins.

| # | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| A-1 | Selecting `2x（较快）` in 视频变速 plays the video **twice as fast** | Browser, dev `:3411`: 6.000 s input → output **3.200 s** (41,260 B, 160×120), no error alert. Production build via `vite preview :3412`: same run → **3.200 s**, byte-identical output (41,260 B). CLI with `setpts=PTS/2` + `atempo=2`: 3.200 s | PASS |
| A-2 | The pre-fix command really did the opposite | CLI with the previous filters (`setpts=2*PTS`, `atempo=0.5`): 6.000 s input → **11.978 s** — the ½-speed result from the report, reproduced with the old filter strings | PASS |
| A-3 | The slow options still slow down, by the labelled amount | Browser dev: `0.25x（极慢）` → **23.981 s** (246,816 B). CLI: `0.25x` → 23.934 s, `0.5x` → 11.978 s, `4x` → 1.700 s | PASS |
| A-4 | `1x（正常）` leaves the clip untouched | CLI: `setpts=PTS/1` + `atempo=1` → **6.000 s**, unchanged | PASS |
| A-5 | GIF 变速 options are labelled honestly and `4x（极快）` is 4× faster | Browser dev `/gif-change-speed`: the dropdown now reads `0.25x（极慢）`, `0.5x（慢）`, `1x（正常）`, `1.5x（快）`, `2x（较快）`, `4x（极快）` (previously `0.25x（极快）`…`4x（极慢）`). Selecting `4x（极快）` on the 60-frame/6.000 s GIF gave **15 frames / 1.500 s**. CLI: `4x` → 1.500 s, `0.25x` → 24.000 s; the pre-fix filter for that option (`setpts=4*PTS`) gave **24.000 s** under a label that said 极快 | PASS |
| A-6 | Every option's numeric label equals its value, in both locales | Sweep of all 18 labelled numeric options app-wide: 0 mismatches; `tools.gifChangeSpeed` key sets identical in `zh.json`/`en.json`; no dangling `speedSlower` reference | PASS |
| A-7 | No regression in the tools or the app | Both tools processed real files end to end with no error alert (A-1, A-5); `pnpm test` PASS, `pnpm type-check` PASS, `pnpm build` PASS — see `VERIFICATION.md` | PASS |
| A-8 | The audio direction matches the video direction after the fix | Video output at 2x is 3.200 s *and* the audio filter became `atempo=2`; at 0.25x the chain is `atempo=0.5,atempo=0.5`. Both were previously derived from `1 / factor`, i.e. inverted with the picture | PASS |
| A-9 | 图片转 GIF honours the labelled 「帧时长（秒）」 instead of failing or drifting | CLI, 3 images: pre-fix `fps=round(1/3)=0` → encoder error ("The encoder timebase is not set"), no output; post-fix `fps=1/3` → 9.000 s for three frames at `d=3`. `d=1.5`: pre-fix 4.000 s, post-fix 4.500 s. `d=2`: 6.000 s both. `d=0.5`: 1.500 s both (unchanged, as the rounding was already exact there) | PASS |
| A-10 | The same in the real browser | Dev `:3411` `/images-to-gif`, three PNGs, `帧时长` set to 3 through the control: output produced with no error alert, and each frame's delay is exactly the setting — `d=3` → 3.000 s/frame, `d=1` → 1.000 s/frame, `d=0.5` → 0.500 s/frame | PASS |

## Defect found but deliberately not fixed in this phase

While verifying A-10, `images-to-gif` was measured to emit **one fewer frame than the number of images**: three PNGs always produced a 2-frame GIF, at every `d` (0.5, 1, 3), with the total duration therefore `(n-1) × d`. The same input through CLI `ffmpeg` 9.0.2 keeps all three frames, so the likely cause is the concat demuxer in the app's `ffmpeg-core` 0.12.6 ignoring the trailing `duration` entry of the list. This is a data-loss defect, not a label/behaviour mismatch, and `d=0.5` shows it identically before and after the A-9 change, so it is pre-existing and independent of this phase's work. Reported here for a separate fix; not fixed to keep this phase's scope to the reported class.

## Notes

- `audio-change-speed` was inspected and already applied `atempo=<speed>` with labels matching the option value, so it required no change and is now the reference for the convention.
- Measured durations for fast speeds land slightly above the exact ratio (3.200 s instead of 3.000 s at 2x, 1.700 s instead of 1.500 s at 4x) because of container/AAC frame padding and the final frame's duration. `1x` is exactly 6.000 s and the 0.25x/0.5x paths are exact, so the discrepancy is container overhead, not a residual direction error.
- GIF 变速 keeps the same six reachable speeds but the `1.5x` option changed meaning: it was 1.5× *slower* (`1.5x（较慢）`, value 1.5) and is now 1.5× *faster* (`1.5x（快）`), matching its number. This was part of the agreed unification, not an accident.
