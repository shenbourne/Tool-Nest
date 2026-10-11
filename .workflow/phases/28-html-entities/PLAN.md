# Plan

1. Reproduce squeezed output row in local browser (observed FAIL: 3 children in horizontal output container).
2. Split HtmlEntities.vue into two independent ToolTextPanel rows, each with one output and its own actions; stack columns on narrow screens.
3. Re-run browser geometry, conversion, independent-input and copy checks; run panel contracts, typecheck, scoped lint and build.
4. Review scoped diff, record acceptance, commit and publish feature branch; mirror only tool component into primary checkout for user review. No master merge authorized.

No source-shaped unit test: browser geometry directly tests the reported visual failure. Existing panel contract test covers shared actions; no changes to conversion semantics.
