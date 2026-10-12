# Acceptance — verified 2026-10-12

- PASS desktop1440x1000: private/public panels share equal-width row above controls, matching heights and aligned copy/export buttons. evidence/desktop.jpg.
- PASS parameters left and generate right, same row; mobile390x844 input/button share y983.25 and height42, parameter width120. evidence/mobile.jpg.
- PASS latest user revision: empty panels remain visible; four copy/export actions disabled when outputs empty. Empty state exercised by clearing key size, then restored2048 and observed successful generation. evidence/empty-visible.jpg.
- PASS mobile390x844: key panels stack; document scrollWidth382 <= innerWidth390, no horizontal overflow. Full-page screenshot includes both panels and controls.
- PASS both copy buttons show success toast. Both PEM downloads match corresponding textarea contents after CRLF/LF normalization; filenames private-key.pem and public-key.pem (browser suffix on repeated downloads).

Earlier hide-output requirement explicitly superseded by latest user request. Existing automatic generation and stale callback handling retained.
