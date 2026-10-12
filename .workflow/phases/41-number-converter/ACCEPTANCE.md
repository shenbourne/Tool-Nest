# Acceptance
- PASS: one Number Converter registered; both old URLs redirect to /number-converter (registry contract + actual browser navigation).
- PASS: six editable fields synchronize in every direction (22 logic tests + browser Arabic 4000, English negative forty-two, Roman MMXXVI, binary101010, octal52, hexFF).
- PASS: invalid source preserved while derived fields clear; clearing any field clears all; Roman unsupported values show range message (tests and browser).
- PASS: signed safe integer limits round trip without precision loss; canonical Roman validation reused.
- PASS: old favorites/recent paths consolidate and retain latest timestamp (2 contract tests).
- PASS: Chinese/English UI, copy42, desktop alignment, removed description clause and help paragraph (browser). Evidence .scratch/phase41-evidence/number-converter.png in primary tree.
- PASS: scoped primary mirror applied with backups, preserving unrelated edits.
Mobile/dark visual checks not run; not required by this scope.
