# Sidebar Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move category navigation from a horizontal card grid into a collapsible left sidebar, with a settings toggle to switch between anchor-scroll mode and page-navigation mode.

**Architecture:** A new `AppLayout.vue` wraps `<RouterView />` conditionally (controlled by route `meta.showSidebar`), providing a persistent `NLayoutSider` with category list, logo, theme/locale controls. HomePage gains anchor `id` attributes on each category section. A preferences store field `sidebarMode` (`'anchor' | 'navigate'`) drives click behavior.

**Tech Stack:** Vue 3 + Composition API, Pinia, Naive UI (`NLayout`, `NLayoutSider`, `NLayoutContent`, `NTooltip`), UnoCSS, vue-router, vue-i18n, `@toolnest/shared` (`TOOL_CATEGORIES`)

**Spec:** Brainstorming session 2026-09-17 (approved design)

## Global Constraints

- Vue 3 Composition API only; `useI18n()` only inside component `setup()`, never in Pinia stores
- Naive UI for all UI primitives; UnoCSS for layout/utility classes
- Theme colors: primary `#18a058`; dark bg `#101014`; light bg `#fafafc`
- Sidebar collapsed width: 60px; expanded width: 240px
- Preferences persisted to `localStorage` and synced to server via existing `save()` API
- All existing i18n keys (`zh.json`, `en.json`) must be updated for new UI strings
- Dark mode must work via `html.dark` class toggle (existing pattern)

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `apps/web/src/layouts/AppLayout.vue` | Global sidebar layout: sider (logo + categories + footer controls) + content slot |
| Modify | `apps/web/src/stores/preferences.store.ts` | Add `sidebarMode` and `sidebarCollapsed` state + persistence |
| Modify | `apps/web/src/router/index.ts` | Add `meta.showSidebar` to routes; handle anchor-mode redirect for `/tools/:category` |
| Modify | `apps/web/src/App.vue` | Conditionally wrap `<RouterView />` with `AppLayout` |
| Modify | `apps/web/src/pages/HomePage.vue` | Remove AppNavbar; remove category card grid; add anchor `id` attrs to category sections |
| Modify | `apps/web/src/pages/CategoryPage.vue` | Remove AppNavbar (provided by layout) |
| Modify | `apps/web/src/layouts/ToolLayout.vue` | Remove AppNavbar (provided by layout) |
| Modify | `apps/web/src/pages/SettingsPage.vue` | Remove AppNavbar; add sidebar mode toggle |
| Modify | `apps/web/src/locales/zh.json` | Add new i18n keys for sidebar, layout mode |
| Modify | `apps/web/src/locales/en.json` | Add new i18n keys for sidebar, layout mode |
| Delete | `apps/web/src/components/AppNavbar.vue` | Functionality moved to sidebar |

---

### Task 1: Preferences Store — Add Sidebar State

**Files:**
- Modify: `apps/web/src/stores/preferences.store.ts`
- Modify: `packages/shared/src/tool-types.ts` (UserPreferences interface)

**Interfaces:**
- Produces: `sidebarMode: Ref<'anchor' | 'navigate'>`, `sidebarCollapsed: Ref<boolean>`, `setSidebarMode(mode)`, `toggleSidebarCollapsed()`

- [ ] **Step 1: Add fields to UserPreferences type**

In `packages/shared/src/tool-types.ts`, add to `UserPreferences.settings` — no type change needed since `settings: Record<string, unknown>` already accommodates it. We'll use the `settings` bag for `sidebarMode` and `sidebarCollapsed`.

- [ ] **Step 2: Add sidebar state to preferences store**

In `apps/web/src/stores/preferences.store.ts`, add after the locale management section (around line 72):

```typescript
// ── Sidebar management ──────────────────────────────────────────
const sidebarMode = computed<'anchor' | 'navigate'>({
  get: () => (prefs.value.settings.sidebarMode as 'anchor' | 'navigate') || 'anchor',
  set: (val: 'anchor' | 'navigate') => {
    prefs.value.settings.sidebarMode = val;
    localStorage.setItem('toolnest-sidebar-mode', val);
  },
});

const sidebarCollapsed = ref<boolean>(
  localStorage.getItem('toolnest-sidebar-collapsed') === 'true'
);

function setSidebarMode(mode: 'anchor' | 'navigate') {
  sidebarMode.value = mode;
  save({ settings: prefs.value.settings });
}

function toggleSidebarCollapsed() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem('toolnest-sidebar-collapsed', String(sidebarCollapsed.value));
}
```

- [ ] **Step 3: Add to return object**

Add to the store's return object:

```typescript
// sidebar
sidebarMode,
sidebarCollapsed,
setSidebarMode,
toggleSidebarCollapsed,
```

- [ ] **Step 4: Initialize from localStorage in load()**

In the `load()` function, after `applyTheme()` and `setLocale()` calls (around line 101), add:

```typescript
const savedMode = localStorage.getItem('toolnest-sidebar-mode');
if (savedMode === 'anchor' || savedMode === 'navigate') {
  prefs.value.settings.sidebarMode = savedMode;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/stores/preferences.store.ts packages/shared/src/tool-types.ts
git commit -m "feat: add sidebar mode and collapsed state to preferences store"
```

---

### Task 2: i18n — Add New Translation Keys

**Files:**
- Modify: `apps/web/src/locales/zh.json`
- Modify: `apps/web/src/locales/en.json`

**Interfaces:**
- Produces: New keys `settings.sidebarMode`, `settings.sidebarModeAnchor`, `settings.sidebarModeNavigate`, `settings.layoutMode`, `nav.allCategories`

- [ ] **Step 1: Add keys to zh.json**

In `apps/web/src/locales/zh.json`, add inside the `"settings"` object (after `"data"` section):

```json
"sidebarMode": "分类点击行为",
"sidebarModeAnchor": "页面内滚动",
"sidebarModeNavigate": "跳转独立页面",
"layoutMode": "布局模式",
```

Add inside the `"nav"` object:

```json
"allCategories": "所有分类",
```

- [ ] **Step 2: Add keys to en.json**

In `apps/web/src/locales/en.json`, add inside the `"settings"` object:

```json
"sidebarMode": "Category Click Behavior",
"sidebarModeAnchor": "Scroll on Page",
"sidebarModeNavigate": "Navigate to Page",
"layoutMode": "Layout Mode",
```

Add inside the `"nav"` object:

```json
"allCategories": "All Categories",
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/locales/zh.json apps/web/src/locales/en.json
git commit -m "feat: add i18n keys for sidebar mode and layout settings"
```

---

### Task 3: AppLayout — Create Sidebar Layout Component

**Files:**
- Create: `apps/web/src/layouts/AppLayout.vue`

**Interfaces:**
- Consumes: `usePreferencesStore` (sidebarMode, sidebarCollapsed, toggleSidebarCollapsed), `TOOL_CATEGORIES` from `@toolnest/shared`, `useRoute`/`useRouter` from `vue-router`, `useI18n`
- Produces: Layout wrapper with sidebar + `<RouterView />` in content area

- [ ] **Step 1: Create AppLayout.vue**

Create `apps/web/src/layouts/AppLayout.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { NLayout, NLayoutSider, NLayoutContent, NTooltip, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { TOOL_CATEGORIES } from '@toolnest/shared';
import { usePreferencesStore } from '@/stores/preferences.store';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const preferencesStore = usePreferencesStore();

const collapsed = computed(() => preferencesStore.sidebarCollapsed);

const sortedCategories = computed(() =>
  [...TOOL_CATEGORIES].sort((a, b) => a.order - b.order)
);

const activeCategory = computed(() => {
  if (route.name === 'category') return route.params.category as string;
  if (route.meta.category) return route.meta.category as string;
  return null;
});

function handleCategoryClick(categoryName: string) {
  if (preferencesStore.sidebarMode === 'navigate') {
    router.push(`/tools/${categoryName}`);
  } else {
    // Anchor mode: go to home and scroll
    if (route.path !== '/') {
      router.push(`/#${categoryName}`);
    } else {
      const el = document.getElementById(`category-${categoryName}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function goHome() {
  router.push('/');
}
</script>

<template>
  <NLayout has-sider style="min-height: 100vh;">
    <NLayoutSider
      :collapsed="collapsed"
      :width="240"
      :collapsed-width="60"
      :native-scrollbar="false"
      bordered
      :show-trigger="true"
      @collapse="preferencesStore.toggleSidebarCollapsed()"
      @expand="preferencesStore.toggleSidebarCollapsed()"
      collapse-mode="width"
      style="position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;"
    >
      <!-- Logo -->
      <div
        style="padding: 16px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--n-border-color);"
        @click="goHome"
      >
        <span style="font-size: 20px; font-weight: bold; white-space: nowrap; overflow: hidden;">
          {{ collapsed ? 'T' : 'ToolNest' }}
        </span>
      </div>

      <!-- Category list -->
      <div style="padding: 8px 0;">
        <div
          v-for="cat in sortedCategories"
          :key="cat.name"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: collapsed ? '10px 0' : '10px 16px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            cursor: 'pointer',
            borderRadius: '6px',
            margin: '2px 8px',
            backgroundColor: activeCategory === cat.name ? 'rgba(24,160,88,0.12)' : 'transparent',
            color: activeCategory === cat.name ? '#18a058' : undefined,
            transition: 'background-color 0.2s',
          }"
          @click="handleCategoryClick(cat.name)"
        >
          <NTooltip v-if="collapsed" placement="right">
            <template #trigger>
              <span style="font-size: 18px; flex-shrink: 0;">{{ getCategoryEmoji(cat.name) }}</span>
            </template>
            {{ t(cat.label) }}
          </NTooltip>
          <template v-else>
            <span style="font-size: 18px; flex-shrink: 0;">{{ getCategoryEmoji(cat.name) }}</span>
            <span style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ t(cat.label) }}
            </span>
          </template>
        </div>
      </div>

      <!-- Footer: theme + locale -->
      <template #bottom>
        <div style="padding: 12px 16px; border-top: 1px solid var(--n-border-color); display: flex; align-items: center; justify-content: space-between;">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </template>
    </NLayoutSider>

    <NLayoutContent
      :style="{ marginLeft: collapsed ? '60px' : '240px', transition: 'margin-left 0.3s' }"
    >
      <RouterView />
    </NLayoutContent>
  </NLayout>
</template>

<script lang="ts">
function getCategoryEmoji(name: string): string {
  const map: Record<string, string> = {
    'crypto': '🔒', 'converter': '🔄', 'web': '🌐', 'developer': '💻',
    'network': '📡', 'text': '📝', 'data': '📊', 'image': '🖼️',
    'video': '🎬', 'audio': '🔊', 'pdf': '📄', 'math': '🧮',
    'measurement': '📏', 'generator': '⚡', 'network-test': '📶', 'platform': '⚙️',
  };
  return map[name] || '📦';
}
export default {};
</script>

<style>
html.dark .n-layout-sider {
  background: #18181c !important;
}
</style>
```

**Note:** The `getCategoryEmoji` function uses a plain `<script>` block (non-setup) because it's a pure utility, not reactive. Alternatively it could be in the setup block — either is fine.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/layouts/AppLayout.vue
git commit -m "feat: create AppLayout with sidebar categories, logo, and footer controls"
```

---

### Task 4: Router — Add showSidebar Meta + Anchor Redirect

**Files:**
- Modify: `apps/web/src/router/index.ts`

**Interfaces:**
- Consumes: `usePreferencesStore` (not directly — this is route config)
- Produces: Routes with `meta.showSidebar`; anchor-mode redirect logic in category route `beforeEnter`

- [ ] **Step 1: Add meta.showSidebar to routes**

In `apps/web/src/router/index.ts`, modify the routes array:

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { showSidebar: true },
  },
  {
    path: '/tools/:category',
    name: 'category',
    component: () => import('@/pages/CategoryPage.vue'),
    meta: { showSidebar: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { showSidebar: false },
  },
  {
    path: '/reports/:id',
    name: 'report',
    component: () => import('@/pages/ReportPage.vue'),
    meta: { showSidebar: false },
  },
  // 工具路由（放在 404 之前）
  ...toolRoutes.map(r => ({ ...r, meta: { ...r.meta, showSidebar: true } })),
  // 历史 URL 重定向
  ...redirectRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { showSidebar: false },
  },
];
```

- [ ] **Step 2: Add anchor-mode redirect for /tools/:category**

Add a `beforeEnter` guard to the category route. This requires importing the store at route level — instead, use a dynamic check inside the component. We'll handle this in Task 6 (CategoryPage). For the router, just add the meta.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/router/index.ts
git commit -m "feat: add showSidebar meta to all routes"
```

---

### Task 5: App.vue — Conditionally Wrap with AppLayout

**Files:**
- Modify: `apps/web/src/App.vue`

**Interfaces:**
- Consumes: `useRoute` to check `meta.showSidebar`, `AppLayout` component
- Produces: Conditional layout wrapping

- [ ] **Step 1: Update App.vue template and script**

Replace the contents of `apps/web/src/App.vue`:

```vue
<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider, darkTheme, type GlobalThemeOverrides } from 'naive-ui';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePreferencesStore } from './stores/preferences.store';
import CommandPalette from './components/CommandPalette.vue';
import AppLayout from './layouts/AppLayout.vue';

const route = useRoute();
const preferencesStore = usePreferencesStore();

const theme = computed(() => preferencesStore.isDark ? darkTheme : null);
const showSidebar = computed(() => route.meta.showSidebar === true);

const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
    primaryColorSuppl: '#36ad6a',
    borderRadius: '6px',
  },
}));
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides" style="min-height: 100vh;">
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <AppLayout v-if="showSidebar">
            <RouterView />
          </AppLayout>
          <RouterView v-else />
          <CommandPalette />
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
* {
  transition: background-color 0.3s ease, color 0.2s ease, border-color 0.3s ease;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
```

**Important:** `AppLayout` uses a `<RouterView />` internally in its `NLayoutContent`. But wait — we also have `<RouterView />` as the child of `<AppLayout>` in the template above. We need AppLayout to use `<slot />` instead of `<RouterView />` internally.

**Correction for Task 3:** In `AppLayout.vue`, replace `<RouterView />` inside `NLayoutContent` with `<slot />`. Then `App.vue` passes `<RouterView />` as the slot content. This is the correct pattern.

Update `AppLayout.vue` NLayoutContent to:

```vue
<NLayoutContent
  :style="{ marginLeft: collapsed ? '60px' : '240px', transition: 'margin-left 0.3s' }"
>
  <slot />
</NLayoutContent>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/App.vue apps/web/src/layouts/AppLayout.vue
git commit -m "feat: wrap RouterView with AppLayout conditionally based on route meta"
```

---

### Task 6: HomePage — Remove AppNavbar, Add Anchor IDs

**Files:**
- Modify: `apps/web/src/pages/HomePage.vue`

**Interfaces:**
- Consumes: `usePreferencesStore` (sidebarMode), `useToolStore`, `useSearchStore`, `TOOL_CATEGORIES`
- Produces: HomePage with anchor `id` attributes on category sections; no AppNavbar; no category card grid

- [ ] **Step 1: Rewrite HomePage.vue**

Replace `apps/web/src/pages/HomePage.vue`:

```vue
<script setup lang="ts">
import { NH2, NP, NGrid, NGi, NDivider, NEmpty } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import SearchBar from '@/components/SearchBar.vue';
import ToolCard from '@/components/ToolCard.vue';
import TagFilter from '@/components/TagFilter.vue';
import { useToolStore } from '@/stores/tool.store';
import { useSearchStore } from '@/stores/search.store';
import { TOOL_CATEGORIES } from '@toolnest/shared';

const { t } = useI18n();
const toolStore = useToolStore();
const searchStore = useSearchStore();

const isSearching = computed(() =>
  searchStore.query.trim() || searchStore.selectedTags.length > 0 || searchStore.selectedCategory
);

const sortedCategories = computed(() =>
  [...TOOL_CATEGORIES].sort((a, b) => a.order - b.order)
);
</script>

<template>
  <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
    <!-- Hero section with search -->
    <div style="text-align: center; padding: 32px 0 24px;">
      <NH2 style="margin-bottom: 4px;">{{ t('home.welcome') }}</NH2>
      <NP depth="3" style="margin-bottom: 24px;">{{ t('home.welcomeDesc') }}</NP>
      <SearchBar size="large" />
    </div>

    <!-- Tag filter (always visible) -->
    <div v-if="searchStore.allTags.length > 0" style="margin-bottom: 24px;">
      <TagFilter />
    </div>

    <!-- Search results -->
    <div v-if="isSearching">
      <NP depth="3" style="margin-bottom: 16px;">
        {{ t('search.resultCount', { count: searchStore.results.length }) }}
      </NP>
      <NGrid v-if="searchStore.results.length > 0" :x-gap="16" :y-gap="16" :cols="3" responsive="screen" :collapsed-rows="999">
        <NGi v-for="tool in searchStore.results" :key="tool.path">
          <ToolCard :tool="tool" />
        </NGi>
      </NGrid>
      <NEmpty v-else :description="t('home.noResults')" style="padding: 48px 0;" />
    </div>

    <!-- Normal home view -->
    <div v-else>
      <!-- Favorites -->
      <div v-if="toolStore.favoriteTools.length > 0" style="margin-bottom: 32px;">
        <NDivider title-placement="left">{{ t('home.favoriteTools') }}</NDivider>
        <NGrid :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
          <NGi v-for="tool in toolStore.favoriteTools" :key="tool.path">
            <ToolCard :tool="tool" />
          </NGi>
        </NGrid>
      </div>

      <!-- Recent tools -->
      <div v-if="toolStore.recentToolsList.length > 0" style="margin-bottom: 32px;">
        <NDivider title-placement="left">{{ t('home.recentTools') }}</NDivider>
        <NGrid :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
          <NGi v-for="tool in toolStore.recentToolsList" :key="tool.path">
            <ToolCard :tool="tool" />
          </NGi>
        </NGrid>
      </div>

      <!-- All tools by category (with anchor IDs) -->
      <div v-if="toolStore.tools.length > 0">
        <NDivider title-placement="left">{{ t('home.allTools') }}</NDivider>
        <template v-for="cat in sortedCategories" :key="cat.name">
          <div
            v-if="toolStore.toolsByCategory.get(cat.name)?.length"
            :id="`category-${cat.name}`"
            style="margin-bottom: 24px; scroll-margin-top: 24px;"
          >
            <h3 style="margin: 0 0 12px; font-size: 16px;">
              {{ t(cat.label) }}
              <span style="font-weight: normal; opacity: 0.5; font-size: 13px; margin-left: 8px;">
                {{ toolStore.toolsByCategory.get(cat.name)?.length }}
              </span>
            </h3>
            <NGrid :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
              <NGi v-for="tool in toolStore.toolsByCategory.get(cat.name)" :key="tool.path">
                <ToolCard :tool="tool" />
              </NGi>
            </NGrid>
          </div>
        </template>
      </div>

      <NEmpty v-if="toolStore.tools.length === 0" description="No tools installed yet" style="padding: 48px 0;" />
    </div>
  </div>
</template>
```

Key changes:
- Removed `NLayout`, `NLayoutHeader`, `NLayoutContent` wrappers (layout provided by AppLayout)
- Removed `AppNavbar` import and usage
- Removed the "Browse Categories" card grid section (categories now in sidebar)
- Added `:id="'category-${cat.name}'"` to each category section for anchor scrolling
- Added `scroll-margin-top: 24px` for proper scroll positioning

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/HomePage.vue
git commit -m "feat: remove AppNavbar and category grid from HomePage, add anchor IDs"
```

---

### Task 7: CategoryPage — Remove AppNavbar, Add Anchor-Mode Redirect

**Files:**
- Modify: `apps/web/src/pages/CategoryPage.vue`

**Interfaces:**
- Consumes: `usePreferencesStore` (sidebarMode), `useRoute`, `useRouter`
- Produces: CategoryPage without AppNavbar; redirects to home anchor in anchor mode

- [ ] **Step 1: Update CategoryPage.vue**

```vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { NGrid, NGi, NBreadcrumb, NBreadcrumbItem, NEmpty, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import ToolCard from '@/components/ToolCard.vue';
import { useToolStore } from '@/stores/tool.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { TOOL_CATEGORIES } from '@toolnest/shared';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toolStore = useToolStore();
const preferencesStore = usePreferencesStore();

const categoryName = computed(() => route.params.category as string);

const categoryDef = computed(() =>
  TOOL_CATEGORIES.find(c => c.name === categoryName.value)
);

const tools = computed(() =>
  toolStore.getToolsByCategory(categoryName.value as any)
);

// In anchor mode, redirect to home with hash
onMounted(() => {
  if (preferencesStore.sidebarMode === 'anchor') {
    router.replace(`/#${categoryName.value}`);
  }
});
</script>

<template>
  <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
    <NBreadcrumb style="margin-bottom: 16px;">
      <NBreadcrumbItem @click="router.push('/')" style="cursor: pointer;">
        {{ t('nav.home') }}
      </NBreadcrumbItem>
      <NBreadcrumbItem>
        {{ categoryDef ? t(categoryDef.label) : categoryName }}
      </NBreadcrumbItem>
    </NBreadcrumb>

    <div style="margin-bottom: 24px;">
      <h1 style="margin: 0 0 8px;">{{ categoryDef ? t(categoryDef.label) : categoryName }}</h1>
      <p v-if="categoryDef" style="margin: 0; opacity: 0.6;">{{ t(categoryDef.description) }}</p>
    </div>

    <NGrid v-if="tools.length > 0" :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
      <NGi v-for="tool in tools" :key="tool.path">
        <ToolCard :tool="tool" />
      </NGi>
    </NGrid>
    <NEmpty v-else :description="t('home.noResults')" style="padding: 48px 0;">
      <template #extra>
        <NButton size="small" @click="router.push('/')">{{ t('common.back') }}</NButton>
      </template>
    </NEmpty>
  </div>
</template>
```

Key changes:
- Removed `NLayout`, `NLayoutHeader` wrappers
- Removed `AppNavbar` import and usage
- Added `onMounted` redirect to `/#category` in anchor mode

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/CategoryPage.vue
git commit -m "feat: remove AppNavbar from CategoryPage, add anchor-mode redirect"
```

---

### Task 8: ToolLayout — Remove AppNavbar

**Files:**
- Modify: `apps/web/src/layouts/ToolLayout.vue`

**Interfaces:**
- Consumes: Same props and stores as before, minus AppNavbar
- Produces: Tool layout without top navbar (provided by global sidebar layout)

- [ ] **Step 1: Update ToolLayout.vue**

Remove the `<AppNavbar />` line and its import. Remove the `.tool-page-wrapper` background style (now handled by the global layout). Update the template:

In the `<script setup>` section, remove:
```typescript
import AppNavbar from '@/components/AppNavbar.vue';
```

In the template, replace:
```vue
<div class="tool-page-wrapper">
    <AppNavbar />
    <div class="tool-layout">
```
with:
```vue
<div class="tool-layout">
```

And remove the closing `</div>` for `tool-page-wrapper` (the one at line 101).

In the `<style scoped>` section, remove the `.tool-page-wrapper` rule and the `html.dark .tool-page-wrapper` rule.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/layouts/ToolLayout.vue
git commit -m "feat: remove AppNavbar from ToolLayout"
```

---

### Task 9: SettingsPage — Add Sidebar Mode Toggle, Remove AppNavbar

**Files:**
- Modify: `apps/web/src/pages/SettingsPage.vue`

**Interfaces:**
- Consumes: `usePreferencesStore` (sidebarMode, setSidebarMode)
- Produces: Settings page with new "Layout Mode" card; no AppNavbar

- [ ] **Step 1: Update SettingsPage.vue**

Replace the full file:

```vue
<script setup lang="ts">
import { NCard, NSelect, NRadioGroup, NRadioButton, NSwitch, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import { usePreferencesStore } from '@/stores/preferences.store';

const { t } = useI18n();
const preferencesStore = usePreferencesStore();

onMounted(() => {
  if (!preferencesStore.loaded) {
    preferencesStore.load();
  }
});

const languageOptions = [
  { label: '简体中文', value: 'zh' },
  { label: 'English', value: 'en' },
];

const currentLanguage = computed({
  get: () => preferencesStore.prefs.language,
  set: (val: string) => {
    preferencesStore.setLocale(val);
    preferencesStore.save({ language: val });
  },
});

const themeMode = computed({
  get: () => preferencesStore.prefs.theme,
  set: (val: 'light' | 'dark' | 'system') => {
    preferencesStore.setMode(val);
    preferencesStore.save({ theme: val });
  },
});

const sidebarMode = computed({
  get: () => preferencesStore.sidebarMode,
  set: (val: 'anchor' | 'navigate') => {
    preferencesStore.setSidebarMode(val);
  },
});
</script>

<template>
  <div style="padding: 24px; max-width: 800px; margin: 0 auto;">
    <h1 style="margin: 0 0 24px;">{{ t('settings.title') }}</h1>

    <NAlert v-if="preferencesStore.syncError" type="warning" style="margin-bottom: 24px;">
      {{ preferencesStore.syncError }}
    </NAlert>

    <!-- Language -->
    <NCard style="margin-bottom: 16px;">
      <template #header>{{ t('settings.language') }}</template>
      <NSelect
        :value="currentLanguage"
        :options="languageOptions"
        @update:value="(val: string) => currentLanguage = val"
        style="max-width: 300px;"
      />
    </NCard>

    <!-- Theme -->
    <NCard style="margin-bottom: 16px;">
      <template #header>{{ t('settings.theme') }}</template>
      <NRadioGroup :value="themeMode" @update:value="(val: 'light' | 'dark' | 'system') => themeMode = val">
        <NRadioButton value="light">{{ t('settings.themeLight') }}</NRadioButton>
        <NRadioButton value="dark">{{ t('settings.themeDark') }}</NRadioButton>
        <NRadioButton value="system">{{ t('settings.themeSystem') }}</NRadioButton>
      </NRadioGroup>
    </NCard>

    <!-- Layout Mode -->
    <NCard style="margin-bottom: 16px;">
      <template #header>{{ t('settings.layoutMode') }}</template>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 14px;">{{ t('settings.sidebarModeAnchor') }}</span>
        <NSwitch
          :value="sidebarMode === 'navigate'"
          @update:value="(val: boolean) => sidebarMode = val ? 'navigate' : 'anchor'"
        />
        <span style="font-size: 14px;">{{ t('settings.sidebarModeNavigate') }}</span>
      </div>
      <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.6;">
        {{ sidebarMode === 'anchor' ? t('settings.sidebarModeAnchor') : t('settings.sidebarModeNavigate') }}
      </p>
    </NCard>

    <!-- Data Management -->
    <NCard>
      <template #header>{{ t('settings.data') }}</template>
      <NSpace vertical>
        <div>
          <p style="margin: 0 0 8px; opacity: 0.7;">{{ t('settings.favoritesCount', { count: preferencesStore.prefs.favorites.length }) }}</p>
          <p style="margin: 0; opacity: 0.7;">{{ t('settings.recentCount', { count: preferencesStore.prefs.recentTools.length }) }}</p>
        </div>
        <NSpace>
          <NButton
            size="small"
            @click="preferencesStore.save({ favorites: [], recentTools: [] })"
          >
            {{ t('settings.clearData') }}
          </NButton>
        </NSpace>
      </NSpace>
    </NCard>
  </div>
</template>
```

Key changes:
- Removed `NLayout`, `NLayoutHeader`, `NLayoutContent` wrappers (no sidebar on settings page)
- Removed `AppNavbar` import and usage
- Added "Layout Mode" card with `NSwitch` toggle between anchor and navigate modes

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/SettingsPage.vue
git commit -m "feat: add sidebar mode toggle to Settings, remove AppNavbar"
```

---

### Task 10: Delete AppNavbar Component

**Files:**
- Delete: `apps/web/src/components/AppNavbar.vue`

**Interfaces:**
- Consumed by: No longer imported anywhere after Tasks 6-9

- [ ] **Step 1: Verify no remaining imports**

Run: `grep -r "AppNavbar" apps/web/src/`
Expected: No results (all pages have been updated to remove the import)

- [ ] **Step 2: Delete the file**

Delete `apps/web/src/components/AppNavbar.vue`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove AppNavbar component (replaced by sidebar layout)"
```

---

### Task 11: Verification — Build and Visual Check

**Files:**
- All files from previous tasks

- [ ] **Step 1: Run build check**

Run: `cd apps/web && npx vue-tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Run dev server**

Run: `pnpm dev`
Expected: App starts without errors

- [ ] **Step 3: Visual verification checklist**

Open browser and verify:
1. Home page shows left sidebar with categories, logo, theme/locale controls
2. Clicking a category in anchor mode scrolls to that section smoothly
3. Navigate to Settings → toggle to "Navigate" mode → clicking category navigates to `/tools/:category`
4. Sidebar collapse/expand works; state persists after page reload
5. Settings page has no sidebar (only content area)
6. Tool detail pages show sidebar
7. Dark mode works correctly with sidebar
8. Language switch works from sidebar footer

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve issues found during verification"
```
