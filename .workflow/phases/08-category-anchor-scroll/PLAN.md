# Phase 08 plan

Deliverable: a sidebar category click in `anchor` mode always brings the home page to that category's section, and non-hashed navigation still lands at the top.

## 1. Test first (RED)

`apps/web/src/utils/category-anchor.test.ts` (vitest, node environment — the only runner configured for `apps/web`):

- Unit: `categoryAnchorId('developer') === 'category-developer'`, `categoryAnchorHref('network-test') === '/#category-network-test'`.
- Contract guard (same style as `apps/web/src/tools/tool-file-import-controls.test.ts`): `AppLayout.vue`, `CategoryPage.vue` and `HomePage.vue` must reference the shared helper (`categoryAnchorHref(`, `categoryAnchorId(`) instead of hand-building a hash or an id.

Run: `pnpm --filter @toolnest/web test` → expect RED (`category-anchor.ts` does not exist yet).

## 2. Share the anchor format

New `apps/web/src/utils/category-anchor.ts`:

```ts
export const CATEGORY_ANCHOR_OFFSET = 24;

export function categoryAnchorId(category: string): string {
  return `category-${category}`;
}

export function categoryAnchorHref(category: string): string {
  return `/#${categoryAnchorId(category)}`;
}
```

## 3. Point the producers at the helper

- `apps/web/src/layouts/AppLayout.vue` — `router.push(categoryAnchorHref(categoryName))`; the in-place branch keeps `scrollIntoView` but resolves its element with `categoryAnchorId`.
- `apps/web/src/pages/CategoryPage.vue` — `router.replace(categoryAnchorHref(categoryName.value))`.
- `apps/web/src/pages/HomePage.vue` — `:id="categoryAnchorId(cat.name)"`, and `scroll-margin-top` bound to `CATEGORY_ANCHOR_OFFSET` so both scroll paths use the same offset.

## 4. Honour the hash in the router

`apps/web/src/router/index.ts`:

```ts
scrollBehavior(to) {
  if (to.hash) {
    const el = document.getElementById(to.hash.slice(1));
    if (el) return { el, top: CATEGORY_ANCHOR_OFFSET, behavior: 'smooth' };
  }
  return { top: 0 };
}
```

`getElementById` (not `querySelector`) avoids escaping a hash id; `top` reproduces the section's `scroll-margin-top` offset; an absent element (empty category, or a stale hash) falls back to the previous top-of-page behavior instead of vue-router's "couldn't find element" no-op.

## 5. Verify

- `pnpm --filter @toolnest/web test` → GREEN.
- `pnpm type-check`, `pnpm build` (per-file differential lint for the changed files, since `pnpm lint` fails on the pre-existing baseline).
- Browser (Chrome DevTools MCP), all four cases: tool page → sidebar category; category page (`/tools/developer`) direct URL; home page scrolled → sidebar category; logo/home and an ordinary tool link still land at the top.

## 6. Records

`ACCEPTANCE.md` gets the measured scroll positions; `VERIFICATION.md` the commands and their output; `ROADMAP.md`/`STATE.md` record the phase and its branch.
