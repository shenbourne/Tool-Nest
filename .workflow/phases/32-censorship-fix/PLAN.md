# Plan
1. Reproduce upstream method failure and add GET-contract regression.
2. Query official OONI GET endpoint per normalized URL with bounded recent-history sample and timeout. Validate input; distinguish no measurements from negative evidence.
3. Surface typed upstream failures as localized frontend messages. Display sample count, countries and latest observation metadata.
4. Verify unit/route integration, frontend mapping, types/lint/build and actual www.google.com UI. Record source/docs, commit/push feature only.

Implementation/checks complete. Live successful retrieval blocked by OONI connectivity; typed timeout UI verified. Next: publication, then successful acceptance on reachable network.
