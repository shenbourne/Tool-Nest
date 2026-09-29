# Project state

- Current milestone: ToolNest unified developer-tools application
- Current phase: 02 — FFmpeg load progress stuck at 0% (`.workflow/phases/02-ffmpeg-load-progress/`) — IMPLEMENTED, verified, merge pending authorization
- Status: branch `fix/ffmpeg-load-progress` (from `master` at `158fbbb`) holds three code commits: `b28c55c` (Vite worker fix), `fd0ca5a` (progress + error + CDN fallback), `0b206b4` (load-failure alert in 19 tools). Acceptance PASS, engineering checks PASS except the pre-existing lint baseline
- Completed: reported bug fixed at three layers — (a) `@ffmpeg/ffmpeg` excluded from Vite dep pre-bundling so the library's worker URL resolves instead of 404ing (this was the infinite hang); (b) core download progress is now derived from a streaming `fetch` reader, with jsdelivr tried before unpkg and `loadError` surfaced instead of an unhandled rejection; (c) the 19 media tools render the load error
- In progress: nothing
- Blockers: none technical. `pnpm lint` still fails on the pre-existing baseline (unchanged by this work; the 19 touched templates were diff-linted against `HEAD` and show identical error counts)
- Last verification: 2026-09-28 — `pnpm test` PASS (145 web + 52 server), `pnpm type-check` PASS, `pnpm build` PASS, differential lint on changed files clean. Browser evidence (Chrome DevTools MCP, dev `:3399` and built app via `vite preview :3400`): progress 0→30→63→100%, `tone.wav`→`tone.mp3` and `clip.webm`→`rotated.mp4` conversions succeed, forced CDN failure shows the error alert and stays retryable. Details in `ACCEPTANCE.md` / `VERIFICATION.md`
- Next action: get the user's decision on merging `fix/ffmpeg-load-progress` into `master`. Optional follow-ups: remove the now-unused `@ffmpeg/util` dependency; decide whether to bundle `@ffmpeg/core` locally instead of relying on CDNs
- Updated: 2026-09-28

Keep this short and factual so another agent can resume without chat history.

## Notes for the next agent

- Do not trust a green `pnpm lint`; it fails on a pre-existing baseline. Use per-file differential lint (`eslint --stdin --stdin-filename` against `git show HEAD:<path>`) for changed files.
- The `.qoder/hooks/commit-lint.mjs` hook validates **every** `-m` argument as a commit subject, so multi-line commit bodies (`-m subject -m body` or heredoc) are rejected. Use a single-line Conventional Commit subject; put detail in the phase docs.
- `pnpm build` and the dev server regenerate `apps/web/src/components.d.ts` (unplugin-vue-components). Revert unrelated regeneration noise before committing.
- `unpkg.com` is unreachable from this machine's browser (~35 s then `ERR_CONNECTION_CLOSED`/`Failed to fetch`); `cdn.jsdelivr.net` works. Any FFmpeg-core URL that points at unpkg will hang or fail here.
- `@ffmpeg/ffmpeg` must stay out of Vite's `optimizeDeps`; pre-bundling rewrites its worker URL to a non-existent `node_modules/.vite/deps/worker.js` and `ffmpeg.load()` then never settles.
- `vue-tsc` and `vitest` do not catch malformed SFC structure; only `vite build` does.
- Other sessions' dev servers were left running on ports 3000–3002/3005; the servers started for this phase (`:3399` dev, `:3400` preview) were stopped.
