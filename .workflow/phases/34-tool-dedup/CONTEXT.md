# Phase 34 — Consolidate duplicate tools

User authorized merging CSV transpose, JSON formatting/viewing/stringify, line/list deduplication, password/token generation, and removing calculator remnants. Work starts at fetched private/master 8a79a5d on feature/phase-34-tool-dedup; master comparison 0/0. Primary dirty checkout is older and must retain unrelated edits.

Keep canonical routes /csv-rows-to-columns, /json-prettify, /remove-duplicate-lines, /password-generator. Redirect removed routes and resolve stored favorites/recent usage through tool metadata. Keep tab and 1–8-space indentation, optional empty-line retention, password/token presets with exclusion and length up to 512. Latest master already consolidated calculator; move remaining mathEvaluator locale keys to genericCalculator and remove stale primary source during scoped mirroring.

No new dependencies or ADR required: use existing redirectFrom contract. No merge to master authorized.
