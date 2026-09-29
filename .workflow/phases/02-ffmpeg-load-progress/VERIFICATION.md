# Engineering verification

- Branch: `fix/ffmpeg-load-progress` (from `master`), commits: see `STATE.md` after commit
- Date: 2026-09-28
- Review: self-review of the diff — `git diff --numstat` shows `2 1` per tool template (no whole-file rewrites, no CRLF churn); core composable diff read line by line. No independent reviewer was dispatched.
- Codebase health: not triggered (single-module defect fix, no new abstraction; the shared loader already existed).

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Tests | `pnpm test` | PASS | web 145 passed (26 files), server 52 passed (8 files). `useFFmpeg.test.ts` covers intermediate progress, source order, fallback, exhaustion, retry. |
| Lint | `npx eslint src/composables/useFFmpeg.ts src/composables/__tests__/useFFmpeg.test.ts vite.config.ts` | PASS | 0 problems. |
| Lint (templates) | per-file differential vs `HEAD` content via `eslint --stdin` | PASS (no new failures) | Error count identical before/after for all 19 templates (4–8 pre-existing errors per file). Repo-wide `pnpm lint` still fails on the pre-existing baseline; not re-measured as a fixed target. |
| Typecheck | `pnpm type-check` | PASS | `packages/shared`, `apps/server`, `apps/web` all done. |
| Build | `pnpm build` | PASS | `✓ built in 41.03s`; worker emitted as `dist/assets/worker-BAOIWoxA.js`. |
| Integration (dev) | Chrome DevTools MCP against `vite --port 3399` | PASS | See `ACCEPTANCE.md` — progress 0→30→63→100%, load completes, wav→mp3 and webm→mp4 conversions succeed. |
| Integration (prod build) | `vite preview --port 3400` on the build above | PASS | Load completes in 706 ms; wav→mp3 conversion succeeds (`转换完成！文件已下载。` + `tone.mp3` blob download). |
| Integration (failure path) | in-page `fetch` patched to reject `ffmpeg-core` requests | PASS | Alert shows both sources failing; load button returns to idle and can be retried; no hang, no unhandled rejection. |

## Limitations

- Intermediate progress values were observed from a warm HTTP cache (0→30→63→100% within 0.34 s). The browser cache could not be cleared with the available tooling, so a cold-cache visual run was not captured; the incremental behaviour is asserted by unit tests against a synthetic chunked stream.
- The video conversion used a `MediaRecorder`-generated `video/webm` (46 KB, 63 frames). No real-world MP4 fixture was exercised.
- `@ffmpeg/util` is now unused by source but still declared in `apps/web/package.json`; removing it is a dependency change left out of scope.
- Pre-existing failures elsewhere in the repository were not touched and are not re-verified here.
