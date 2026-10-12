# Acceptance
- Source PASS: all three units have numeric input and slider, localized labels and 0.01 steps.
- Automated PASS: Celsius/Fahrenheit/Kelvin updates convert in every direction; decimal and repeated edits preserve expected values.
- Automated PASS: null/nonfinite updates retain last valid state; values clamp at absolute zero.
- Source PASS: corresponding sliders use converted bounds; high input expands upper range.
- Browser visual/interaction NOT RUN; phase awaits UI acceptance.
