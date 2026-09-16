# ToolNest unified web application

Status: ready-for-agent

## Problem Statement

The repository contains four independent toolbox applications with different frameworks, navigation models, metadata, translations, deployment methods, and runtime requirements. Users must know which source project contains a tool, switch between inconsistent interfaces, and choose between overlapping implementations. There is no unified search, functional taxonomy, persistence model, deployment artifact, or safe way to expose a temporary read-only diagnostic report.

## Solution

Build ToolNest as one cohesive, self-hosted web application in the repository root. Migrate every useful, unique capability from the four read-only reference projects, consolidate overlapping tools by task, and expose each retained tool through a shared catalog and interface. Use a Vue 3 and TypeScript frontend with a Node.js and TypeScript API, package both into one same-origin Docker image, and persist single-user state and expiring reports in a configured YAML file.

ToolNest will center discovery on global search while also supporting functional categories, tags, favorites, recent usage, and an all-tools view. It will fully support Simplified Chinese and English, use English as the translation fallback, and provide responsive light and dark themes. Client-capable file processing remains local to the browser; network and privileged operations use constrained server APIs. The application is intended for a local machine or trusted LAN, with only expiring, random-ID, read-only reports eligible for selective public exposure.

## User Stories

1. As a user, I want one application for all retained tools, so that I do not need to switch among four projects.
2. As a user, I want every useful unique source capability accounted for, so that consolidation does not silently remove functionality.
3. As a user, I want duplicate tools merged into one entry, so that I do not have to compare project origins.
4. As a user, I want distinct workflows for the same core task presented as modes, so that useful variations remain discoverable.
5. As a user, I want tools with different core tasks kept separate, so that a merged tool does not become confusing.
6. As a user, I want global search on the home page, so that I can open a known tool quickly.
7. As a user, I want search to match names, aliases, descriptions, categories, and tags, so that I can find a tool using familiar terms.
8. As a user, I want each tool assigned one functional category, so that the catalog has a predictable primary structure.
9. As a user, I want each tool to have multiple functional tags, so that cross-cutting capabilities remain discoverable.
10. As a user, I want categories and tags based on function rather than source project, so that implementation history does not shape navigation.
11. As a user, I want an all-tools page, so that I can browse the complete catalog.
12. As a user, I want to favorite tools, so that frequently used tools are easy to reach.
13. As a user, I want to see recently used tools, so that I can resume recurring work quickly.
14. As a user, I want favorites and recent usage to survive restarts, so that the application remembers my workflow.
15. As a user, I want each tool to have a stable direct route, so that I can bookmark and share local links.
16. As a user, I want a responsive interface, so that ToolNest works on desktop and mobile screens.
17. As a user, I want light and dark themes, so that the interface fits my environment.
18. As a Chinese-speaking user, I want a complete Simplified Chinese interface, so that I can use every supported feature consistently.
19. As an English-speaking user, I want a complete English interface, so that I can use every supported feature consistently.
20. As a user, I want missing translations to fall back to English, so that raw translation keys never appear.
21. As a user, I want heavy tools loaded only when opened, so that the initial application loads quickly.
22. As a user, I want long-running operations to report progress, so that I know the application is still working.
23. As a user, I want to cancel long-running operations, so that I can recover from an incorrect or expensive request.
24. As a user, I want clear file-size and execution limits, so that failures are predictable.
25. As a privacy-conscious user, I want client-capable file operations performed in my browser, so that my files do not leave my device unnecessarily.
26. As a user, I want the interface to state whether a file will be uploaded, so that I can make an informed privacy decision.
27. As a user, I want server-dependent tools to explain missing configuration, so that an unavailable tool does not look broken.
28. As an operator, I want third-party services configured through environment variables, so that secrets stay outside source code and persisted state.
29. As an operator, I want one Docker image for the frontend and API, so that deployment is simple and same-origin behavior is predictable.
30. As an operator, I want a Docker Compose example, so that I can configure ports, environment variables, health checks, and persistent storage.
31. As an operator, I want a configurable data location, so that state survives container replacement.
32. As an operator, I want YAML writes to be atomic and serialized, so that concurrent actions or interruption do not corrupt state.
33. As an operator, I want rotating backups and recovery behavior, so that a damaged state file can be restored.
34. As an operator, I want versioned persisted data, so that upgrades can migrate existing state safely.
35. As an operator, I want bounded history and report storage, so that the YAML state cannot grow without limit.
36. As a user, I want to create a read-only report from selected results, so that I can share diagnostics without exposing write access.
37. As a user, I want reports to have unpredictable IDs and explicit expiry times, so that accidental discovery and indefinite access are reduced.
38. As a user, I want expired reports to become unreadable, so that old diagnostic data is not retained publicly.
39. As a user, I want a warning before sharing potentially sensitive data, so that I can review the report first.
40. As a public report viewer, I want a read-only page, so that I cannot alter the ToolNest owner's data.
41. As an operator, I want public report routes isolated from write APIs, so that a reverse proxy can expose reports without exposing administration.
42. As an operator, I want network tools protected by validation, timeouts, rate limits, and concurrency limits, so that they cannot exhaust the host.
43. As an operator, I want server-side requests blocked from private and special-use networks by default, so that public inputs cannot be used for SSRF.
44. As an operator, I want any external command invoked without shell interpolation, so that user input cannot become a command injection vector.
45. As an operator, I want health checks, so that the deployment platform can detect an unhealthy instance.
46. As a maintainer, I want a complete migration inventory, so that every source tool has an auditable disposition.
47. As a maintainer, I want duplicate decisions documented, so that later contributors understand why one implementation was selected.
48. As a maintainer, I want frontend and backend to share contracts and metadata, so that catalog and API behavior do not drift.
49. As a maintainer, I want behavior tested through the deployed same-origin boundary, so that tests reflect the application users run.
50. As a maintainer, I want pure conversion algorithms tested directly, so that edge cases can be checked quickly without browser setup.
51. As an upstream author, I want copyright, license, and attribution preserved, so that redistribution respects the source projects.
52. As a distributor, I want ToolNest released under GPL-3.0, so that the combined work satisfies the applicable copyleft obligations.

## Implementation Decisions

- Treat all four projects under `template` as read-only source references. Ignore everything under `archive`.
- Create ToolNest as the root application rather than modifying or embedding the source applications.
- Use Vue 3, TypeScript, Vite, Vue Router, and Pinia for the frontend.
- Use Node.js and TypeScript for the backend API. The production server serves both built frontend assets and same-origin API routes.
- Keep frontend, backend, and shared contracts in one repository. Shared contracts include tool metadata, validation schemas, persisted data models, and API types.
- Build and distribute one Docker image. Provide Docker Compose configuration for environment variables, port mapping, health checks, and a persistent data directory.
- Introduce a single tool registry as the source of truth for routes, names, aliases, descriptions, category, tags, execution location, availability, external dependencies, and lazy-loaded UI entry points.
- Assign every tool exactly one functional primary category and zero or more functional tags. Do not expose source project as a user-facing category.
- Before migration, produce an inventory that records each source tool, its source location, core task, dependencies, duplicate group, selected disposition, target metadata, migration status, and verification result.
- Give every source tool one explicit disposition: migrated independently, merged into another tool, or excluded with a documented reason.
- Select the base for a duplicate group by functional completeness, correctness, existing coverage and edge handling, user experience, browser compatibility, performance, package weight, and maintainability, in that order.
- Merge valuable capabilities unique to other duplicate implementations. Represent materially different workflows for one core task as modes within one tool; retain separate tools when their core tasks differ.
- Do not use iframes, mount the original applications as sub-applications, or stop at a unified launcher.
- Fully support Simplified Chinese and English in the first release. Use English as the runtime fallback. Keep additional languages disabled until their coverage meets a separately documented release threshold.
- Store favorites, recent usage, preferences, and share reports in one configured YAML state file. Do not store secrets in that file.
- Add a schema version to persisted state and migrate older supported versions on startup.
- Serialize mutations within the process. Persist by writing and syncing a temporary file before atomic replacement. Keep rotating backups and recover from the newest valid backup when the primary file is invalid.
- Bound recent-history length, report count, individual report size, and total persisted state size.
- Read external-service endpoints and credentials from environment variables. Keep affected tools visible when configuration is missing and return a structured availability reason.
- Prefer browser-local processing whenever the browser can perform the task safely and reliably. Clearly display whether an operation is local or uploads data.
- Lazy-load every tool route and defer heavy dependencies such as media codecs, OCR, PDF engines, and image processors until required.
- Run expensive browser computation in workers where practical. Long operations expose progress, cancellation, timeout, and actionable failures.
- Apply validated limits to uploaded files, request bodies, responses, execution time, concurrency, and rate.
- Validate all server inputs and return a consistent error envelope suitable for localized presentation.
- For outbound network tools, reject loopback, link-local, private, multicast, unspecified, and other special-use destinations by default, including destinations reached after DNS resolution or redirects. Permit private destinations only through explicit operator configuration intended for trusted LAN use.
- Invoke external programs with argument arrays and without a shell. Apply explicit timeouts and resource limits.
- Generate report IDs with a cryptographically secure random source. Enforce expiry on every read and remove expired reports periodically.
- Render reports as escaped, read-only content; prohibit indexing; apply restrictive browser security headers; omit secrets; and require the creator to review a sensitive-data warning.
- Design public deployment so a reverse proxy can expose only report-reading routes. Write APIs remain limited to the local machine or trusted LAN and receive no application-level authentication.
- License the combined application under GPL-3.0. Preserve source licenses, copyright notices, and attribution in a discoverable distribution document.
- Deliver migration in this order: inventory and duplicate analysis; platform shell and registry; persistence and shared services; lightweight client tools; file and media tools; network and server tools; security, performance, licensing, and deployment closure.
- Completion requires the working unified application, exhaustive migration inventory, passing verification, reproducible image and Compose deployment, persistence and recovery documentation, secure deployment guidance, and complete attribution. A catalog shell or sample migration is incomplete.

## Testing Decisions

- Use the built, same-origin HTTP application as the primary and highest testing seam. Tests should observe browser-visible behavior and public HTTP contracts rather than component internals or storage implementation details.
- Exercise home search, categories, tags, all-tools browsing, direct routes, favorites, recent usage, language fallback, themes, availability messages, and responsive critical flows through browser-level tests.
- Exercise API validation, consistent errors, persistence across restart, state migration, size limits, report creation, report expiry, read-only report access, cleanup, and health behavior through HTTP integration tests against a temporary data directory.
- Test YAML durability through externally observed state: concurrent mutations retain all valid updates, interruption does not replace the last valid state, corrupt primary data recovers from a valid backup, and unsupported schema versions fail safely.
- Test deployment by building the production image, starting it with the documented Compose configuration, waiting for health, exercising representative browser and API flows, restarting it, and confirming persisted state remains.
- Test network-tool defenses at the HTTP boundary, including invalid hosts, DNS rebinding-resistant resolution checks, redirects to blocked networks, timeouts, rate limits, concurrency limits, oversized responses, and safe external-command failure.
- Test report security through public behavior: IDs are not predictable in practice, expired reports are rejected, report pages cannot mutate state, untrusted content is escaped, indexing is disabled, and write routes are absent from the public proxy example.
- Add focused unit tests only for pure conversion and parsing algorithms where many deterministic edge cases would be slow or opaque through the browser. Reuse applicable upstream fixtures after verifying their licenses and expected behavior.
- Maintain representative fixtures for each tool family rather than mirroring implementation details. A good test describes input, observable output, user-visible error, or durable state transition.
- Require each migrated tool to pass a basic contract check: its registry entry is valid, route loads, both primary languages resolve, availability is reported correctly, a representative valid case succeeds, and a representative invalid case fails clearly.
- Use the source projects' existing unit and end-to-end tests as behavioral prior art. Port assertions that protect real behavior; do not mechanically copy framework-specific component tests.
- Keep a migration verification result beside each inventory entry so completeness can be audited independently of test-suite totals.

## Out of Scope

- Modifying the four reference projects under `template`.
- Using any project under `archive` as a source or dependency.
- Preserving source-project branding, navigation, or source-based categories in the ToolNest interface.
- Running source applications as iframes, micro-frontends, or separately deployed child applications.
- Application-level authentication, multiple users, roles, accounts, or cross-device user synchronization.
- Public exposure of mutation APIs or general public operation of the unauthenticated application.
- Full first-release support for languages other than Simplified Chinese and English.
- Replacing environment-based secret management with an in-application credential vault.
- Guaranteeing that every external provider works without operator-supplied endpoints, credentials, or network access.

## Further Notes

- The reference inventory currently indicates a large migration: approximately 86 registered it-tools tools, 128 OmniTools tools, one registered 1Panel conversion tool, and multiple MyIP network and diagnostic capabilities. Counts are discovery aids, not acceptance totals; the final inventory determines the authoritative set after duplicate analysis.
- ToolNest is intended primarily for a local machine or trusted LAN. Operators who expose report pages publicly must configure their reverse proxy so no mutation API is reachable from the public listener.
- The existing development plan remains useful as a concise roadmap; this specification is the authoritative ready-for-agent statement of product behavior and implementation constraints.
