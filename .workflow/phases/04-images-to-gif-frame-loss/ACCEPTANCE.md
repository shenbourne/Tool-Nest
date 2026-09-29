# Acceptance verification

Requirement source: the `images-to-gif` defect recorded as found-but-not-fixed in phase 03 (`.workflow/phases/03-speed-factor-inversion/ACCEPTANCE.md`) and carried in `STATE.md`; user instruction 2026-09-29 「修复该问题」. Expected behaviour: a GIF built from N images holds N frames, in selection order, each for the labelled 「帧时长（秒）」.

Verified against the app's real core artifact (`@ffmpeg/core@0.12.6` = FFmpeg 5.1.4) and the local `ffmpeg` 9.0.2 CLI by the agent on 2026-09-29. The browser runs used Chrome DevTools MCP on the dev server at `:3000`.

## Fixture

`.scratch/frame-loss-evidence/` (untracked):

- `e0..e4.png` — five 320×240 stills, `ffmpeg -f lavfi -i color=…`, one distinct colour each: red, lime, blue, yellow, magenta. Every tool that was already available behaves identically here; the colour is what exposes *which* image is lost and in what order.
- `ffmpeg-core.js` / `ffmpeg-core.wasm` — downloaded from the CDN URL the app itself uses, so the harness measures the same 32,129,114-byte artifact the browser runs (FFmpeg 5.1.4). This is the only way to reproduce the defect locally: the CLI is 9.0.2 and does not drop the frame.
- `run-core.mjs` — loads that core in Node and executes an arbitrary argv against the fixtures.
- `verify-with-core.mjs`, `verify-cross-version.mjs` — build the command with the **real** `apps/web/src/utils/image-slideshow.ts` helper (Node's `--experimental-strip-types`), run it on the core and on the CLI, and compare frame count, per-frame delays, start times and centre-pixel colours.

## Criteria

| # | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| A-1 | N images produce N frames | Core, 20 cases (`n = 1,2,3,5` × `d = 0.1,0.5,1,3,10`): `frames = n` in every case. Reproduced defect for contrast: the same 3 images with the pre-fix list (`file`+`duration` only) gave **2 frames / 1.000 s** | PASS |
| A-2 | Every image appears, in the selected order | Core, centre-pixel colours per frame: 3 images → `252,0,0` / `0,252,0` / `0,0,255` (red, green, blue); 5 images → red, green, blue, yellow, magenta. Pre-fix, the 3-image GIF was red, green — the blue third image was gone, i.e. real data loss | PASS |
| A-3 | Each frame is held for exactly the labelled duration | Core, all 20 cases with `n ≥ 2`: per-frame delay `= d` and total `= n × d` (`n=5, d=3` → 5 × 3.000 s = 15.000 s; `n=3, d=0.1` → 3 × 0.100 s = 0.300 s). Unrounded rate preserved: `d=3` emits `fps=0.333…`, which the pre-phase-03 rounding would have turned into `fps=0`, an encoder error | PASS |
| A-4 | The app's core and the CLI agree, so the fix is not core-version-specific | `verify-cross-version.mjs`, 20 cases: identical frame count, per-frame delays, total duration and colours on the core (5.1.4) and the CLI (9.0.2). The duplicate entry alone over-produced on the CLI (**4 frames**, blue twice, 2.000 s) until `-frames:v n` was added; the cap makes both implementations exact | PASS |
| A-5 | The same holds in a real browser, through the real control | Dev `:3000` `/images-to-gif`, `e0/e1/e2.png` injected into the live `<input type="file">`, 「帧时长（秒）」 set through the component: `d=0.5` → **3 frames, delays `[0.5,0.5,0.5]`, total 1.500 s**; `d=1` → 3 frames `[1,1,1]`; `d=3` → 3 frames `[3,3,3]`; colours red, green, blue in that order. Decoded with `ImageDecoder`, read from `setupState.resultData` | PASS |
| A-6 | Other image counts behave, including the one that previously failed outright | Browser: 2 images, `d=2` → 2 frames, delays `[2,2]`, red then blue. 1 image, `d=3` → **1 frame** (1,530 B). Pre-fix, one image produced a **0-byte** file in the same browser (`ffmpeg` logged `Output file is empty, nothing was encoded`), so the old code's single-image path was broken as well — see the note below | PASS |
| A-7 | The pre-fix defect really is the one described | Browser, dev `:3000`, the previous command shape (`file`+`duration` list, no `-frames:v`) executed against the already-loaded shared core with the same three fixtures: `exit 0`, **2 frames**, delays `[0.5,0.5]`, centre colours red, green — blue missing. Core log for the same run: `3 frames decoded` → `Output stream #0:0 (video): 2 frames encoded`, `EOF is at pts 2`, `Dropping frame with pts 2` | PASS |
| A-8 | No regression in the phase-03 contracts | `d` handling unchanged (`fps = 1 / frameDuration`, no rounding — pinned by `image-slideshow.test.ts`); the speed tools, the loader and the download path are untouched (`git diff --stat`: 3 files, no locale or option changes) | PASS |

## Known limitation recorded, not fixed

A **one-frame** GIF carries the GIF encoder's own default hold instead of `d`: the core reports `0.100 s` to `ffprobe` and Chrome's `ImageDecoder` reports `0`, while the CLI 9.0.2 writes the requested `d`. This is not reachable by any command shape: a bare `-i e0.png` → gif, `-framerate 1/d -i e0.png`, and the concat forms with `-t`, `-frames:v` or neither all produce the same 0.1 s on the core, because the delay is derived from the *delta to the next frame* and a single-frame stream has none. FFmpeg 5.1.4's `gif` encoder exposes no `delay` option to set it explicitly (`ffmpeg -h encoder=gif` lists only `gifflags`, `gifimage`, `global_palette`). The visual result is unaffected — a one-frame GIF never advances in any viewer, so the still is displayed continuously — and the frame count, which is what the reported defect was about, is exactly 1. Recorded here rather than chased further.
