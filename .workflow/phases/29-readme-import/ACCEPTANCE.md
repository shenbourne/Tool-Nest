# Acceptance

- Source reviewed: README-only file/URL modes; Markdown/text file.text() writes existing override; removal leaves content intact. Existing manual edit/reset preserved.
- Automated PASS: URL protocol/credentials validation, text extraction, HTTP/HTML/network failures (7 tests); errors cannot mutate content.
- Automated PASS: ZIP preserves imported UTF-8 README verbatim after metadata change (1 regression test).
- Source reviewed: bilingual controls, loading/disabled URL controls and 15s timeout.
- Browser interaction/visual acceptance NOT RUN; phase remains awaiting UI acceptance.
