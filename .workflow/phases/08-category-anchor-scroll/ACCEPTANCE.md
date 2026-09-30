# Acceptance verification

Requirement: R-002 (unified routing, search, categories, tags, favorites, recents, themes, bilingual UI). User report 2026-09-30 — clicking a sidebar category from a tool page lands on the top of the home page instead of scrolling to that category's section.

Performed by the agent on 2026-09-30 against the dev server on `http://localhost:3000` (Vite serving this working tree, Chrome via the Chrome DevTools MCP, tab brought to the front for the measured runs). Every number below is what the browser returned.

## Before the change

| Step | Observed |
| --- | --- |
| On `/markdown-to-html` (scrollY 0), click 开发者 | URL `http://localhost:3000/#developer`, `window.scrollY` **0**; the intended section `#category-developer` sits at document offset **3304** (`scrollHeight` 12689) |
| From `/#developer` at scrollY 2600, `router.push('/#category-developer')` with the element present | `window.scrollY` **0** — isolates the router's `scrollBehavior: () => ({ top: 0 })` from the hash/id mismatch |

## After the change

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| R-002 | Clicking a sidebar category on a tool page scrolls to that category's section | `/markdown-to-html` (scrollY 0) → click 开发者 → URL `/#category-developer`, `window.scrollY` **3280**, `#category-developer` viewport top **24 px**, active sidebar item `💻开发者` | PASS |
| R-002 | A category URL entered directly in anchor mode redirects to the same section | `router.push('/tools/crypto')` → URL `/#category-crypto`, `window.scrollY` **380**, `#category-crypto` viewport top **24 px** | PASS |
| R-002 | Clicking a category while already on the home page keeps working (the pre-existing in-place path) | Home page at scrollY 0 → click 网络测试 → `window.scrollY` **11492**, `#category-network-test` viewport top **24 px** (`docTop` 11516) | PASS |
| R-002 | Navigation without a hash still starts at the top | Home page scrolled to **11183** → `router.push('/audio-trim')` → `window.scrollY` **0** | PASS |
| R-002 | The home link on a tool page still starts at the top | `/audio-trim` scrolled to **1200** → click the 首页 breadcrumb → URL `/`, `window.scrollY` **0** | PASS |
| R-002 | Every sidebar category resolves to a rendered section | Inventory of the home page: **16** sidebar items and **16** sections, ids `category-crypto`, `category-converter`, `category-web`, `category-developer`, `category-network`, `category-text`, `category-data`, `category-image`, `category-video`, `category-audio`, `category-pdf`, `category-math`, `category-measurement`, `category-generator`, `category-network-test`, `category-platform` — one per category, no category without a section | PASS |
| R-002 | The link and the section id cannot drift apart again | New `apps/web/src/utils/category-anchor.test.ts`: asserts `categoryAnchorId('developer') === 'category-developer'` and `categoryAnchorHref('network-test') === '/#category-network-test'`, and that `AppLayout.vue`, `CategoryPage.vue` and `HomePage.vue` all build the anchor through the shared module. RED before the module existed, GREEN after (5 tests) | PASS |
| R-002 | No new console noise (vue-router warns when a hash target is missing) | Console after the whole scenario set: 1 issue, the pre-existing unrelated "A form field element should have an id or name attribute"; no "Couldn't find element using selector" warning | PASS |

## Limitations

- The tab must be in the foreground for the smooth scroll to animate; see `VERIFICATION.md` "Not verified" for the background-tab traces and why the acceptance numbers were re-measured in the foreground.
- `navigate` mode, the unreachable empty-category fallback, and the sidebar's active-highlight-while-scrolling behaviour are listed in `VERIFICATION.md` as not covered by this phase.
