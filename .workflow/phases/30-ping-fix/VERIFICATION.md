# Verification

- RED: pnpm --filter @toolnest/web exec vitest run src/tools/ping-test/ping.service.test.ts: 6 failures/1 pass, exact empty JSON symptom reproduced.
- GREEN: same command: 7/7 PASS.
- RED: server globalping test asserts location contract: 1 fail/2 pass; rejects tagged location sent to upstream.
- GREEN: pnpm --filter @toolnest/server test: 52/52 PASS after selector translation.
- pnpm --filter @toolnest/web test: 349/349 PASS.
- pnpm type-check: PASS (initial metadata/test return type mistakes repaired).
- pnpm --filter @toolnest/web exec eslint src/tools/ping-test/PingTest.vue src/tools/ping-test/index.ts src/tools/ping-test/ping.service.ts src/tools/ping-test/ping.service.test.ts: PASS.
- pnpm --filter @toolnest/server exec eslint src/services/globalping.ts src/__tests__/globalping.test.ts: PASS.
- pnpm build: PASS, existing browser externalization/chunk warnings.
- Equivalent individual verification commands used instead of scripts/verify to avoid repository-wide lint --fix touching unrelated work.
- Live original reproduction: port 3000 HTTP500 empty body; port3001 ECONNREFUSED. Restored local backend with pnpm dev:server.
- Live second cause: Globalping HTTP400 locations.0.type is not allowed. Translated tagged local selectors at external service boundary; no dependency or architecture change.
- Live final HTTP200 success:true, baidu.com status finished and two probes. Actual UI input/click PASS: results visible, button restored. Screenshot primary .scratch/ping-fixed.png.
- Ordinary review PASS: preserves backend validation messages, respects HTTP failures, guards blank and concurrent requests, existing SSRF boundaries retained.
- Focused codebase health invoked for frontend/backend boundary changes: legacy location shape stays internal; translation only at Globalping adapter, other callers benefit; no dependency cycle/shared API redesign.
- ADR/clarification/harness audit SKIP: localized bug, no architecture decision or ambiguous requirement, no workflow audit warranted.
- Full browser outage UI simulation NOT RUN; outage behavior verified at actual request service seam with Response fixtures. Live upstream behavior depends on network/probe availability.
- Shared checkout source mirrored for immediate local use; unrelated dirty work preserved. Generated declarations excluded from commit.
