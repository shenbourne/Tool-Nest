# Domain Docs

## Before exploring

Read the following files when they exist:

- Root `CONTEXT.md`
- Root `CONTEXT-MAP.md`
- Relevant ADRs under `docs/adr/`

Proceed silently when they do not exist. Domain documents are created later when terminology or architectural decisions require them.

## Layout

This repository uses a single-context layout:

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Vocabulary

Use terms defined in `CONTEXT.md`. Avoid replacing established terms with synonyms. If a necessary concept is missing, record it for domain modeling.

## ADR conflicts

Explicitly identify proposals that conflict with an existing ADR instead of silently overriding the decision.
