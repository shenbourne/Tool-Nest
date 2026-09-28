# Project state

- Current milestone: ToolNest unified developer-tools application
- Current phase: 01 — Tool file import controls (`.workflow/phases/01-tool-file-upload/`)
- Status: MERGED. Acceptance PASS; engineering gate still red on pre-existing lint/build failures unrelated to phase 01
- Branch/worktree: phase 01 was `fix/tool-file-upload-control` (from `e277797`), merged into `master` at `88969cd`; branch retained
- Completed: Phase 01 implementation — 19 tool components migrated off a bare `<NUpload>` to a new shared `ToolFileUpload`; 22 feature commits plus the merge; all 10 acceptance criteria PASS with browser evidence
- In progress: nothing. The phase's own work is done; the two follow-ups below are untouched
- Blockers: `pnpm lint` (232 pre-existing errors) and `pnpm build` (`GenericCalculator.vue:28` duplicated `</script>`, present on `master`) both fail independently of phase 01
- Last verification: 2026-09-28 — `pnpm test` PASS (140 web + 52 server), `pnpm type-check` PASS, `pnpm lint` FAIL (baseline), `pnpm build` FAIL (baseline); Chrome DevTools MCP evidence recorded in `ACCEPTANCE.md`. Verified on the branch tip; the merge added only 5 protocol docs and changed no application code (`git diff ec04921 88969cd -- apps packages` is empty)
- Next action: pick up follow-ups 1–3 under "Follow-ups" in `.workflow/phases/01-tool-file-upload/VERIFICATION.md`; follow-up 1 (delete the duplicated `</script>` in `GenericCalculator.vue`) is the cheapest way to make `pnpm build` meaningful again
- Updated: 2026-09-28

Keep this short and factual so another agent can resume without chat history.

## Notes for the next agent

- `node_modules` was incomplete at session start (`esbuild` missing); `pnpm install` fixed it in 10s. If `pnpm dev` fails with `ERR_MODULE_NOT_FOUND`, run `pnpm install` first.
- `AGENTS.md` has uncommitted user edits in the working tree (a rewrite, 19 insertions / 52 deletions against `master`). Leave them alone. Because of that edit, `git checkout master` in the main worktree is refused — use `git worktree add` if you need `master` checked out, or resolve the WIP first.
- `AGENTS.md` on `master` is *not* the rewritten version; the rewrite exists only in the working tree.
- `.scratch/tool-interaction-audit/findings.md` assumes file uploads work. That was false until phase 01, so every finding in it is downstream of a control that never rendered. Re-audit before acting on it.
- `dev:web` serves on port 3000 by default but will silently walk to 3001+ if that port is taken; check the printed URL. Stopping stray dev servers matters — see `pnpm-dev-server-vite`.
