# Plan
1. Reproduce empty proxy response and test the actual Ping request seam.
2. Validate HTTP/envelope responses, localize actionable errors, guard duplicate/blank submissions.
3. Restore local backend and verify real Ping; run regression, server tests, typecheck, scoped lint and build.
4. Review, record acceptance and limitations, commit/push feature only. No merge authorized.

All tasks complete. Initial outage and independent invalid upstream location schema repaired; frontend/backend verification and browser success pass.

User follow-up: improve Ping output visibility. Replace raw JSON default with responsive probe cards, status, average/min/max latency, packet loss and packet counts; retain collapsible raw output/JSON. Chinese/English labels and light/dark inherited styling. Presentation-only change verified with existing tests/typecheck/scoped lint/build and live browser. No new behavior tests required for this reversible view.

Output presentation complete and desktop browser accepted. Kept existing request path and added no dependencies.
