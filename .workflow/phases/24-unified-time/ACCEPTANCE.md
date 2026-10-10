# Acceptance

- PASS (registry contract test): nine screenshot cards replaced by one /date-time entry; all nine paths retained as redirects.
- PASS (duration tests and source review): days/hours/minutes/seconds/decimal hours/clock and days + remainder displayed together, including fractions and durations over 24 hours.
- PASS (source review/typecheck/build): weekday, date interval, Discord timestamp and truncation are retained as in-page tabs; one outer header. Existing calendar implementations reused.
- PASS (source review): Chinese and English labels supplied, copy/paste controls retained, shrinkable selector and scrollable Naive UI tabs.
- NOT RUN: browser visual/click/keyboard acceptance. Phase awaits UI acceptance; not marked complete.

## UI follow-up
- PASS desktop browser: amount/unit adjacent, form before results, one heading, labelled result rows, all five tabs render expected output.
- PASS copy feedback: Discord row Copy reports success; copy buttons have distinct accessible labels.
- PASS source/typecheck: date/time pickers preserved, truncation uses clock picker, Chinese/English labels and responsive grid.
- Remaining NOT RUN: mobile, English and full keyboard/picker interactions.
