# Acceptance
- NumberSum uses string textareas and disables file actions: PASS source review.
- File input/import/export absent in string mode; text paste and copy retained: PASS template conditions and handlers reviewed.
- Computation unchanged; other tools retain file actions by default: PASS diff review.
- Chinese/English paste text labels: PASS locale review.
- Browser visual verification: NOT RUN.

- Leap-year checker has string input/output, text paste and copy, without file actions: PASS template review using verified shared mode.
- Existing parsing, leap-year calculation and invalid-token warnings unchanged: PASS one-line diff review.
