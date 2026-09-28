# Engineering verification

- Commit/branch: [SHA and branch]
- Date: [YYYY-MM-DD]
- Review: [findings, fixes, residual issues]
- Codebase health: [not triggered / trigger, files inspected, findings and disposition]

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Tests | `pnpm test` | NOT RUN | [reason or summary] |
| Lint | `pnpm lint` | NOT RUN | [reason or summary] |
| Typecheck | `pnpm type-check` | NOT RUN | [reason or summary] |
| Build | `pnpm build` | NOT RUN | [reason or summary] |
| Integration | [command] | NOT RUN | [reason or summary] |

Record failures, skipped checks, environment limitations, and reruns. Acceptance evidence belongs in `ACCEPTANCE.md`.
