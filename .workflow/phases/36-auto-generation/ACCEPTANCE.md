# Acceptance
- PASS runtime: opening password/token and random-number generators produces results.
- PASS runtime: length, presets, character switches, exclusion, number bounds/count/unique changes update results; invalid options clear secrets and recover.
- PASS runtime: existing generate buttons invoke fresh generation.
- PASS runtime with mocked forge: RSA generates on open/change, serializes requests, suppresses stale results, handles failure and unmount.
- PASS source audit: UUID/ULID/BIP39/MAC/random port/IPv6 ULA already automatically generate; OTP retains its editable secret and regenerates code/QR from inputs.
- Browser visual/manual acceptance NOT RUN; no layout changes.
