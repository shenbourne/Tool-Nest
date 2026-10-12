# Verification
2026-10-12, isolated feature/phase-38-number-to-words.
- RED: pnpm test src/tools/number-to-words/number-to-words.test.ts — exit1, 11 failed/11 passed before fix.
- GREEN: same regression suite — 22/22 passed in shared preview; pnpm --filter @toolnest/web type-check — exit0.
- pnpm test (isolated frontend): initial458 pass/1 registry failure due to remote taxonomy mismatch during shared dependency reuse. Refetched and integrated private/master766bfd3; rerun464/464 PASS, exit0. No residual test failure.
- pnpm exec eslint src/tools/number-to-words/NumberToWords.vue src/tools/number-to-words/number-to-words.test.ts — exit0.
- pnpm build — initial exit0 including vue-tsc; post-integration rerun exit0, vue-tsc and Vite build PASS (45.76s); existing dependency/chunk-size warnings retained.
- Review: focused regex + safe-integer validation; existing description keys expanded in both languages. No new dependencies or architecture; codebase-health and harness audit not applicable. Safe bounds prevent numeric precision corruption. No server path changed; server-specific checks not applicable.
- Used equivalent pnpm checks because scripts/verify is a Bash wrapper and this host uses PowerShell; no full repository autofix lint run to avoid modifying unrelated code. Browser visuals NOT RUN.
- Shared preview backups: .scratch/phase38-primary-backup; only component, regression test and numberToWords descriptions mirrored.
