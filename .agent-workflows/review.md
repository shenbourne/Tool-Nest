# Review

Compare the diff and observed behavior with the requirements and plan. Inspect correctness, failure handling, security, accessibility where relevant, maintainability, and unintended changes. Check whether changed code follows the project's existing naming, error-handling, and implementation patterns; flag newly introduced duplication or a crossed module boundary. Read relevant conventions and ADRs before judging consistency.

When the change spans modules, adds an abstraction, changes dependency direction, or exposes a recurring structural problem, load `codebase-health.md` for a focused assessment. Fix substantive in-scope findings, rerun affected checks, and record residual issues in the phase `VERIFICATION.md`. Review is distinct from running automated checks.
