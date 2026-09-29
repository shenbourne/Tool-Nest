# Phase context

- Phase: 03 — Speed controls run in the opposite direction to their labels
- Goal: In every media speed tool, the option the user picks produces the speed it claims: `2x` plays twice as fast, `0.25x` plays at quarter speed, and the audio matches the video.
- Source: user bug report 2026-09-28 (screenshot of `/video-change-speed` with `2x（较快）` selected) — 「视频变速x2选项其实是变慢了1/2，与控件标称不符，找出类似的错误并修缮」. Durable requirement IDs do not apply; this is a defect fix.
- Constraints:
  - `audio-change-speed` is already right and acts as the reference implementation: `atempo=<speed>` with option values equal to the playback-speed multiplier (`2` → `双倍速`).
  - FFmpeg `setpts` multiplies presentation timestamps, so it is a **duration** factor: `setpts=2*PTS` = half speed. A speed multiplier `s` needs `setpts=PTS/s`.
  - FFmpeg `atempo` accepts only `[0.5, 100]`, so factors outside that range need a chain (`0.25` → `atempo=0.5,atempo=0.5`). That constraint is legitimate and stays.
  - The two speed control sets are pure data + filter-string construction inside `.vue` files; `apps/web/vitest.config.ts` runs in `environment: 'node'` and excludes `.vue`, so the logic must move into a plain module to be regression-tested.

## Root cause

Both speed tools store a **duration** factor as the option value while labelling it with `Nx` playback-speed notation, so the displayed number means the inverse of what the tool does:

1. **`video-change-speed` — the reported defect.** Option `2x（较快）` has value `'2'`, and the component applies `setpts=${factor}*PTS` = `setpts=2*PTS`, i.e. duration doubled = **half speed**. The audio is inverted in the same direction (`atempoChain(1 / factor)` = `atempo=0.5`), so picture and sound stay consistent with each other but both contradict the label. Every one of the six options is inverted, so the whole control is unusable as labelled.
2. **`gif-change-speed` — the same defect class, masked.** Option `0.25x（极快）` has value `'0.25'` and applies `setpts=0.25*PTS` = 4× faster, so the behaviour matches the parenthetical word but contradicts the `0.25x` number, and contradicts how the same notation behaves in the two sibling tools.
3. **`images-to-gif` — the same defect class, found while sweeping for it.** Its only numeric control is 「帧时长（秒）」(0.1–10, step 0.1), but the output rate is derived as `Math.round(1 / frameDuration)`. For `1 < d < 2` the rounding makes the frames play ~1.1–2× faster than the number says (`d=1.5` → `fps=1` → 4.000 s instead of 4.5 s for three images); for `d > 2` it computes `fps=0`, which the GIF encoder rejects outright ("The encoder timebase is not set") — the labelled frame duration is unreachable for most of the control's own range.

`setpts=1.5*PTS` vs `setpts=PTS/1.5` also explains why the defect survived review: both are syntactically valid filters that produce a playable file, just in the wrong direction.

## Decisions already made

- **Option value = playback-speed multiplier, everywhere** (user decision, 2026-09-28). `video-change-speed` keeps its labels unchanged and gets corrected filters; `gif-change-speed` gets re-paired values and honest labels (`0.25x（极快）` → `4x（极快）`) so `Nx` means the same thing in all three speed tools. Confirmed by the user against the minimal-change alternative.
- The filter strings are built by a shared pure module so the convention is stated once and covered by unit tests, rather than living as an inline template literal in each component.
- The `atempo` chain (needed for `[0.5, 100]`) is kept; it is applied to the speed multiplier directly instead of its reciprocal.
- `images-to-gif` is fixed with `fps=1 / frameDuration` (FFmpeg accepts fractional rates) rather than by editing the label, because the label states the intended behaviour and the control's range (0.1–10 s) is a sensible one. Its number control's label, not its arithmetic, is the source of truth.

## Boundary

- In scope: `apps/web/src/utils/ffmpeg-speed.ts` (+ tests), `video-change-speed/VideoChangeSpeed.vue`, `gif-change-speed/GifChangeSpeed.vue`, `images-to-gif/ImagesToGif.vue`, and the `gifChangeSpeed` label keys in `apps/web/src/locales/{zh,en}.json`.
- Out of scope: `audio-change-speed` (already correct, no change), the FFmpeg loader from phase 02, the `dispose`/leak and progress/cancel findings recorded in `.scratch/tool-interaction-audit/`, `video-change-speed`'s hardcoded `.mp4` output/download name, and the `images-to-gif` defect where the app's `ffmpeg-core` drops the last image of the concat list (found during this phase — see `ACCEPTANCE.md`, reported for a separate fix).
