# Phase 29 — README import

User requested local file and file URL import for Docker Compose to 1Panel README. Preserve manual editing, reset, metadata overrides and ZIP export. Reuse ToolFileUpload; fetch directly in browser (HTTP(S), credentials omitted, 15s timeout, reject HTML). No server proxy or dependencies. Relevant ADR-0001 reviewed; no new architecture decision required.
