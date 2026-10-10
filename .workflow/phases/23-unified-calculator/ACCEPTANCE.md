# Acceptance
- Single discoverable calculator and legacy URL redirect: PASS registry contract and browser redirect.
- Live preview does not save history; equals and Enter do: PASS browser 98 then 100 with two records.
- Keypad arithmetic, factorial, continuation: PASS browser 98 + 2 = 100 and 5! = 120; parser tests.
- History reuse and refresh persistence: PASS browser reload retained both entries, reuse preview 100.
- Error left of result; buttons remain stationary: PASS valid/error button top both 363.890625 px. Screenshot calculator-preview.png.
- Bilingual labels: Chinese and English browser PASS. Desktop acceptance PASS. Supplemental narrow viewport test: global app sidebar squeezes content at 390px; recorded limitation outside calculator scope.

- Backspace icon after power/remainder; uniform button sizes and spacing: PASS browser measurement backspace and 7 both 103x62px; backspace 123 -> 12 PASS, screenshot keypad-preview.png.
