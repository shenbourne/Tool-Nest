# Acceptance — current live-generation behavior
- PASS: four example cards preserved; switching type updates immediately.
- PASS: count updates while typing, without blur/Enter; empty count clears output and disables copy/export (browser).
- PASS: starting lower bound typed as 10 with count 4 gives Fibonacci 13,21,34,55 and primes 11,13,17,19 without generation action (browser).
- PASS: start is a nonnegative integer bounded at 1,000,000; invalid start clears output and displays guidance (service tests + component review).
- PASS: even/odd alignment and duplicate Fibonacci ones verified by real service tests.
- PASS: Fibonacci count limit shrinks with lower bound, preventing unsafe integers.
- PASS: bilingual labels and shared copy/export retained; generation button removed per user request.
- NOT RUN: dark/mobile visual acceptance and copy/export interaction; earlier desktop card layout verified.
PASS follow-up: start hint displays on one line under 150px input, desktop screenshot inspected; bilingual hint shortened with unchanged lower-bound meaning.
