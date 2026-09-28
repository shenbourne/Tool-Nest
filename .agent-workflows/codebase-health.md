# Codebase health review

## When to use

Run a focused review when a phase changes multiple modules, introduces a shared abstraction, changes dependency direction, or reveals repeated structural problems. The ordinary `review.md` covers lightweight consistency for every substantial change. Do not run a full repository audit for each task.

## Procedure

1. Read the current architecture, relevant ADRs, nearby modules, tests, and project conventions. State which part of the codebase is in scope and why.
2. Trace the changed behavior through affected module boundaries and dependencies. Check naming and error-handling consistency, duplicate logic or parallel implementations, responsibility placement, dependency cycles, excessive coupling, oversized modules, and dead code where relevant.
3. Ground each finding in specific files and observed behavior or dependency evidence. Classify it as a regression introduced by this phase, an existing issue, or an uncertain hypothesis. State impact, priority, and a proportionate fix.
4. Fix in-scope regressions as part of the phase, then rerun affected checks. Record pre-existing or broader refactors as follow-up work; do not silently expand the phase or redesign the project around generic best practices.
5. Record trigger, scope, findings, fixes or follow-ups, and limitations in the phase's `VERIFICATION.md`. If there are no findings, say what was inspected. Acceptance verification remains separate.

This review judges the codebase and its architecture. `.harness/` judges the agent workflow and its recurring failures; it does not substitute for application code review.
