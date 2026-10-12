# Requirements

This file indexes durable requirements. Detailed acceptance remains in `DEVELOPMENT_PLAN.md` until a requirement is assigned to a numbered phase.

| ID | Requirement | Priority | Source | Phase | Status |
| --- | --- | --- | --- | --- | --- |
| R-001 | Account for every source tool as migrated, merged, or explicitly excluded | Must | `DEVELOPMENT_PLAN.md` | Unassigned | In progress |
| R-002 | Provide unified routing, search, categories, tags, favorites, recents, themes, and bilingual UI | Must | `DEVELOPMENT_PLAN.md` | Unassigned | In progress |
| R-003 | Persist versioned YAML state safely with backup and recovery | Must | `DEVELOPMENT_PLAN.md` | Unassigned | In progress |
| R-004 | Enforce the documented API, report-sharing, command-execution, and network security boundaries | Must | `DEVELOPMENT_PLAN.md` | Unassigned | In progress |
| R-005 | Deliver a reproducible single-image Docker deployment with complete licenses and notices | Must | `DEVELOPMENT_PLAN.md` | Unassigned | In progress |

Keep requirements observable. When scope changes, record the decision and update the affected phase acceptance criteria.

| R-006 | Unified live calculator with keypad, equals history and stable inline errors | Must | User 2026-10-10 | 23 | Verified on feature branch |

R-029: Docker Compose to 1Panel README supports local Markdown/text and HTTP(S) file URL imports, retaining editing/reset and ZIP output (phase29).

R-029 extension: import a single-app ZIP and create a distinct new version; inherit editable app metadata, retain old versions and supporting assets.

Phase34 user decision (2026-10-12): consolidate CSV transpose, JSON formatting/viewing, line/list deduplication and password/token generation under R-001/R-002; retain old links/search/favorites/recents. Remove calculator residue; calculator was already unified in master. Acceptance: phases/34-tool-dedup/ACCEPTANCE.md.

Phase35 user decision2026-10-12: unify list sorting/wrapping/text joining under List Converter (R-001/R-002). Single page without tabs/presets; Auto detect input and Trim ON by default; manual sort/wrap/join controls and legacy links/preferences retained. See phases/35-list-consolidation/ACCEPTANCE.md.

2026-10-12 latest user scope: remove List Duplicate completely (page, catalog, translations and text-panel contract); inventory marked excluded. Remaining eight list tools keep shared Auto input/Same output controls. Earlier nine-tool checks describe superseded scope.

R-002 phase36 clarification (2026-10-12): random generators automatically produce results on open and parameter changes; generate actions request fresh results.
| R-037 | Classify tools into 13 object/domain categories; retain localized operation filters and legacy category navigation | Must | User approval 2026-10-12 | 37 | Complete; feature published, merge pending |

R-040: All byte conversion units accept linked input (phase40, user request 2026-10-12).
