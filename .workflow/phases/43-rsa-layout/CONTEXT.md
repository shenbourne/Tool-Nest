# Phase43 — RSA output layout

User requires two key outputs above parameters, each with copy/PEM export, hidden until both keys exist. Parameters and generate action share opposite ends of one row. Preserve automatic generation and stale callback protection. Reuse ToolTextPanel; no new dependencies or relevant ADR changes. Base private/master ef505da, initial master/base 0/0; branch feature/phase-43-rsa-layout. Existing workflow verification notes and generated declarations remain separate.

Latest user decision2026-10-12: both key panels remain visible before generation, empty copy/export actions disabled. This supersedes hidden-output acceptance.
