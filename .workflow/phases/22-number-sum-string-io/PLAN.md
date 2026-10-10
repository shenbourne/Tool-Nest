# Plan
1. Add default-on fileActions option to ToolTextPanel; disable only for NumberSum.
2. Add bilingual paste text wording; preserve computation and other tools.
3. Review diff; run web tests, typecheck/build and scoped differential lint; record acceptance.
Low-impact UI option: skip new tests that mirror template; existing shared-panel contract suite applies.
Focused codebase health: shared component change preserves current ownership and adds no dependency or duplication. No new abstraction/ADR needed.
