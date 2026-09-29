# Phase context

- Phase: 04 — `images-to-gif` drops the last image
- Goal: a GIF built from N images contains N frames, in the order the files were selected, with every frame held for exactly the 「帧时长（秒）」 the control says.
- Source: found but deliberately not fixed in phase 03 (`.workflow/phases/03-speed-factor-inversion/ACCEPTANCE.md`, "Found but not fixed"); carried in `STATE.md` follow-ups. User instruction 2026-09-29: 「修复该问题」.
- Constraints:
  - The app runs `ffmpeg-core` 0.12.6 from a CDN, which is FFmpeg **5.1.4**; the local CLI is **9.0.2** and does not reproduce the defect. A fix must be correct on both, because the two are not interchangeable and a core upgrade is already on the backlog.
  - The fix must not regress the phase-03 contract: `fps = 1 / frameDuration`, no rounding.
  - Option controls and labels are unchanged; this is output correctness only.
  - `apps/web/vitest.config.ts` runs `environment: 'node'` over `src/**/*.test.ts` and cannot execute `.vue`, so any logic worth a regression test belongs in a plain module (phase-03 precedent, `src/utils/ffmpeg-speed.ts`).

## Root cause

Verified by running the app's own core artifact (`@ffmpeg/core@0.12.6`, FFmpeg 5.1.4) in Node against three distinct PNGs — see `.scratch/frame-loss-evidence/`.

The concat list is correct and the demuxer reads it correctly. The core reports the input as `Duration: 00:00:01.50` for `d = 0.5` and decodes all three images:

```
file:0 -> pts:0  pts_time:0     (a.png)
file:1 -> pts:13 pts_time:0.52  (b.png)
file:2 -> pts:25 pts_time:1     (c.png)
3 packets read (2398 bytes); 3 frames decoded
```

The loss happens one stage later, in the `fps` filter. Its end-of-stream boundary is derived from the **last frame's own timestamp plus that frame's duration** — and the concat demuxer's terminal frame carries the image2 demuxer's default `1/25 s` frame duration, not the `duration` directive (which only extended the container duration to 1.50 s). For `fps=2` the boundary rounds onto the very output slot that carries the final image:

```
Read frame with in pts 25, out pts 2
Writing frame with pts 1 to pts 1
EOF is at pts 2
Dropping frame with pts 2          <- c.png, the third image
Output stream #0:0 (video): 2 frames encoded
```

So the trailing image is silently discarded and the output is `n - 1` frames totalling `(n - 1) × d`. Measured on the core for three images: baseline GIF = 2 frames / 1.000 s, centre colours red, green — blue never appears. FFmpeg 9.0.2 changed this: the same list and command yield 3 frames / 1.500 s, which is why the phase-03 CLI measurements reported "3 frames" and the phase-03 note attributed the loss to the demuxer. That attribution was wrong; the container duration is read correctly. The earlier note also guessed this was "the app's core ignoring the concat list's last duration" — the evidence here supersedes that guess.

## Decisions already made

- Keep the concat demuxer and the `fps` filter; the defect is the terminal frame, not the pipeline.
- The last image entry is **repeated** in the concat list so the final real image has a successor. Its duration then lands on a frame, and the frame the filter discards at the boundary is the harmless duplicate. Measured on the core: 3 frames / 1.500 s, centre colours red, green, blue.
- The output is additionally capped with `-frames:v <imageCount>`, because the duplicate entry over-produces on cores that do honour the terminal duration (measured on CLI 9.0.2: 4 frames, blue twice). With the cap, core and CLI agree exactly: 3 frames / 1.500 s, red, green, blue.
- The list and argument construction moves into a pure module so this version-dependent fix has a regression test (the CLI cannot act as the oracle).

## Boundary

- In scope: `apps/web/src/tools/images-to-gif/ImagesToGif.vue`, a new pure module under `apps/web/src/utils/`, its unit test, and environment entries needed to run the app (dev server fixture only).
- Out of scope: bundling `@ffmpeg/core` locally, dropping the unused `@ffmpeg/util` dependency, the `images-to-gif` `NInputNumber` accepting `null` when cleared, the phase-03 speed convention, the `dispose`/progress/cancel findings in `.scratch/tool-interaction-audit/`, and the same-shaped concat use in `video-merge` / `audio-merge` (their inputs are self-describing media, not stills, and were not reported).
