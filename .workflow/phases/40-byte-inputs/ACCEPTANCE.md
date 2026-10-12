# Acceptance
- PASS source: Bytes, KB, MB, GB, TB, Bits each have labeled NInputNumber with update handler; PB retained.
- PASS automated: all seven units round-trip; 1 TB = 1024 GB, 1 KB = 8192 bits, 1 bit = 0.125 bytes; no four-decimal rounding.
- PASS automated/source: zero stays zero; clearing active input clears all fields via null; nonnegative controls retained.
- PASS source: bilingual Bytes/Bits labels and unique label/input IDs.
- Browser visual/keyboard interaction NOT RUN; source and conversion behavior verified, visual acceptance pending.

2026-10-12 browser follow-up supersedes pending desktop acceptance: PASS at1280x720 Chinese/light and English/light. Seven visible labeled editable fields, no overlapping/clipped controls. Actual input1.5KB ->1536 bytes/12288 bits; Bytes8 ->64 bits; MB1.5 ->1572864 bytes; GB2 ->2147483648 bytes; TB1 ->1024GB; PB1 ->1024TB; Bits1 ->0.125 bytes. Zero synchronizes all seven zeros, clearing MB empties all seven, ArrowUp Bits8 ->9 and bytes1.125, Tab advances focus. Mobile/dark NOT RUN. Label-dependent input left edges noted as cosmetic, not functional blocker.

Alignment follow-up PASS: Chinese/English1056x724 all seven inputs left385/right1007/width622, reach card content right edge. No overlap/cropping. KB1.5 ->1536 bytes/12288 bits remains correct. Prior cosmetic alignment note resolved.
