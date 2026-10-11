# Phase 30 — Ping fix
User screenshot: empty API response raises JSON parse exception. Live reproduction: POST localhost:3000/api/network/ping -> 500 empty body; localhost:3001 -> ECONNREFUSED. Preserve shared edits; isolated feature/phase-30-ping-fix based on private/master 742c5e3. No relevant ADR changes.

Scope extended by user: make measurement output readable without inspecting JSON.
