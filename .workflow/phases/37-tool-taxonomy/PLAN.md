# Plan

1. Replace mixed categories with 13 domain/object categories; reassign metadata and preserve operation tags.
2. Localize functional tags and hide runtime implementation tags from filters/cards.
3. Keep deprecated category links usable: operation groups become tag filters; merged categories redirect. Preserve tool URLs/preferences.
4. Update shared category definitions, sidebar, bilingual labels, inventory and ADR.
5. Verify registry coverage, search/tag behavior, legacy routes, preferences, tests, typecheck, build and differential lint; inspect browser UI.
6. Record acceptance/evidence, refresh remote, commit and push feature branch. Main merge requires separate authorization.

Risk: concurrent sessions and dirty shared source; all changes isolated. Tests target cross-module registry/search/navigation contracts rather than every label.
