# Agent Development Protocol

This file is the entry point for any coding agent working in this repository. Follow the user's current instructions over this template. Do not silently skip a required step; record why a step does not apply.

## Responsibilities

- Project layer (`.workflow/`): objectives, requirements, phases, acceptance, and state.
- Engineering layer (`.agent-workflows/`): plan, implementation, tests, debugging, review, and technical verification.
- Specialists: use clarification, ADR, or deep diagnosis only when the issue warrants it. They do not create a second roadmap.
- Harness layer (`.harness/`): periodically examine evidence of workflow failures and propose minimal improvements. Do not run an audit for every task.

## Session start

Read `.workflow/STATE.md`, project and requirements summaries, the active phase's `CONTEXT.md` and `ACCEPTANCE.md`, and relevant ADRs. Inspect `git status --short --branch`, current branch, and recent commits. Before development, use `.agent-workflows/remote-sync.md` to fetch and compare the configured remote branch and base branch. Start from an up-to-date base; reconcile divergence without discarding existing work. Respect uncommitted changes. Load `.agent-workflows/session-start.md` and only the other modules needed for the task.

## Routing

- New project or changed scope: update project requirements and roadmap with the user-facing decision captured.
- Ambiguous requirement: `.agent-workflows/clarify.md`.
- Important technical decision: `.agent-workflows/architecture.md` and an ADR.
- Implementation: `.agent-workflows/planning.md`, then `.agent-workflows/tdd.md` when practical.
- Bug: `.agent-workflows/debugging.md`.
- Before coding and before pushing completed work: `.agent-workflows/remote-sync.md`.
- Cross-module changes, new abstractions, dependency changes, or recurring structural problems: `.agent-workflows/codebase-health.md` after the ordinary review. Record why it was invoked; it is not a gate for every task.
- Completion: `.agent-workflows/review.md`, `.agent-workflows/verification.md`, `.agent-workflows/session-end.md`.

## Git policy

For non-trivial work, one phase uses one isolated `feature/phase-<number>-<slug>` branch or worktree, created from the current remote base. Do not implement on `main`/`master`. Make each completed task a reviewable atomic commit when possible; never commit secrets or unrelated user changes. At the end of development, fetch and compare again, integrate remote updates safely, rerun affected checks, and push the feature branch to its configured remote. Verify the push and record the remote branch. Never force-push, discard edits, or merge to main without the user's authorization. Pushing the feature branch does not authorize merging it. A pending merge is a valid resumable state. If no remote or credentials are available, record the blocker rather than claiming synchronization.

## Completion gate

After every task, perform browser visual verification before reporting completion: open the running application, inspect the relevant pages and interaction results, and check layout, alignment, overflow, and responsive behavior at desktop and mobile viewport sizes. Save screenshots and record the checked pages, viewport sizes, results, and evidence paths in `VERIFICATION.md`. Automated tests and source inspection do not replace browser visual verification. If the browser or application is unavailable, record the blocker and report visual verification as `NOT RUN`; do not claim it passed.

Keep an implementation plan in the active phase. Review against the phase scope. Run applicable tests, lint, typecheck, build, and integration checks using `scripts/verify` or equivalent. Record actual commands, results, and limitations in `VERIFICATION.md`. Check each acceptance criterion with observable evidence in `ACCEPTANCE.md`. Update `STATE.md` with next action and branch. Report incomplete checks honestly. The phase can be marked complete after both technical and acceptance verification pass; merge remains a separate authorized action.

## Context and improvement

Load current phase and relevant ADRs, not every historical document. Investigate repeated workflow failures using `.harness/POLICY.md`; record evidence in `.harness/FINDINGS.md` and implement agreed changes as independent reviewed work. Agent instructions never override user instructions or applicable host policy.
