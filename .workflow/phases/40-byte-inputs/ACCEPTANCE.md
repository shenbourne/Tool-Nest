# Acceptance
- PASS source: Bytes, KB, MB, GB, TB, Bits each have labeled NInputNumber with update handler; PB retained.
- PASS automated: all seven units round-trip; 1 TB = 1024 GB, 1 KB = 8192 bits, 1 bit = 0.125 bytes; no four-decimal rounding.
- PASS automated/source: zero stays zero; clearing active input clears all fields via null; nonnegative controls retained.
- PASS source: bilingual Bytes/Bits labels and unique label/input IDs.
- Browser visual/keyboard interaction NOT RUN; source and conversion behavior verified, visual acceptance pending.
