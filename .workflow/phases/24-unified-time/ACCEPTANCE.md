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

- Datetime popup PASS (desktop browser): left calendar/right hour-minute-second selection, vertical divider; confirmed time updates both display and calculations. Interval endpoints and date converter reuse same component (source/typecheck PASS).

- Centered wheel PASS desktop browser: selected initial and endpoint rows have 0px center offset, keyboard End updates selection. Fading and fixed central highlight source/visual PASS. Touch/mobile NOT RUN.

- Smooth/drag PASS desktop browser: mouse drag 73px changed hour 00 to 02 with exact scrollTop 72; keyboard End produced intermediate position 74 before ending at 828 for 23. Trailing click suppressed, stable centered finish. Touch/mobile NOT RUN.

- Now -> drag regression PASS desktop browser: no reset to 00; upward two-row drag advances 09 to 11 and remains centered.

## 2026-10-11 time-only parity
- Time truncation now uses shared DateTimePicker timeOnly mode: centered hour/minute/second wheels, smooth mouse drag, Now and one confirmation; confirmed value remains HH:mm:ss.
- Typecheck, scoped eslint, 342/342 web tests and build PASS (19.35s, existing chunk warnings).
- Desktop browser PASS: Now hour 09 then 72px upward drag selects 11; all three selected center offsets 0px; confirm yields 11:43:53 and truncation results 11:43:00 / 11:00:00. Screenshot .scratch/time-only-picker.png. Touch/mobile NOT RUN.
- Review: shares existing wheel implementation, no dependency or new abstraction; no ADR/health audit warranted for one consumer mode. Feature publication follows; generated declarations excluded.
