# Verification

- pnpm --filter @toolnest/web test: PASS, 341 tests before additional registry regression.
- pnpm --filter @toolnest/web exec vitest run src/__tests__/registry.test.ts src/tools/date-time/duration.test.ts: PASS, 9 tests including added legacy-route regression.
- pnpm --filter @toolnest/web type-check: PASS.
- pnpm --filter @toolnest/web exec eslint src/tools/date-time src/tools/registry.ts src/layouts/ToolLayout.vue: PASS.
- pnpm --filter @toolnest/web build: PASS; existing browser externalization and chunk-size warnings.
- git diff --check: PASS.
- TDD RED not claimed: implemented consolidation then added behavioral boundary and registry contract tests.
- Focused codebase-health review invoked because consolidation crosses registry, layout and tool modules. Inspected redirect ownership, unique paths, scoped embedding and local duration calculations. No dependency change; existing calendar logic reused. Legacy source files retained for migration compatibility; excluded from discovery.
- Browser acceptance NOT RUN. Server checks not applicable: frontend-only change, no server/contracts modification.
- Isolation: worktree .worktrees/phase-24-unified-time from fetched private/master 2927b8b (0/0); dependencies reused through node_modules junctions. Initial missing dependency check failed, rerun successfully after linking existing dependencies.

## Master integration 2026-10-10
- Merge 9a906fa includes local master 2db3618 (calendar pickers and stopwatch spacing); conflicts only in STATE/ROADMAP, resolved preserving both.
- pnpm --filter @toolnest/web type-check PASS; test PASS 342/342; scoped eslint PASS; build PASS 18.23s with existing warnings; git diff --check PASS.
- Browser acceptance remains NOT RUN. Primary checkout untouched; generated declarations unstaged, backup stash retained.

## Conventional UI follow-up
- Shared TimeToolPanel presents form inputs before labelled result rows, per-row copying and Copy all; calendar/clock tools no longer display text-file import/export controls. Native text paste remains available for duration.
- pnpm --filter @toolnest/web type-check PASS; web test PASS 342/342; scoped eslint PASS; production build PASS (final 18.38s, existing warnings). Final whitespace check rerun after removing blank EOF.
- Browser: inspected all five tabs in Chinese, duration screenshot at .scratch/time-ui.png, correct weekday and truncation results, labelled start/end calendar fields, seven Discord formats. Discord single-row copy produced success feedback. Screenshot confirmed amount/unit side by side and aligned result rows. Mobile viewport, English, keyboard navigation and actual picker selection not exhaustively tested.
- Focused health review: shared presentation panel depends only on UI and existing copy composable, calculations remain owned by individual tools. Text-panel inventory updated for clock-specific form; no new dependency/ADR. No implementation-mirroring tests added for this presentation-only follow-up.

## Side-by-side datetime popup
- Shared DateTimePicker uses date calendar panel plus native hour/minute/second listboxes separated by border-left, one confirmation action. Local date/time string and numeric timestamp consumers preserved.
- type-check PASS; scoped eslint PASS; web tests 342/342 PASS; production build PASS 20.76s (existing warnings).
- Browser visual PASS: calendar and time parallel, divider visible, no nested time popup. Selected 08:30:00 and confirmed; input and Discord results updated correctly. Screenshot .scratch/datetime-picker.png. New preview http://127.0.0.1:3425/date-time (previous preview stopped; restart chose next port). Mobile and DST selection NOT RUN.
- Focused health review: shared control replaces all three datetime consumers, uses existing dependencies, edits draft before confirmation and discards unconfirmed draft on reopen. No ADR needed for presentation choice.

## 2026-10-11 centered time wheels
- Native select replaced by TimeWheel with fixed 36px rows, 252px viewport and 108px symmetric padding. Selected values align on mount/external changes, clicks, wheel and keyboard; touch/drag scrolling snaps on settle. Timers cleared on unmount.
- Browser PASS: initial 08/30/00 centered; keyboard End selects hour 23/minute 59 and measured selected center offsets [0,0,0] px including second 00. Screenshot .scratch/centered-time-wheel.png. Touch/mobile NOT RUN.
- Typecheck, scoped lint and build PASS (24.07s). Initial full tests 341 pass/1 failure exposed stale truncate-clock-time EXPECTED inventory also present in EXCLUDED. Removed obsolete EXPECTED entry; rerun all tests 342/342 PASS. This corrects prior follow-up test claims: inventory change had not removed the CRLF line as intended.
- Focused review: shared wheel owns scrolling and keyboard interaction, parent owns timestamp update, no new dependency/ADR; behavioral browser geometry check covers the center requirement.

## 2026-10-11 smooth scrolling and mouse drag
- Browser PASS: upward 73px mouse drag selects 02 from 00 (scrollTop 72), smooth End observed intermediate position 74 and final 828 for 23. Screenshot .scratch/smooth-time-wheel.png. Preventing mousedown default avoids native button focus changing scroll position.
- Pointer capture follows drag, releases/snap on up/cancel; trailing click suppressed; reduced-motion uses auto scroll. Existing touch scroll retained. Scoped review covered event cleanup, external value sync and rapid-wheel target accumulation.
- Final typecheck/lint and 342 tests PASS; production build result recorded in state. Initial verification request not executed because automatic approval stream disconnected; normal approval retry succeeded.

## Now then drag bug
- Reproduced desktop browser: after Now hour 09, 73px upward drag unexpectedly reset hour to 00/top 0. Temporary event logs showed pointer origin 324 and correct drag end 397, excluding drag-coordinate math as root cause.
- Root cause: outer label forwards mouse activation/focus to first option button; focused 00 scrolls into view then settle updates selection. Replaced label wrapper with neutral time-field; listbox keeps aria-label. Logs removed.
- Also stop in-flight animation on pointer down, suspend settle while pointer held, and retain one JS snap owner rather than CSS snap competing with direct drag.
- Identical browser regression PASS: Now 09 then 73px upward drag -> 11/top396; screenshot .scratch/now-drag-fixed.png. Smooth and drag follow-up incorporated in same commit. Touch/mobile NOT RUN.
- Final repair verification: typecheck PASS; scoped lint PASS; 342/342 tests PASS; production build PASS 19.49s; diff whitespace PASS. No new dependencies. Browser regression provides the actual UI-boundary check.
