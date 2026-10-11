# Plan — completed implementation and verification
1. Identify every @iarna/toml consumer and reproduce browser initialization failures. DONE: four consumers; original JSON failed, remaining three failed in expanded tests.
2. Use serializer-only entry for JSON/YAML to TOML. DONE.
3. Map global.Date/Buffer/BigInt to corresponding globalThis properties through Vite define. DONE; other globals unchanged.
4. Test browser-like bundling using actual Vite config, normal/empty/invalid inputs and dates. DONE: 6 targeted tests PASS.
5. Review config boundary and all consumers; verify isolated branch tests, typecheck, scoped lint, build and browser interactions. DONE except final build result pending in verification.
6. Commit and publish feature/phase-27-json-to-toml-fix after remote comparison; no master merge authorized.
Base: private/master 742c5e3, refreshed 2026-10-11. Primary shared user edits preserved. Isolated worktree reuses installed dependencies through junctions.
No scope redesign or ADR needed for library compatibility correction. Focused codebase-health review invoked because failure spans four tools and build configuration. Full lint skipped: repository-wide pre-existing lint debt; non-mutating lint of changed files used. Server tests not applicable: no server behavior changed.
