# Plan

1. Audit unlabeled numeric controls in image, GIF, text, CSV and number tools.
2. Add native labels associated with existing input IDs and a wrapping horizontal style; reuse locale keys where precise, add bilingual units and semantics where needed.
3. Review diff, run scoped lint, web tests, typecheck and production build.
4. Record acceptance and publication status.

TDD skipped: reversible presentation-only changes; an assertion mirroring markup adds little value. No new runtime abstraction, dependency or architecture decision. Shared styling warrants a focused codebase-health review.
