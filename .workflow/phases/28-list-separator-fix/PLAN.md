# Plan

1. Reproduce with real convertList calls for all six separator choices (RED observed: 14/16 fail).
2. Separate input delimiter detection from output join; normalize CRLF boundaries.
3. Verify regression tests, typecheck, scoped lint and diff checks; review bindings and item pipeline.
4. Record acceptance and limitations. No architecture change or codebase-health review needed for this local service fix. No harness audit warranted.
