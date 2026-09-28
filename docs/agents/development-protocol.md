# Agent Development Protocol

This repository uses a lightweight, file-based protocol for coding agents. `AGENTS.md` is the routing entry point.

## Structure

- `.workflow/`: project summary, durable requirements, roadmap, resumable state, and phase artifacts.
- `.agent-workflows/`: focused procedures loaded only when their task branch applies.
- `CONTEXT.md` and `docs/adr/`: domain vocabulary and architectural decisions.
- `.harness/`: evidence and policy for bounded improvements to the agent workflow.
- `scripts/verify`: the project verification runner.

## Starting a phase

1. Copy `.workflow/phases/_template/` to `.workflow/phases/<NN>-<slug>/`.
2. Map requirement IDs into the phase context and acceptance criteria.
3. Add the phase outcome to `.workflow/ROADMAP.md` and point `.workflow/STATE.md` to it.
4. Create the isolated feature branch or worktree required by `AGENTS.md`.
5. Keep the plan, verification evidence, acceptance status, and resumable state current as work proceeds.

## Completion

A phase is complete after review, applicable engineering checks, and every required acceptance criterion pass with recorded evidence. The repository Git policy governs commits and merging. `SKIP` and `NOT RUN` never count as `PASS`.
