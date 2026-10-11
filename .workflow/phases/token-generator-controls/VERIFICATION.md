# Token generator controls

Scope: four centered character switches in one row, integer length input synchronized with slider (1–512), full-width primary Generate button matching PDF compression.

Plan and review: reuse existing Naive UI controls and theme; update only TokenGenerator.vue. No ADR, TDD or health review needed for this reversible single-tool UI change.

Verification: scoped eslint, vue-tsc --noEmit and whitespace checks PASS in original shared workspace. Browser visual checks NOT RUN. User supplied screenshots and requested final centered spacing. Source reviewed against all requested controls.

Integration: isolated branch from refreshed private/master 742c5e3; token source base identical to original feature branch. Preserve unrelated dirty changes in both existing workspaces. User authorized local master merge; remote master publication not requested.
