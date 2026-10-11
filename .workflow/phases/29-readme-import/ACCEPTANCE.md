# Acceptance

- Source reviewed: README-only file/URL modes; Markdown/text file.text() writes existing override; removal leaves content intact. Existing manual edit/reset preserved.
- Automated PASS: URL protocol/credentials validation, text extraction, HTTP/HTML/network failures (7 tests); errors cannot mutate content.
- Automated PASS: ZIP preserves imported UTF-8 README verbatim after metadata change (1 regression test).
- Source reviewed: bilingual controls, loading/disabled URL controls and 15s timeout.
- Browser interaction/visual acceptance NOT RUN; phase remains awaiting UI acceptance.

Package extension acceptance PASS: automated tests cover official direct-version and ToolNest versions/ layouts, metadata inheritance and edits, unknown/language fields, README/logo/binary/script preservation, source version selection, malformed/multi-root/traversal rejection and version collision. Browser import Demo ZIP -> inherited metadata/new version 1.0.1 -> edit name Updated Demo/version 2.0.0 -> download PASS; downloaded ZIP independently inspected for both versions, metadata website, CUSTOM_TOKEN, cloned init.sh and README. Browser existing version disables download PASS. Screenshot .scratch/1panel-import-verified.png. Narrow screen/English interaction NOT RUN.
