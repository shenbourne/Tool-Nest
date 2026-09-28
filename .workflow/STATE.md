# Project state

- Current milestone: ToolNest unified developer-tools application
- Current phase: 01 — Tool file import controls (`.workflow/phases/01-tool-file-upload/`) — COMPLETE
- Status: MERGED. Acceptance PASS. Engineering checks: tests/typecheck/build PASS; only the pre-existing lint baseline fails
- Branch/worktree: phase 01 was `fix/tool-file-upload-control` (from `e277797`), merged at `88969cd`; the `GenericCalculator` build fix was `fix/generic-calculator-build`, merged at `5e4db5d`. Both branches retained
- Completed: (a) 19 tool components migrated off a bare `<NUpload>` to a new shared `ToolFileUpload`, all 10 acceptance criteria PASS with browser evidence; (b) `GenericCalculator.vue`'s duplicated `</script>` removed, which unblocked `pnpm build` repo-wide and also fixed `/generic-calculator`, which had never compiled
- In progress: nothing
- Blockers: `pnpm lint` still fails on 232 pre-existing errors, unchanged by either change. `pnpm build` now passes
- Last verification: 2026-09-28 — `pnpm test` PASS (140 web + 52 server), `pnpm type-check` PASS, `pnpm build` PASS (`✓ built in 26.24s`), `pnpm lint` FAIL (baseline); Chrome DevTools MCP evidence in `ACCEPTANCE.md`. Both merges verified to leave `apps/` and `packages/` byte-identical to the commit that was built and tested
- Next action: pick up follow-ups 2–4 in `.workflow/phases/01-tool-file-upload/VERIFICATION.md`. Follow-up 3 (re-audit `.scratch/tool-interaction-audit/`, whose findings all assumed a file control that never rendered) is the highest-value one
- Updated: 2026-09-28

Keep this short and factual so another agent can resume without chat history.

## Notes for the next agent

- `node_modules` was incomplete at session start (`esbuild` missing); `pnpm install` fixed it in 10s. If `pnpm dev` fails with `ERR_MODULE_NOT_FOUND`, run `pnpm install` first.
- `AGENTS.md` has uncommitted user edits in the working tree (a rewrite, 19 insertions / 52 deletions against `master`). Leave them alone. Because of that edit, `git checkout master` in the main worktree is refused — use `git worktree add` if you need `master` checked out, or get the WIP committed first.
- `AGENTS.md` on `master` is *not* the rewritten version; the rewrite exists only in the working tree.
- `.scratch/tool-interaction-audit/findings.md` assumes file uploads work. That was false until phase 01, so every finding in it is downstream of a control that never rendered. Re-audit before acting on it.
- `vue-tsc` and `vitest` do not catch malformed SFC structure; only `vite build` does. Do not treat a green type-check as proof a component compiles.
- `dev:web` serves on port 3000 by default but silently walks to 3001+ when the port is taken, so several dev servers may be running. Check the printed URL and stop the ones you start; other sessions' servers on 3000–3002/3005 were left alone.
