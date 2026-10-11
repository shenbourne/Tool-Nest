# Acceptance

- PASS: empty HTTP500, HTML, empty success response, rate limit and connection failures receive typed errors; localized Chinese/English messages exist.
- PASS: real baidu.com UI Ping completes, two probe results shown. API validation error regression preserved.
- PASS: trimmed target sent; blank/duplicate submission guarded in component; runtime metadata backend; typecheck/build pass.

- PASS: live desktop baidu.com displays two probe cards, summary, latency/loss/counts and status; raw diagnostics collapsed by default, log expansion verified. Responsive two-column breakpoint reviewed in source; narrow viewport browser NOT RUN.

