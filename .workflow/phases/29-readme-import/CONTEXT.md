# Phase 29 — README import

User requested local file and file URL import for Docker Compose to 1Panel README. Preserve manual editing, reset, metadata overrides and ZIP export. Reuse ToolFileUpload; fetch directly in browser (HTTP(S), credentials omitted, 15s timeout, reject HTML). No server proxy or dependencies. Relevant ADR-0001 reviewed; no new architecture decision required.

User expanded scope to existing 1Panel ZIP packages creating a new application version with inherited editable information. ZIP is the existing exported format. Source versions selectable; existing versions remain intact in output. Official halo metadata inspected from upstream appstore; preserve unknown metadata and language fields.
