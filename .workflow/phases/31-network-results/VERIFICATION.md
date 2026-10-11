# Verification — Phase 31

## Automated evidence
- pnpm --filter @toolnest/web test: PASS 355/355 (48 files), includes six new actual-schema result normalization tests.
- pnpm --filter @toolnest/web exec vitest run src/components/network-results.test.ts: PASS 6/6 after final missing-value formatting change.
- pnpm --filter @toolnest/web type-check: PASS on implementation; final rerun tracked below.
- Scoped eslint initially FAIL: six pre-existing no-explicit-any errors in WHOIS(4), IP(1), DNS resolver(1). Differential node .scratch/differential-lint.mjs compared all eleven files with HEAD: baseline6/current6/new0 PASS. All new presenter/mapper/test files and other touched tools clean.
- pnpm --filter @toolnest/web build: PASS after main implementation; existing externalization/chunk warnings. Final rerun tracked below.
- Equivalent explicit commands used instead of scripts/verify to avoid repository-wide lint --fix editing unrelated source.
- git diff --check: initial trailing-blank FAIL repaired, rerun PASS.

## Browser acceptance
- Actual Globalping responses inspected before mapping: MTR hops[].stats, resolvedAddress/resolvedHostname and asn[]; DNS timings.total and answers[].value/ttl.
- Live MTR example.com PASS: two probe route tables, 11 hops each, one no-reply hop correctly displays100% loss and missing latency as em dash; logs/JSON initially collapsed. Evidence primary .scratch/network-mtr-results.png.
- Live global latency example.com PASS: DNS query times11/3ms, NOERROR, resolver and A/TTL rows correctly shown. Evidence .scratch/network-latency-results.png.
- Live rule test example.com PASS: two resolved addresses and success label.
- Live DNS leak PASS after dev-backend reset: two domains, resolved addresses and explicit server-side limitation. Initial plain-text429 exposed; now readable localized rate-limit error added to five consumers.
- Live WHOIS example.com PASS: registrar/nameservers/status and localized RDAP events displayed; shared copy/export buttons remain enabled. Evidence .scratch/network-whois-results.png.
- Live DNS resolver PASS: domain + 2-record summary; existing record table retained.
- Live IP info PASS: prominent address and city/country/ISP summary; existing complete property table retained. Sensitive values not included in published artifacts.
- Censorship page input now visibly available (existing hide-input layout had no URL field); request/error handling PASS. Existing OONI service returned generic internal error, live successful results NOT VERIFIED. Four evidence states (confirmed/anomaly/noEvidence/unknown) validated through real NetworkResults component in a temporary standalone fixture and unit tests. Chinese/English and340px card container PASS (card scrollWidth338 <= width340); raw JSON collapsed. Fixture screenshot .scratch/network-censorship-fixture.png; temporary HTML removed.
- Mobile whole-app/dark-theme browser NOT RUN. Native table overflow container and themed semantic variables reviewed in source.

## Review and scope
- Ordinary review PASS: Vue escaped values; labeled native tables, focusable scroll regions, native disclosures; missing values not converted into zero; MTR intermediate loss not claimed as destination failure; DNS query latency/server DNS evidence and censorship uncertainty explained precisely.
- Cross-module health review invoked: one scoped result presenter + pure data adapter used by six views, no dependency additions, request logic remains with tools, no cycle or security-boundary changes. IP/DNS existing tables retained with small summaries; WHOIS/censorship export contracts preserved. Browser exposed duplicate conditional slot keys in summary consumers: explicit summary/records keys repair introduced warnings.
- Ping, other already-readable network tools, backend services and unrelated source left unchanged. R-002 existing requirement covers scope; roadmap records user decision. ADR/harness audit SKIP: no architecture policy decision or recurring workflow audit warranted.
- Remote initial fetch attempts failed TLS EOF, so isolated branch stacked on published phase30 de82219 for required selector fix, freshness not falsely claimed. Final remote check/publication tracked below. No merge authorized.

Final targeted tests6/typecheck/differential lint new0/build/diff checks PASS after final key/unit/whitespace fixes. Pre-publication fetch exit=0; base private/master SHA recorded by command output. No production API mocks or new dependencies.
