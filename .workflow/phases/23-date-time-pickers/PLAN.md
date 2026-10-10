# Plan

1. Replace weekday, Discord and interval date inputs with NDatePicker (date/datetime). Keep formatted string contracts and responsive widths.
2. Add a datetime selection entry to the multi-format converter; selecting switches input to ISO format.
3. Verify typecheck, existing date service tests, web tests, scoped lint and build; review shared component use and locale behavior.

TDD skipped for low-impact component substitutions; existing service tests cover conversion behavior. Health review applies because four tool modules change; use existing picker rather than a new abstraction. Media trim fields represent elapsed seconds, not wall-clock dates, and stay numeric.
