# Acceptance
- Source PASS: all three units have numeric input and slider, localized labels and 0.01 steps.
- Automated PASS: Celsius/Fahrenheit/Kelvin updates convert in every direction; decimal and repeated edits preserve expected values.
- Automated PASS: null/nonfinite updates retain last valid state; values clamp at absolute zero.
- Source PASS: corresponding sliders use converted bounds; high input expands upper range.
- Browser visual/interaction NOT RUN; phase awaits UI acceptance.

2026-10-12 Browser desktop acceptance PASS (1280x720 Chinese/light): three aligned rows, no overlaps; editable inputs100C ->212F/373.15K, -40F ->-40C/233.15K, 300K ->26.85C/80.33F. Mouse drag each of three sliders updates all inputs/sliders. Kelvin drag to minimum ->0K/-273.15C/-459.67F. 500C ->932F/773.15K with matching expanded range. Desktop screenshot .scratch/temperature-visual/desktop.jpg. Earlier browser NOT RUN status superseded for desktop. Mobile/dark not tested.
