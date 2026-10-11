# JSON to TOML load fix
Base: private/master 742c5e3, fetched 2026-10-11; local master ahead 9. Isolated branch feature/phase-27-json-to-toml-fix. Shared edits preserved.
Plan: reproduce browser module failure without Node global; import stringify-only entry; test conversion and browser loading; typecheck/build/review; commit and publish feature branch.
No ADR needed: use existing serializer without new dependencies. No broad diagnosis/health audit needed for a single import fix. TDD applies to the browser regression.
