# Acceptance

- PASS: default comma input produces comma/semicolon/newline/tab/pipe/space output (six real service tests).
- PASS: recognizes supported input delimiters independent of selection, including CRLF; preserves spaces within comma-delimited items.
- PASS: sorting, trimming, lowercase, deduplication and affixes still operate per item before joining.
- Browser interaction NOT RUN; component option values and computed binding reviewed unchanged.
