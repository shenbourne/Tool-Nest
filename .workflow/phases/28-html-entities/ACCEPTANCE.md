# Acceptance

- PASS: desktop browser 1280x720 has two input/output rows, all four textareas 416px wide, one textarea per slot. No squeezed sibling outputs.
- PASS: independent decode input `&lt;p&gt;A &amp; B&lt;/p&gt;` returns `<p>A & B</p>` without modifying escape input/output.
- PASS: second copy button copies decoded text; second export button downloads unescaped.txt containing current decoded text.
- PASS: 640px viewport uses a single 360px column per conversion row.
- PASS: shared import/paste/copy/export controls remain on both panels; readonly results remain text, not rendered HTML.
- Desktop screenshot: primary checkout .scratch/html-entities-fixed.png. Full mobile sidebar usability and dark theme NOT RUN; narrow-screen check covers this tool's column stacking only.
