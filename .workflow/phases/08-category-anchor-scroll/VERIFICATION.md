# Verification

Tree verified: `feature/phase-08-category-anchor-scroll` working tree based on `158b51d` (the `master` tip at the time of branching, which already carries phase 07's three commits). Commands were run from the repository root on 2026-09-30 unless noted.

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| Tests | `pnpm test` | PASS — 206 web tests in 32 files, 52 server tests in 8 files. The 5 tests in the new `src/utils/category-anchor.test.ts` are this phase's; nothing else in the suite was touched, so the base tree ran 201 | terminal output; GREEN run of the new file recorded in `.scratch/phase-08-evidence/guard-test-red.txt` |
| Type check | `pnpm type-check` | PASS — `packages/shared`, `apps/server`, `apps/web` (`vue-tsc --noEmit`) all Done | terminal output |
| Build | `pnpm build` | PASS — `apps/web` built in 30.07 s (this is the check that catches malformed SFC structure; `vue-tsc`/`vitest` do not) | terminal output |
| Lint (repo-wide) | `pnpm lint` | **NOT RUN.** It fails on the pre-existing baseline recorded in `STATE.md` (231 errors / 88 files) and it passes `--fix`, which rewrites files outside this phase. The per-file differential below is the meaningful measurement, as in phases 04–06 | `STATE.md` baseline note |
| Differential lint | `node .scratch/phase-08-evidence/differential-lint.mjs HEAD` — per-file eslint error count now vs at the branch base | **PASS — TOTAL added 0, removed 0 across the 6 files.** `CategoryPage.vue` carries 1 pre-existing error at both ends; the other files 0→0; the two new files 0 | `.scratch/phase-08-evidence/differential-lint.txt` |
| Contract test (RED) | `pnpm exec vitest run src/utils/category-anchor.test.ts` before `category-anchor.ts` existed | FAIL as expected — `${srcDir}/category-anchor` cannot be resolved | `.scratch/phase-08-evidence/guard-test-red.txt` |
| Contract test (GREEN) | same command after the fix | PASS — 5 tests | `.scratch/phase-08-evidence/guard-test-red.txt` |
| Browser acceptance | Chrome DevTools MCP against `http://localhost:3000` (dev server already running, Vite serving this working tree) | See `ACCEPTANCE.md` — 5 navigation scenarios measured, plus the 16-category anchor inventory | measurements in `ACCEPTANCE.md` |
| Working tree after the run | `git status --short` | Only this phase's 6 files (4 modified, 2 new). `apps/web/src/components.d.ts` shows as modified with an **empty** content diff — the known CRLF artefact of `pnpm build`/dev, left unstaged | repository state |

## Shared-worktree note

This working tree is used by two sessions at once. While this phase was being implemented the other session committed phase 07 (`6e44df1`, `4904961`, `158b51d`) and switched the checkout to `feature/phase-07-file-thumbnails`, so this phase's code commit (`a5d5c15`) initially landed there; it was moved to `feature/phase-08-category-anchor-scroll` with `git branch -f` and the phase 07 branch was repointed to `158b51d`, its previous tip (no commit was lost — phase 07's work is intact and the merge commit does not include this phase).

Because of that sharing, the two index files `.workflow/STATE.md` and `.workflow/ROADMAP.md` carry **both** sessions' pending edits in the working tree and were deliberately left **uncommitted**; committing them would have committed the other session's unfinished records. The phase 08 additions (the `Current phase` sentence, `In progress`, a verification paragraph, the next action, the sidebar-highlight follow-up, and the phase 08 roadmap row) are present in the working tree and are the only phase 08 changes outside the committed phase folder.

## Not verified

- **Smooth-scroll animation timing is not part of the evidence.** In a background (unfocused) Chrome tab the animation is deferred: sampling `window.scrollY` every 120 ms after a click showed the old value for 1.4–2.3 s and then the target value, while the *pre-existing* in-place `scrollIntoView` path behaved identically (11 516 px target, twelve 0 samples). The acceptance numbers were therefore taken with the tab brought to the front (`select_page` with `bringToFront`), and the route's `window.scrollTo` call was observed to carry the correct target (`{ top: 3279.7, left: 476, behavior: 'smooth' }`) as soon as the click happened. Whether the animation is smooth on another browser/GPU was not measured.
- **`navigate` mode was not re-clicked end to end.** The sidebar's `navigate` branch does not push a hash and `CategoryPage` only redirects in `anchor` mode, so it takes the same "no hash → `{ top: 0 }`" path that scenario 4 measures. Switching the mode also writes preferences to the API, which would touch shared local state.
- **The "hash whose category renders no section" fallback is unreachable today.** All 16 sidebar categories render a section (inventory in `ACCEPTANCE.md`), so the `{ top: 0 }` fallback inside `scrollBehavior` is defensive only and was not exercised behaviourally.
- **The sidebar's active-category highlight while scrolling the home page by hand remains as it was.** `AppLayout`'s `IntersectionObserver` collects `[id^="category-"]` once in `onMounted`, and the layout stays mounted across in-app navigations, so the observer has no targets after arriving at the home page from another route. Clicking a category still highlights it (the click sets `clickedCategory`), which is what the acceptance scenarios observe. Pre-existing, out of scope, recorded as a follow-up in `STATE.md`.
