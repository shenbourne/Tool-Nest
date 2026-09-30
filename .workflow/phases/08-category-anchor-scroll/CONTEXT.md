# Phase context

- Phase: 08 — Sidebar category clicks land on the category, not the top of the home page
- Goal: In anchor mode, clicking a category in the persistent sidebar (from a tool page, a category page, or a home page already scrolled elsewhere) brings the home page to that category's section instead of resetting to the top.
- Requirements: R-002 (unified routing, search, categories, tags, favorites, recents, themes, bilingual UI)
- Constraints: Vue 3 + naive-ui + vue-router 4.6.4; bilingual copy untouched (no new strings); no new runtime dependency; the sidebar's two modes (`anchor` = scroll on the home page, `navigate` = `/tools/:category`) keep their current meaning.
- Decisions already made: `docs/superpowers/plans/2026-09-17-sidebar-categories.md` defines anchor mode as "go to home and scroll" and already uses the section id prefix `category-` on the home page; this phase keeps that id format and makes the navigation hash agree with it.
- Open questions: none. The user report names the expected behavior (scroll to the target category), so no scope decision is pending.
- Boundary: IN scope — the hash the sidebar and the category page navigate to, the home page's section ids, and the router's scroll behavior for a hashed navigation. OUT of scope — the `navigate` mode's category page layout, the sidebar's active-item highlight when the user scrolls home manually (the `IntersectionObserver` in `AppLayout.vue` only observes the elements present when the layout mounts; recorded as a follow-up), the `settings.sidebarMode` toggle, and the tool pages themselves.

## User report (evidence)

User report 2026-09-30 (screenshot of `/markdown-to-html`): "修复在工具界面点击红圈的分类时会默认回到首页页顶，而不是自动滚动到目标分类位置的问题" — clicking the circled sidebar category (开发者) returns to the top of the home page instead of scrolling to the circled section.

Reproduced on the dev server (`http://localhost:3000`, Chrome DevTools MCP) before any change:

1. On `/markdown-to-html` (a tool page, scrollY 0), clicking 开发者 navigates to `http://localhost:3000/#developer` and `window.scrollY` stays **0**. The intended section exists but is at document offset **3304px** (`#category-developer`, `document.documentElement.scrollHeight` 12689).
2. Navigating with the *correct* hash isolates the second cause: from `/#developer` at `scrollY 2600`, `router.push('/#category-developer')` (element present) still lands at `scrollY 0`.

## Root cause

Two defects that compose into the reported symptom; both must be fixed for the click to land.

1. **The navigation hash never matches a rendered section.** Anchor mode pushes `/#${categoryName}` — e.g. `/#developer` (`AppLayout.vue:58`, and the same literal in `CategoryPage.vue:30` for the direct-URL/`anchor`-mode redirect) — while `HomePage.vue:80` renders the sections with `id="category-${cat.name}"`. The hash points at an id that does not exist, so `document.getElementById('developer')` is null.
2. **The router ignores hashes and forces the top.** `apps/web/src/router/index.ts:64` declares `scrollBehavior: () => ({ top: 0 })`. vue-router 4.6.4 calls the configured behavior after the route DOM has been patched (`dist/vue-router.mjs:1469` awaits `nextTick()`), and a defined `scrollBehavior` also suppresses the browser's own anchor jump, so a hashed navigation is unconditionally reset to the top — even when the target element exists (evidence item 2 above).

The working reference for the same intent is the in-place branch of `handleCategoryClick` (`AppLayout.vue:59-62`): it looks up `category-${name}` (the correct id) and calls `scrollIntoView({ behavior: 'smooth', block: 'start' })`, which is why clicking a category while already on the home page — before or after this phase — behaves correctly.

## Implementation notes

- One module owns the anchor format (`apps/web/src/utils/category-anchor.ts`); the three call sites (sidebar link, category-page redirect, home section id) consume it, so the hash and the id cannot drift apart again.
- The scroll offset (24px, previously only in the home page's inline `scroll-margin-top`) is shared by both scroll paths so landing on a section looks identical whichever path was taken.
- `scrollBehavior` keeps returning `{ top: 0 }` for navigations without a hash and when the target element is absent (an empty category renders no section), so ordinary navigation is unchanged.
