# Plan
1. Add explicit immediate parameter watchers to password/token and random numbers.
2. Automatically generate RSA, serialize expensive jobs, reject invalid sizes, ignore obsolete completions and stop after unmount.
3. Verify behavior with Vue reactivity and mocked randomness/RSA callbacks; tests, scoped lint, typecheck, build.
4. Review multi-tool consistency, mirror only relevant component edits, commit/push isolated branch.
TDD: runtime behavioral tests used; no new abstraction or dependency. Harness audit not applicable.
