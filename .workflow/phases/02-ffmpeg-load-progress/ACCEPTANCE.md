# Acceptance verification

Requirement source: user bug report 2026-09-28 — 「修复音频和视频工具"加载FFmpeg"时进度条一直卡在0%的问题」. Verified by Chrome DevTools MCP against a real browser; manual checks performed by the agent on 2026-09-28.

| # | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| A-1 | Clicking 「加载 FFmpeg」 in a media tool advances the progress bar through intermediate values instead of staying at 0% | `/audio-converter` (dev, port 3399): sampled DOM values `0% → 30% → 63% → 100%` across a single load | PASS |
| A-2 | Load finishes and the tool becomes usable (button disappears, `转换` enabled) rather than spinning forever | Same run: load button gone after the bar hit 100%; `转换` button enabled | PASS |
| A-3 | Both audio and video tools are covered | `/video-rotate` (dev): load completed (`加载 FFmpeg` button gone, no error) — same shared composable | PASS |
| A-4 | The loaded core actually executes (tool is not just "loaded") | `/audio-converter` dev: `tone.wav` → alert 「转换完成！文件已下载。」 + `tone.mp3` blob download. `/video-rotate` dev: `clip.webm` → download button appeared → `rotated.mp4`. `/audio-converter` prod build (port 3400): `tone.wav` → `tone.mp3` | PASS |
| A-5 | A failed load tells the user why instead of silently returning to idle | `fetch` patched to reject `ffmpeg-core` requests: alert `FFmpeg core download failed — https://cdn.jsdelivr.net/…: Failed to fetch; https://unpkg.com/…: Failed to fetch`; button back to idle (retryable); no unhandled rejection in the console | PASS |
| A-6 | No regression in the tools' conversion behaviour | Same conversions as A-4; `pnpm test` 145 web + 52 server pass; `pnpm build` passes | PASS |

## Notes

- Progress-movement evidence (A-1) is asserted twice: in the browser as above, and by unit tests that feed a synthetic chunked stream and require intermediate values strictly between 0 and 1.
- Cold-cache progress timing (a first-ever visit downloading 9.3 MB) was not captured — browser cache could not be cleared via the available MCP tooling. Not considered blocking: the code path is identical to the warm-cache run, only slower.
