# Phase 19 Verification

Date: 2026-10-08. Branch: `feature/phase-14-image-editor-annotations` (worktree). Dev server `:3022`, Chrome DevTools MCP, 400×300 PNG fixture.

## Command gates

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `npx vitest run` (from `apps/web`) | 294 / 294 pass |
| Type check | `npx vue-tsc --noEmit` | pass |
| Build | `npx vite build` | pass (47.21 s) |
| Lint (changed files) | `npx eslint ImageEditor.vue SizeField.vue params-previews.ts` | clean |

## Browser verification (per finding)

| AC | Check | Evidence |
|----|-------|----------|
| AC-1 | fill colour pickers 32 px | shape tool + fill on → both `.param-color` measure 32×42 px (was 850 / 6) |
| AC-2 | SizeField slider stays open | `mouseenter` opens popover; `mouseleave` then 80 ms → popover still in DOM; popover `mouseenter` keeps it open |
| AC-3 | arrow SVG not clipped | end-arrow = triangle → closed-select SVG measures 58×18 px, `svgOverflow:false`, polygon present |
| AC-4 | stroke select 96 px | `.param-select` computed width 96 px |
| AC-5 | number-format sequences | dropdown options text: `1, 2, 3` / `a, b, c` / `A, B, C` / `i, ii, iii` / `I, II, III` |
| AC-6 | leader click vs drag | plain click → `leaderLine: null`; press-drag-release → `leaderLine {enabled:true, points:[…]}` |
| AC-7 | text auto-selected | after Enter commit: `activeTool:"select"`, `selectedId:1` |
| AC-8 | cross-tool select | shape tool + click existing text → `activeTool:"select"`, `selectedId:1` |
| AC-9 | SizeField icons | shape strip shows 2 `.size-field__icon` for 2 SizeFields; icons assigned per parameter across all tools |

## Acceptance check-off

All AC-1 … AC-10 pass. See ACCEPTANCE.md.
