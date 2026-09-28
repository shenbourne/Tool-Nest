# Project

## Goal

Build ToolNest as a unified, bilingual developer-tools web application that consolidates useful capabilities from the reference projects into one maintainable interface.

## Success measure

Every inventoried source tool is migrated, merged, or explicitly excluded; retained tools work through unified routing and the documented build, persistence, security, deployment, and verification expectations pass.

## Constraints

- Vue 3 and TypeScript frontend, Node.js and TypeScript backend, and shared contracts in `packages/shared/`.
- One Docker image with same-origin API and static assets.
- Simplified Chinese and English support, with English fallback.
- GPL-3.0 compatibility and preserved upstream notices.
- Local or trusted-LAN deployment by default; public access is limited to hardened read-only report routes.

## Out of scope

- Editing the read-only projects under `template/`.
- Treating embedded upstream applications or iframes as completed migrations.
- Exposing write APIs directly to the public internet.

See `DEVELOPMENT_PLAN.md`, `DESIGN.md`, and `CONTEXT.md` for the authoritative product, design, and domain detail.
