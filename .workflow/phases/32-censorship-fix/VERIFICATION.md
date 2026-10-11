# Verification — Phase32 censorship query fix

- RED: pnpm exec vitest run src/__tests__/ooni.test.ts in apps/server:1 fail/3 pass. Exact request-contract mismatch POST vs GET observed.
- Official contract: https://api.ooni.io/apidocs/ documents GET /api/v1/measurements; input is one query parameter. Official source https://github.com/ooni/backend/blob/master/api/ooniapi/measurements.py confirms limit<=100 and history query filters.
- Fixed: one GET per normalized/deduplicated HTTP(S) URL, up to10 inputs, last30 days/latest100 successful measurements per input,20sec request deadline. Userinfo and invalid schemes/URLs rejected before fetch. No target URLs fetched directly (only fixed OONI host).
- Historical record sample aggregates confirmed/anomaly only from assessed records; failed/unrelated records ignored; empty/missing evidence remains undefined. Countries/latest observation/count shown; note explicitly describes bounded sample and non-live-device nature.
- Typed service errors preserve400/502/504 through route; client renders Chinese/English validation/service/timeout/invalid-data messages. Native fetch UND_ERR_CONNECT_TIMEOUT covered.
- pnpm --filter @toolnest/server test:57/57 PASS (includes upstream route error regression).
- pnpm --filter @toolnest/web test:356/356 PASS. Final targeted mapper suite7/7 PASS.
- pnpm type-check:PASS. Final server type-check after cause-code change PASS.
- Scoped server eslint (ooni.ts/network.ts + both tests):PASS. Scoped web eslint (mapper/test/censorship component):PASS.
- pnpm build:PASS for server and web, existing chunk/Node externalization warnings. Final cause-code-only change server type-check/scoped lint PASS.
- git diff --check:PASS.
- Equivalent individual commands used instead of scripts/verify to avoid --fix editing unrelated files.

## Live environment limitation
- Previous code and direct requests failed connecting to api.ooni.io with native connect timeout. Attempted addresses included104.244.46.93 and2a03:2880:f11c:8083:face:b00c:0:25de; no system DNS/security settings changed.
- Both official .io and .org endpoints were attempted; live GET could not return data in this network. Independent DNS-over-HTTPS diagnostic also timed out. Do not claim live successful data retrieval or confirmed DNS pollution.
- Local frontend was stopped; pnpm dev:web restored it. Backend watcher loaded source fix.
- Actual UI input www.google.com now accepted, request yields typed504 and Chinese 'OONI measurement query timed out' instead of 'An internal error occurred'; button/input recover. Screenshot primary .scratch/censorship-timeout-fixed.png.
- Successful live OONI response acceptance remains NOT VERIFIED due external connectivity. Phase implementation is verified but end-to-end positive acceptance awaits reachable OONI network.

## Review
- Ordinary review PASS for URL validation, trusted upstream boundary, conservative evidence aggregation, sample scope, localized errors and recovery state.
- Focused codebase health invoked for server/client contract change: service owns external request/normalization and typed errors; route maps HTTP envelope; frontend owns translation. No dependencies or cycles added, other tools untouched.
- ADR/harness audit SKIP: no architecture policy change or recurring workflow audit needed.
- Source mirrored into primary checkout, preserving unrelated dirty work. Generated declarations excluded. No merge authorized.

## Authorized master integration — 2026-10-11
- User explicitly requested local master merge. Integrated master f6adb77 into feature via 6c35627. Only STATE/ROADMAP append conflicts; preserved both histories. Locales and runtime sources merged automatically; reviewed changed scope against master.
- pnpm test PASS: web395 + server57 =452. pnpm type-check PASS. Scoped server/web eslint PASS (sandbox path access initially denied; escalated retry successful).
- Prior publication confirmed 8456693. Pre-integration local notes/declarations preserved in stash phase32-pre-master-integration. Master dirty tracked edits separately preserved in phase32-authorized-master-preservation; untracked assets remain untouched.
- Positive live OONI response remains unverified due external timeout; merge authorization does not change that acceptance limitation.
- pnpm build PASS (server/web; existing externalization/TOML eval warnings). git diff --check PASS. Source unchanged after checks. Full lint skipped because known pre-existing baseline; relevant scoped checks passed.
