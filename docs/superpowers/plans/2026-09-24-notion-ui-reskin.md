# Notion 风格 UI 整体换肤 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Notion 的 design.md 对 ToolNest 前端做整体换肤——令牌体系 v2（青绿主色 + 暖灰中性色）、Naive UI 亮暗完整主题映射、壳层组件换肤、24 个工具文件硬编码颜色清零、DESIGN.md 重写为 v2 契约。

**Architecture:** 单一事实源 `tokens.css`（CSS 自定义属性，`:root` 亮色 / `html.dark` 暗色）→ 三方消费（UnoCSS theme、Naive themeOverrides、原生 CSS）。最高杠杆点是 Naive UI 主题映射：209 个工具页全部经由 Naive 组件渲染，主题一变全部继承。暗色由 `html.dark` class（CSS 变量）+ Naive `darkTheme` 对象（组件外观）双通道实现，`App.vue` 用 computed 选择对应 overrides。

**Tech Stack:** Vue 3 + TypeScript + Vite + Naive UI 2.35 + UnoCSS 0.62 + @fontsource/inter + pnpm monorepo

**Spec:** `docs/superpowers/specs/2026-09-24-notion-ui-reskin-design.md`（本计划逐条实现该 spec；执行者需同时阅读 spec 的"令牌体系 v2"一节）

## Global Constraints

- 工作目录：仓库根 `D:/Users/Projects/SelfProgram/tool-nest`；web 子项目为 `apps/web`（包名 `@toolnest/web`）
- 验证命令（在仓库根执行）：`pnpm --filter @toolnest/web type-check` / `test` / `lint` / `build` / `dev`
- lint 存量基线：68 个错误（M6 才清理），每个任务执行后错误数**不得增加**
- 测试基线：4 个用例，全部任务不得引入失败
- 令牌命名前缀：`--color-` / `--spacing-` / `--radius-` / `--font-` / `--shadow-` / `--motion-`
- 暗色切换机制：`preferences.store.ts` 通过 `document.documentElement.classList.toggle('dark')` 切 `html.dark`（控制 CSS 变量）；`App.vue` 给 `NConfigProvider` 传 `darkTheme` 对象（控制 Naive 组件）。两者必须同时生效
- 组件样式禁止硬编码 hex/rgba 颜色值；一律引用 `var(--color-*)` 令牌
- 暗色下**允许**使用阴影（深色阴影值，见 Task 2 令牌表）——v1 契约"暗色禁用阴影"已推翻
- 卡片 hover 抬升：`box-shadow: var(--shadow-card)` + `border-color: var(--color-hairline-strong)`
- 不覆盖 Naive 内部 class（如 `.n-button__content`）；只通过 themeOverrides 与 tokens.css 变量定制
- 走查截图存 `.scratch/ui-reskin-v2/`
- 分支：`refactor/notion-ui-reskin`，从 master 切出

---

### Task 1: 建分支 + 安装 @fontsource/inter 并接线

**Files:**
- Modify: `apps/web/package.json`（pnpm 命令改，不手编辑）
- Modify: `apps/web/src/main.ts`（字体 import）

**Interfaces:**
- Produces: `@fontsource/inter` 依赖（400/500/600/700 四个权重 css）；`--font-family-base` 令牌值以 `Inter` 开头（Task 2 定义），此处仅保证字体文件被加载

- [ ] **Step 1: 建分支**

```bash
cd D:/Users/Projects/SelfProgram/tool-nest
git checkout master
git checkout -b refactor/notion-ui-reskin
```

- [ ] **Step 2: 安装依赖**

```bash
pnpm --filter @toolnest/web add @fontsource/inter
```

预期：`apps/web/package.json` dependencies 新增 `"@fontsource/inter": "^5.x.x"`，pnpm-lock.yaml 更新。

- [ ] **Step 3: main.ts 引入字体（必须在 tokens.css 之前，确保 font-family 可用）**

`apps/web/src/main.ts` 在 `import './styles/tokens.css';` 之前插入四行：

```ts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
```

（原有 `import './styles/tokens.css';` 与 `import './styles/global.css';` 保留。）

- [ ] **Step 4: 验证**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test`
预期：type-check 通过；4 个测试通过。

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json apps/web/src/main.ts pnpm-lock.yaml
git commit -m "feat(ui): add @fontsource/inter font dependency"
```

---

### Task 2: tokens.css v2 全量重写

**Files:**
- Modify: `apps/web/src/styles/tokens.css`（整文件替换）

**Interfaces:**
- Consumes: 无
- Produces: 全套 v2 令牌（亮/暗）。后续所有任务引用的变量名以本文件为准。关键变化：
  - 主色绿 → 青绿；新增 `--color-link`、`--color-surface-soft`、`--color-hairline-strong`、`--color-muted`
  - canvas/surface 语义反转：canvas=页面底(白)，surface=区块底(暖灰)
  - `--color-text-2` / `--color-text-3` 名称保留（值改为暖灰 hex，不再是 rgba 黑）
  - 间距：`--spacing-section` 从 64 改为 80；64 档新名 `--spacing-xxxl`；新增 `section-lg 120 / section-xl 160 / section-xxl 200`
  - 圆角：新增 `--radius-xs: 2px`、`--radius-xxl: 16px`；`--radius-md` 仍为 6px、`--radius-lg` 仍为 8px
  - 阴影：暗色不再为 none，改用深色阴影值
  - 动效：`--motion-fast: 120ms`、`--motion-base: 160ms`、`--motion-slow: 240ms`、缓动 `cubic-bezier(0.2, 0, 0.2, 1)`

注意：`apps/web/src/styles/global.css` 经核实只引用令牌（`--font-family-base`、`--color-canvas`、`--color-ink`、`--motion-*`、`--color-text-2/3`、`--radius-sm`、`--color-primary`），全部名称在 v2 保留，**global.css 无需任何修改**。

- [ ] **Step 1: 整文件替换 tokens.css**

```css
:root {
  /* Semantic — primary (teal) */
  --color-primary: #0f766e;
  --color-primary-hover: #12897f;
  --color-primary-pressed: #0b5c56;
  --color-primary-soft: rgba(15, 118, 110, 0.1);
  --color-link: #0075de;

  /* Semantic — status */
  --color-success: #1aae39;
  --color-warning: #dd5b00;
  --color-error: #e03131;
  --color-info: #0075de;

  /* Neutral — warm gray ramp (Notion stone) */
  --color-canvas: #ffffff;
  --color-surface: #f6f5f4;
  --color-surface-soft: #fafaf9;
  --color-surface-2: #f0eeec;
  --color-hairline: #e5e3df;
  --color-hairline-strong: #c8c4be;
  --color-ink: #1a1a1a;
  --color-text-2: #5f5e5b;
  --color-text-3: #97958f;
  --color-muted: #bbb8b1;

  /* Spacing — 4px base, 12 tiers */
  --spacing-xxs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  --spacing-xxxl: 64px;
  --spacing-section: 80px;
  --spacing-section-lg: 120px;
  --spacing-section-xl: 160px;
  --spacing-section-xxl: 200px;

  /* Radius — 8 tiers */
  --radius-none: 0px;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-xxl: 16px;
  --radius-full: 9999px;

  /* Typography */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-family-mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;

  --font-size-display: 28px;
  --line-height-display: 36px;
  --font-size-heading-lg: 22px;
  --line-height-heading-lg: 30px;
  --font-size-heading-md: 18px;
  --line-height-heading-md: 26px;
  --font-size-body-md: 14px;
  --line-height-body-md: 22px;
  --font-size-body-sm: 13px;
  --line-height-body-sm: 19px;
  --font-size-caption: 12px;
  --line-height-caption: 18px;
  --font-size-code: 13px;
  --line-height-code: 20px;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Elevation — light theme (lifted, Notion-style) */
  --shadow-card: 0 1px 2px rgba(15, 15, 15, 0.04), 0 4px 12px rgba(15, 15, 15, 0.06);
  --shadow-popover: 0 4px 16px rgba(15, 15, 15, 0.1), 0 12px 32px rgba(15, 15, 15, 0.08);
  --shadow-modal: 0 8px 24px rgba(15, 15, 15, 0.14), 0 24px 64px rgba(15, 15, 15, 0.12);

  /* Motion */
  --motion-fast: 120ms;
  --motion-base: 160ms;
  --motion-slow: 240ms;
  --motion-ease: cubic-bezier(0.2, 0, 0.2, 1);
}

html.dark {
  /* Semantic — primary (lifted teal for dark surfaces) */
  --color-primary: #2dd4bf;
  --color-primary-hover: #5eead4;
  --color-primary-pressed: #14b8a6;
  --color-primary-soft: rgba(45, 212, 191, 0.15);
  --color-link: #4ba3f5;

  /* Semantic — status (aligned with Naive dark base values) */
  --color-success: #23a55b;
  --color-warning: #f0a020;
  --color-error: #e03131;
  --color-info: #4ba3f5;

  /* Neutral — warm dark ramp */
  --color-canvas: #191919;
  --color-surface: #202020;
  --color-surface-soft: #252525;
  --color-surface-2: #2a2a2a;
  --color-hairline: rgba(255, 255, 255, 0.13);
  --color-hairline-strong: rgba(255, 255, 255, 0.22);
  --color-ink: #e8e6e3;
  --color-text-2: #b0aeab;
  --color-text-3: #8a8883;
  --color-muted: #6f6d68;

  /* Elevation — dark theme (deep shadows, replacing v1's none) */
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.36);
  --shadow-popover: 0 4px 16px rgba(0, 0, 0, 0.52), 0 12px 32px rgba(0, 0, 0, 0.44);
  --shadow-modal: 0 8px 24px rgba(0, 0, 0, 0.6), 0 24px 64px rgba(0, 0, 0, 0.52);
}
```

- [ ] **Step 2: 验证无残留绿系值**

Run: `grep -rn "#18a058\|#36ad6a\|#0c7a43" apps/web/src/styles/`
预期：无输出（0 命中）。

- [ ] **Step 3: 验证 type-check 与测试**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test`
预期：通过（CSS 改动不影响，但确认无意外）。

本任务暂不单独提交，与 Task 3 合并为 spec 提交 1。

---

### Task 3: unocss.config.ts 主题映射更新

**Files:**
- Modify: `apps/web/unocss.config.ts`（theme 节替换；presets 与 shortcuts 不动）

**Interfaces:**
- Consumes: Task 2 的全部令牌名
- Produces: UnoCSS 语义类（`bg-canvas`、`text-ink`、`p-lg`、`rounded-lg` 等）映射到新令牌；`section` spacing 类从 64 改指 80（`--spacing-section` 新值）；新增 `surface-soft`/`hairline-strong`/`muted`/`link`/`primary-soft` 颜色类与 `radius-xs`/`radius-xxl` 圆角类

- [ ] **Step 1: 替换 theme 节**

```ts
  theme: {
    colors: {
      primary: 'var(--color-primary)',
      'primary-hover': 'var(--color-primary-hover)',
      'primary-pressed': 'var(--color-primary-pressed)',
      'primary-soft': 'var(--color-primary-soft)',
      link: 'var(--color-link)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      info: 'var(--color-info)',
      canvas: 'var(--color-canvas)',
      surface: 'var(--color-surface)',
      'surface-soft': 'var(--color-surface-soft)',
      'surface-2': 'var(--color-surface-2)',
      hairline: 'var(--color-hairline)',
      'hairline-strong': 'var(--color-hairline-strong)',
      ink: 'var(--color-ink)',
      'text-2': 'var(--color-text-2)',
      'text-3': 'var(--color-text-3)',
      muted: 'var(--color-muted)',
    },
    spacing: {
      xxs: 'var(--spacing-xxs)',
      xs: 'var(--spacing-xs)',
      sm: 'var(--spacing-sm)',
      md: 'var(--spacing-md)',
      lg: 'var(--spacing-lg)',
      xl: 'var(--spacing-xl)',
      xxl: 'var(--spacing-xxl)',
      xxxl: 'var(--spacing-xxxl)',
      section: 'var(--spacing-section)',
      'section-lg': 'var(--spacing-section-lg)',
      'section-xl': 'var(--spacing-section-xl)',
      'section-xxl': 'var(--spacing-section-xxl)',
    },
    borderRadius: {
      none: 'var(--radius-none)',
      xs: 'var(--radius-xs)',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      xxl: 'var(--radius-xxl)',
      full: 'var(--radius-full)',
    },
    fontFamily: {
      base: 'var(--font-family-base)',
      mono: 'var(--font-family-mono)',
    },
  },
```

- [ ] **Step 2: 验证**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test && pnpm --filter @toolnest/web build`
预期：全部通过（build 验证 UnoCSS 配置可解析）。

- [ ] **Step 3: Commit（spec 提交 1：令牌层）**

```bash
git add apps/web/src/styles/tokens.css apps/web/unocss.config.ts apps/web/src/main.ts apps/web/package.json pnpm-lock.yaml
git commit -m "feat(ui): rebuild design tokens v2 with Notion neutral palette and teal primary"
```

---

### Task 4: naive-theme.ts 亮暗完整映射 + App.vue 接线

**Files:**
- Modify: `apps/web/src/styles/naive-theme.ts`（整文件替换）
- Modify: `apps/web/src/App.vue`（import 与 theme-overrides 绑定）

**Interfaces:**
- Consumes: 无（色值与 tokens.css v2 对齐，但此处必须是字面量——Naive themeOverrides 不支持 CSS 变量，这是架构约束）
- Produces:
  - `naiveLightThemeOverrides: GlobalThemeOverrides`
  - `naiveDarkThemeOverrides: GlobalThemeOverrides`
  （删除旧导出 `naiveThemeOverrides`；App.vue 是唯一消费方）

- [ ] **Step 1: 整文件替换 naive-theme.ts**

```ts
import type { GlobalThemeOverrides } from 'naive-ui';

const fontFamily =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif";

const radius = {
  borderRadiusSmall: '4px',
  borderRadius: '8px',
  borderRadiusMedium: '8px',
  borderRadiusLarge: '12px',
} as const;

export const naiveLightThemeOverrides: GlobalThemeOverrides = {
  common: {
    // Primary — teal (aligned with --color-primary*)
    primaryColor: '#0f766e',
    primaryColorHover: '#12897f',
    primaryColorPressed: '#0b5c56',
    primaryColorSuppl: '#12897f',
    // Status (aligned with --color-success/warning/error/info)
    successColor: '#1aae39',
    successColorHover: '#1cc24a',
    successColorPressed: '#159233',
    successColorSuppl: '#1cc24a',
    warningColor: '#dd5b00',
    warningColorHover: '#f07a1d',
    warningColorPressed: '#c24e00',
    warningColorSuppl: '#f07a1d',
    errorColor: '#e03131',
    errorColorHover: '#eb5a5a',
    errorColorPressed: '#c92a2a',
    errorColorSuppl: '#eb5a5a',
    infoColor: '#0075de',
    infoColorHover: '#2f8fe8',
    infoColorPressed: '#0062bd',
    infoColorSuppl: '#2f8fe8',
    // Neutral surfaces — canvas(white page) / surface(warm gray section)
    bodyColor: '#ffffff',
    cardColor: '#f6f5f4',
    popoverColor: '#ffffff',
    modalColor: '#ffffff',
    inputColor: '#ffffff',
    actionColor: '#f6f5f4',
    // Text ramp
    textColorBase: '#1a1a1a',
    textColor1: '#1a1a1a',
    textColor2: '#5f5e5b',
    textColor3: '#97958f',
    // Hairlines
    borderColor: '#e5e3df',
    dividerColor: '#e5e3df',
    // Type & shape
    fontFamily,
    fontSize: '14px',
    ...radius,
  },
};

export const naiveDarkThemeOverrides: GlobalThemeOverrides = {
  common: {
    // Primary — lifted teal for dark surfaces
    primaryColor: '#2dd4bf',
    primaryColorHover: '#5eead4',
    primaryColorPressed: '#14b8a6',
    primaryColorSuppl: '#5eead4',
    // Status
    successColor: '#23a55b',
    successColorHover: '#2bc96e',
    successColorPressed: '#1d8a4c',
    successColorSuppl: '#2bc96e',
    warningColor: '#f0a020',
    warningColorHover: '#f5b84d',
    warningColorPressed: '#d18a15',
    warningColorSuppl: '#f5b84d',
    errorColor: '#e03131',
    errorColorHover: '#eb5a5a',
    errorColorPressed: '#c92a2a',
    errorColorSuppl: '#eb5a5a',
    infoColor: '#4ba3f5',
    infoColorHover: '#74bbf8',
    infoColorPressed: '#2f8fe8',
    infoColorSuppl: '#74bbf8',
    // Neutral surfaces — warm dark ramp (aligned with html.dark tokens)
    bodyColor: '#191919',
    cardColor: '#202020',
    popoverColor: '#252525',
    modalColor: '#202020',
    inputColor: '#202020',
    actionColor: '#2a2a2a',
    // Text ramp
    textColorBase: '#e8e6e3',
    textColor1: '#e8e6e3',
    textColor2: '#b0aeab',
    textColor3: '#8a8883',
    // Hairlines
    borderColor: 'rgba(255, 255, 255, 0.13)',
    dividerColor: 'rgba(255, 255, 255, 0.13)',
    // Type & shape
    fontFamily,
    fontSize: '14px',
    ...radius,
  },
};
```

- [ ] **Step 2: App.vue 改为按主题选择 overrides**

`apps/web/src/App.vue` script 部分改为：

```ts
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider, darkTheme } from 'naive-ui';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePreferencesStore } from './stores/preferences.store';
import CommandPalette from './components/CommandPalette.vue';
import AppLayout from './layouts/AppLayout.vue';
import { naiveLightThemeOverrides, naiveDarkThemeOverrides } from './styles/naive-theme';

const route = useRoute();
const preferencesStore = usePreferencesStore();

const theme = computed(() => preferencesStore.isDark ? darkTheme : null);
const themeOverrides = computed(() =>
  preferencesStore.isDark ? naiveDarkThemeOverrides : naiveLightThemeOverrides
);
const showSidebar = computed(() => route.meta.showSidebar === true);
```

template 中 NConfigProvider 行改为：

```html
<NConfigProvider :theme="theme" :theme-overrides="themeOverrides" style="min-height: 100vh;">
```

（其余 template 内容不变。）

- [ ] **Step 3: 验证**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test && pnpm --filter @toolnest/web lint`
预期：type-check 通过；4 测试通过；lint 错误数 ≤ 68（存量基线）。

- [ ] **Step 4: Commit（spec 提交 2）**

```bash
git add apps/web/src/styles/naive-theme.ts apps/web/src/App.vue
git commit -m "feat(ui): map full naive-ui light/dark themes to design tokens"
```

---

### Task 5: AppLayout.vue 壳层换肤（模板 + scoped 样式重写）

**Files:**
- Modify: `apps/web/src/layouts/AppLayout.vue`（template 与 style 整段替换；script 仅删除行内样式相关无改动——script 完全不动）

**Interfaces:**
- Consumes: Task 2 全部令牌名（`--color-primary`、`--color-primary-soft`、`--color-hairline`、`--color-text-2`、`--spacing-*`、`--radius-lg`、`--motion-*`、`--font-size-*`、`--font-weight-semibold`）
- Produces: 无（纯展示组件，对外接口不变：默认插槽 + 依赖 preferencesStore）

设计要点（spec"组件与布局"一节）：
- 侧边栏条目 36px 高、`--radius-lg` 圆角；激活态 = `--color-primary-soft` 背景 + `--color-primary` 文字 + 左侧 3px `var(--color-primary)` inset 竖条
- Logo 区固定 52px 高
- 分类列表滚动条 10px
- 所有行内 style 迁移到 scoped class；`collapsed` 态通过 `:class="{ collapsed }"` 区分（padding 居中 vs 左对齐）

- [ ] **Step 1: 替换 template 与 style（script 保持原样一字不动）**

`<template>` 整段替换为：

```html
<template>
  <NLayout has-sider class="app-layout">
    <NLayoutSider
      class="app-sider"
      :collapsed="collapsed"
      :width="240"
      :collapsed-width="60"
      :native-scrollbar="false"
      bordered
      collapse-mode="width"
      show-trigger="bar"
      @collapse="preferencesStore.toggleSidebarCollapsed()"
      @expand="preferencesStore.toggleSidebarCollapsed()"
    >
      <div class="logo" @click="goHome">
        <span class="logo-text">{{ collapsed ? 'T' : 'ToolNest' }}</span>
      </div>

      <div class="category-list">
        <div
          v-for="cat in sortedCategories"
          :key="cat.name"
          class="category-item"
          :class="{ active: activeCategory === cat.name, collapsed }"
          @click="handleCategoryClick(cat.name)"
        >
          <NTooltip v-if="collapsed" placement="right">
            <template #trigger>
              <span class="category-emoji">{{ getCategoryEmoji(cat.name) }}</span>
            </template>
            {{ t(cat.label) }}
          </NTooltip>
          <template v-else>
            <span class="category-emoji">{{ getCategoryEmoji(cat.name) }}</span>
            <span class="category-label">{{ t(cat.label) }}</span>
          </template>
        </div>
      </div>

      <div class="sidebar-footer">
        <LocaleSwitcher />
        <ThemeSwitcher />
      </div>
    </NLayoutSider>

    <NLayoutContent
      class="app-content"
      :style="{ marginLeft: collapsed ? '60px' : '240px', transition: 'margin-left var(--motion-slow) var(--motion-ease)' }"
    >
      <slot />
    </NLayoutContent>
  </NLayout>
</template>
```

`<style scoped>` 整段替换为：

```css
<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 52px;
  box-sizing: border-box;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  border-bottom: 1px solid var(--color-hairline);
}

.logo-text {
  font-size: var(--font-size-heading-md);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
}

.category-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xs) 0;
  scrollbar-width: thin;
  scrollbar-color: var(--color-muted) transparent;
}

.category-list::-webkit-scrollbar {
  width: 10px;
}

.category-list::-webkit-scrollbar-thumb {
  background-color: var(--color-muted);
  border-radius: var(--radius-full);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.category-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  height: 36px;
  padding: 0 var(--spacing-md);
  margin: 2px var(--spacing-xs);
  cursor: pointer;
  border-radius: var(--radius-lg);
  color: var(--color-text-2);
  transition:
    background-color var(--motion-base) var(--motion-ease),
    color var(--motion-base) var(--motion-ease);
}

.category-item.collapsed {
  padding: 0;
  justify-content: center;
}

.category-item:hover {
  background-color: var(--color-surface-2);
}

.category-item.active {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  box-shadow: inset 3px 0 0 var(--color-primary);
}

.category-emoji {
  font-size: 18px;
  flex-shrink: 0;
}

.category-label {
  font-size: var(--font-size-body-md);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--color-hairline);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
</style>
```

（script setup 块**保持原样**，一字不改。）

- [ ] **Step 2: 验证**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web lint`
预期：type-check 通过；lint 错误数 ≤ 68。

本任务与 Task 6 合并提交。

---

### Task 6: ToolLayout 收藏星标改主色 + ToolCard 卡片重写

**Files:**
- Modify: `apps/web/src/layouts/ToolLayout.vue:86`（收藏按钮颜色一行）
- Modify: `apps/web/src/components/ToolCard.vue`（整文件重写）

**Interfaces:**
- Consumes: Task 2 令牌（`--shadow-card`、`--color-hairline`、`--color-hairline-strong`、`--color-primary`、`--color-ink`、`--color-text-2`）
- Produces: 无

- [ ] **Step 1: ToolLayout.vue 收藏星标主色化**

`:style` 绑定中的 `'var(--color-warning)'` 改为 `'var(--color-primary)'`（第 87 行）：

```html
          :style="{ color: isFavorite ? 'var(--color-primary)' : undefined, fontSize: '20px' }"
```

（ToolLayout 的其余部分——面包屑、标题、标签——全部经由 Naive 组件渲染，已继承 Task 4 的主题映射，无需改动。）

- [ ] **Step 2: ToolCard.vue 整文件重写**

移除 `hoverable`（Naive 自带 hover 与令牌阴影不一致），改用自定义 hover 抬升；标题/描述令牌化，描述 2 行截断：

```vue
<script setup lang="ts">
import { NCard, NTag, NButton, NSpace } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToolStore } from '@/stores/tool.store';
import type { ToolDefinition } from '@toolnest/shared';
import { computed } from 'vue';

const props = defineProps<{ tool: ToolDefinition }>();
const router = useRouter();
const { t } = useI18n();
const toolStore = useToolStore();

const isFavorite = computed(() => toolStore.favoritePaths.includes(props.tool.path));

function navigate() {
  router.push(props.tool.path);
}

function toggleFav(e: Event) {
  e.stopPropagation();
  toolStore.toggleFavorite(props.tool.path);
}
</script>

<template>
  <NCard class="tool-card" style="cursor: pointer;" @click="navigate">
    <template #header>
      <div class="tool-card-header">
        <span class="tool-card-title">{{ t(tool.name) }}</span>
        <NButton
          text
          size="small"
          class="tool-card-fav"
          :class="{ active: isFavorite }"
          @click="toggleFav"
        >
          {{ isFavorite ? '★' : '☆' }}
        </NButton>
      </div>
    </template>
    <p class="tool-card-desc">{{ t(tool.description) }}</p>
    <NSpace size="small">
      <NTag size="small" :bordered="false" type="info">
        {{ t(`category.${tool.category}.name`) }}
      </NTag>
      <NTag v-for="tag in tool.tags.slice(0, 3)" :key="tag" size="small" :bordered="false">
        {{ tag }}
      </NTag>
    </NSpace>
  </NCard>
</template>

<style scoped>
.tool-card {
  border: 1px solid var(--color-hairline);
  transition:
    box-shadow var(--motion-base) var(--motion-ease),
    border-color var(--motion-base) var(--motion-ease);
}

.tool-card:hover {
  box-shadow: var(--shadow-card);
  border-color: var(--color-hairline-strong);
}

.tool-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-card-title {
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.tool-card-fav {
  font-size: 16px;
  color: var(--color-text-3);
}

.tool-card-fav.active {
  color: var(--color-primary);
}

.tool-card-desc {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-body-sm);
  color: var(--color-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
```

- [ ] **Step 3: 验证**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test && pnpm --filter @toolnest/web lint`
预期：type-check 通过；4 测试通过；lint 错误数 ≤ 68。

- [ ] **Step 4: Commit（spec 提交 3）**

```bash
git add apps/web/src/layouts/AppLayout.vue apps/web/src/layouts/ToolLayout.vue apps/web/src/components/ToolCard.vue
git commit -m "refactor(ui): reskin app shell, tool layout and tool card"
```

---

### Task 7: 24 个工具文件硬编码颜色清零

**Files:**
- Modify: 下列各工具文件（精确到行号；判定规则见下）

**Interfaces:**
- Consumes: Task 2 令牌（`--color-error`、`--color-success`、`--color-warning`、`--color-primary`、`--color-text-3`、`--color-hairline`、`--color-surface-2`）
- Produces: 无

**判定规则（先读再用）：**
- **改**：主题语义色硬编码（`#d03050`→error、`#18a058`→success、`#f0a020`→warning 等）、旧变量带 fallback 写法（`var(--primary-color, #xxx)` / `var(--n-border-color, #xxx)`）
- **保留**：功能性/用户数据色——取景器 #000、棋盘格、二维码模块色（service 内 #000000/#ffffff）、diff 高亮底色（#e6ffed/#ffeef0/#fff5b1/#ffe0b2）、用户可编辑的默认颜色值（#ff0000）、svg placeholder 的 refs 值

**全量清单（grep 审计结果，行号为当前 master 上的位置）：**

| 文件 | 行 | 旧值 | 改为 |
|---|---|---|---|
| tools/base64-encoder/Base64Encoder.vue | 53 | `#d03050` | `var(--color-error)` |
| tools/bip39-generator/Bip39Generator.vue | 51 | `#18a058` / `#d03050` | `var(--color-success)` / `var(--color-error)` |
| tools/camera-recorder/CameraRecorder.vue | 191 | `#000` | **保留**（取景器） |
| tools/camera-recorder/CameraRecorder.vue | 217 | `#333` | `var(--color-hairline)` |
| tools/chronometer/Chronometer.vue | 28 | `#eee` | `var(--color-hairline)` |
| tools/chmod-calculator/ChmodCalculator.vue | 99 | `var(--primary-color, #2080f0)` | `var(--color-primary)` |
| tools/color-converter/* | — | 用户数据色 | **保留** |
| tools/crontab-generator/CrontabGenerator.vue | 64 | `#999` | `var(--color-text-3)` |
| tools/crontab-generator/CrontabGenerator.vue | 95 | `#333` | `var(--color-hairline)` |
| tools/git-memo/GitMemo.vue | 147 | `#999` | `var(--color-text-3)` |
| tools/git-memo/GitMemo.vue | 152 | `#333` | `var(--color-hairline)` |
| tools/html-wysiwyg-editor/* | 74 | `#e0e0e6` | `var(--color-hairline)` |
| tools/image-create-transparent/* | 89 | 棋盘格 | **保留** |
| tools/image-crop/ImageCrop.vue | 159, 167 | `#00c853` | `var(--color-primary)` |
| tools/image-remove-background/* | 109 | 蒙版色 | **保留** |
| tools/image-editor/* | — | `#ff0000` 用户默认 | **保留** |
| tools/image-split/* | 97 | `#ccc` | `var(--color-hairline)` |
| tools/ipv4-address-converter/* | 83, 90 | `var(--n-border-color, #e0e0e6)` / `var(--n-color-hover, #f0f0f5)` | `var(--color-hairline)` / `var(--color-surface-2)` |
| tools/ipv6-ula-generator/* | 74, 81 | 同上 | `var(--color-hairline)` / `var(--color-surface-2)` |
| tools/json-diff/JsonDiff.vue | 86 | `#e6ffed`/`#ffeef0`/`#fff5b1` | **保留**（diff 底色） |
| tools/json-diff/JsonDiff.vue | 89–91 | `#d03050` ×3 / `#18a058` ×2 | `var(--color-error)` ×3 / `var(--color-success)` ×2 |
| tools/otp-generator/* | 104, 139 | `#999` | `var(--color-text-3)` |
| tools/password-strength-analyser/index.ts | 12 | `#999` | `var(--color-text-3)` |
| tools/password-strength-analyser/index.ts | 57 | `#d03050`/`#f0a020`/`#18a058` | `var(--color-error)`/`var(--color-warning)`/`var(--color-success)` |
| tools/qr-code-generator/qr-code-generator.vue | 83 | `#999` | `var(--color-text-3)` |
| tools/qr-code-generator/service.ts | — | `#000000`/`#ffffff` | **保留**（二维码模块） |
| tools/random-port-generator/* | 60 | 硬编码主色 | `var(--color-primary)` |
| tools/regex-tester/RegexTester.vue | 48 | `#ffe0b2` | **保留**（匹配高亮） |
| tools/regex-tester/RegexTester.vue | 121 | `#f5f5f5` | `var(--color-surface-2)` |
| tools/screenshot-share/* | 66 | `#e0e0e0` | `var(--color-hairline)` |
| tools/svg-placeholder-generator/* | 79 | `#eee` | `var(--color-hairline)`（其余 refs 值保留） |
| tools/text-diff/TextDiff.vue | 38 | diff 底色 | **保留** |
| tools/text-diff/TextDiff.vue | 40–42 | `#d03050`/`#18a058` | `var(--color-error)`/`var(--color-success)` |
| tools/wifi-qr-code-generator/wifi-qr-code-generator.vue | 94 | `#999` | `var(--color-text-3)`（service 保留） |
| tools/base64-file-converter/* | 97 | 已用令牌 | ✓ 无需改 |

- [ ] **Step 1: 逐文件按上表修改（改判定行的同时，顺手把同一文件内同模式未列出的行一并处理）**

- [ ] **Step 2: 全量复扫，确认零残留**

Run: `grep -rniE "#(18a058|36ad6a|0c7a43|d03050|f0a020|2080f0|00c853)" apps/web/src/`
预期：无输出（0 命中）。若命中，逐个判断是否属于"保留"类；属"改"类的必须处理。

Run: `grep -rn "var(--primary-color\|var(--n-border-color\|var(--n-color-hover" apps/web/src/`
预期：无输出。

- [ ] **Step 3: 验证**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test && pnpm --filter @toolnest/web lint`
预期：type-check 通过；4 测试通过；lint 错误数 ≤ 68。

- [ ] **Step 4: Commit（spec 提交 4）**

```bash
git add apps/web/src/tools/
git commit -m "chore(ui): purge hardcoded colors from tool components"
```

---

### Task 8: 浏览器走查（亮/暗双主题 + 交互态截图）

**Files:**
- Create: `.scratch/ui-reskin-v2/*.png`（截图工件）

**Interfaces:**
- Consumes: Task 1–7 全部改动
- Produces: 走查截图集（Task 9 作为回归基线保留）

**前置清理（重要，仓库已知坑）：** 重复 `pnpm dev` 残留进程会导致 server 崩溃 / vite 代理错位 / 页面显示 NOT_FOUND JSON。先清场再启动。

- [ ] **Step 1: 清理残留进程并启动 dev server**

```bash
# Windows：杀掉占用 3001（API）与 vite 端口（见 apps/web/vite.config.ts，通常 5173）的 node 进程
netstat -ano | grep -E ":(3001|5173)" | grep LISTENING
taskkill //PID <pid> //F   # 对每个占用 PID 执行
pnpm dev   # 仓库根，后台运行
```

确认 web 端口可访问（注意：**访问 web 端口，不是 3001 API 端口**——3001 返回 JSON NOT_FOUND 属正常）。

- [ ] **Step 2: 走查清单（逐项通过，异常记入 plan 文件末尾"走查记录"）**

1. 首页（亮色）：侧边栏 36px 条目、激活分类 = 柔和青绿底 + 左侧 3px 竖条；卡片默认 hairline 细边
2. 卡片 hover：抬起阴影（`--shadow-card`）+ 边框变深；描述最多 2 行
3. 切换暗色：canvas/surface 深灰阶、主色为亮青绿 `#2dd4bf`、**暗色下阴影可见**（浮起感）
4. 侧边栏折叠/展开：动画顺滑，折叠后 tooltip 正常
5. 分别进入不少于 3 个代表工具页：文本类 `base64-encoder`、文件类 `base64-file-converter`、网络类 `ipv4-address-converter`；确认按钮/输入框/标签主色为青绿，错误态为红 `#e03131`、成功态为绿 `#1aae39`（不再是旧绿 #18a058）
6. 进入一个分类页：列表、卡片和激活侧栏状态均正常
7. 弹层（popover/下拉/对话框）：白色（暗色 #252525）+ `--shadow-popover` 阴影
8. 命令面板（Ctrl+K）：外观正常
9. 收藏星标（工具页头部 + 卡片）：激活态为主色

截图命名：`01-home-light.png`、`02-card-hover.png`、`03-home-dark.png`、`04-sidebar-collapsed.png`、`05-tool-text.png`、`06-tool-file.png`、`07-tool-network.png`、`08-category.png`、`09-popover.png`、`10-command-palette.png`、`11-favorite.png`，存入 `.scratch/ui-reskin-v2/`。

- [ ] **Step 3: 亮暗对比图（Task 9 基线用）**

首页 + 工具页各截亮/暗两张，命名 `baseline-home-light.png` / `baseline-home-dark.png` / `baseline-tool-light.png` / `baseline-tool-dark.png`。

- [ ] **Step 4: 走查中发现的问题就地修复并重截**

（若换肤引入回归——如某组件仍是旧绿——修复后更新截图；修复记入 commit 4 或单独 `fix(ui): ...` 提交。）

本任务不产生代码 commit。

---

### Task 9: DESIGN.md v2 重写 + 最终验证 + 清理

**Files:**
- Modify: `DESIGN.md`（整文件重写为 v2 契约）
- Delete: `notion-design.md`（下载的 Notion 原始参考，换肤完成后不再需要）
- Keep: `.scratch/ui-reskin-v2/`（回归基线截图）

**Interfaces:**
- Consumes: Task 2/3/4 的最终令牌与映射（以下 v2 内容与之逐字一致）
- Produces: 新设计契约

- [ ] **Step 1: DESIGN.md 整文件重写为以下内容**

```markdown
---
version: v2
name: ToolNest
description: 开发者工具聚合站的界面设计契约 v2。Notion 骨架 + 青绿主色、暖灰中性色、Naive UI 基元、亮暗双主题；v1 绿色契约作废。
colors:
  primary: "#0f766e"
  primary-hover: "#12897f"
  primary-pressed: "#0b5c56"
  primary-soft: "rgba(15, 118, 110, 0.1)"
  link: "#0075de"
  success: "#1aae39"
  warning: "#dd5b00"
  error: "#e03131"
  info: "#0075de"
  canvas: "#ffffff"
  surface: "#f6f5f4"
  surface-soft: "#fafaf9"
  surface-2: "#f0eeec"
  hairline: "#e5e3df"
  hairline-strong: "#c8c4be"
  ink: "#1a1a1a"
  text-2: "#5f5e5b"
  text-3: "#97958f"
  muted: "#bbb8b1"
colors-dark:
  primary: "#2dd4bf"
  primary-hover: "#5eead4"
  primary-pressed: "#14b8a6"
  primary-soft: "rgba(45, 212, 191, 0.15)"
  link: "#4ba3f5"
  success: "#23a55b"
  warning: "#f0a020"
  error: "#e03131"
  info: "#4ba3f5"
  canvas: "#191919"
  surface: "#202020"
  surface-soft: "#252525"
  surface-2: "#2a2a2a"
  hairline: "rgba(255, 255, 255, 0.13)"
  hairline-strong: "rgba(255, 255, 255, 0.22)"
  ink: "#e8e6e3"
  text-2: "#b0aeab"
  text-3: "#8a8883"
  muted: "#6f6d68"
typography:
  display-lg: { fontSize: 28px, fontWeight: 700, lineHeight: 36px }
  heading-lg: { fontSize: 22px, fontWeight: 600, lineHeight: 30px }
  heading-md: { fontSize: 18px, fontWeight: 600, lineHeight: 26px }
  body-md: { fontSize: 14px, fontWeight: 400, lineHeight: 22px }
  body-sm: { fontSize: 13px, fontWeight: 400, lineHeight: 19px }
  caption: { fontSize: 12px, fontWeight: 400, lineHeight: 18px }
  code-md: { fontSize: 13px, fontWeight: 400, lineHeight: 20px }
  family: "Inter, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
  mono: "SF Mono, Cascadia Code, Consolas, monospace"
spacing:
  base: 4
  tiers: [xxs 4, xs 8, sm 12, md 16, lg 24, xl 32, xxl 48, xxxl 64, section 80, section-lg 120, section-xl 160, section-xxl 200]
rounded:
  tiers: [none 0, xs 2, sm 4, md 6, lg 8, xl 12, xxl 16, full 9999]
components:
  sidebar-item: { height: 36px, rounded: lg, background: canvas, text: text-2 }
  sidebar-item-hover: { background: surface-2, text: ink }
  sidebar-item-selected: { background: primary-soft, text: primary, indicator: "inset 3px 0 0 primary" }
  card: { background: surface, text: ink, rounded: lg, border: hairline }
  card-hover: { shadow: card, border: hairline-strong }
  text-input: { height: 36px, rounded: md, background: canvas, text: ink }
  button-primary: { height: 36px, rounded: md, background: primary, text: "#ffffff" }
shadow:
  light:
    card: "0 1px 2px rgba(15,15,15,0.04), 0 4px 12px rgba(15,15,15,0.06)"
    popover: "0 4px 16px rgba(15,15,15,0.1), 0 12px 32px rgba(15,15,15,0.08)"
    modal: "0 8px 24px rgba(15,15,15,0.14), 0 24px 64px rgba(15,15,15,0.12)"
  dark:
    card: "0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.36)"
    popover: "0 4px 16px rgba(0,0,0,0.52), 0 12px 32px rgba(0,0,0,0.44)"
    modal: "0 8px 24px rgba(0,0,0,0.6), 0 24px 64px rgba(0,0,0,0.52)"
motion:
  fast: 120ms
  base: 160ms
  slow: 240ms
  ease: cubic-bezier(0.2, 0, 0.2, 1)
---

## Overview

ToolNest 采用 Notion 式克制编辑骨架与自有青绿品牌色：页面保持高信息密度，层级依靠暖灰 surface、hairline 与轻量浮起阴影表达。主色只用于主操作、激活态、焦点与收藏态，不作为大面积背景。

## Colors

`canvas` 是页面底；`surface` / `surface-soft` / `surface-2` 构成暖灰内容层级；`hairline` / `hairline-strong` 表达边界。状态色必须同时配合文字或图标，不得只靠颜色传达状态。暗色使用 `colors-dark` 映射，主色提升为 `#2dd4bf` 保证深色表面对比度。

## Typography

仅使用 frontmatter 中的 7 级字号层级。界面字体为 Inter，中文回退 PingFang SC / Microsoft YaHei；代码与数据使用 mono 栈。页面主标题使用 display-lg，卡片标题使用 body-md 600，描述使用 body-sm 或 body-md。

## Layout

间距采用 4px 基准与 12 档令牌。页面内容最大宽度保持 900px；侧栏展开 240px、折叠 60px；Logo 区高 52px；侧栏条目与常规控件高 36px。区块间优先使用 section 档，区块内部不超过 xl。

## Elevation & Depth

亮暗主题均使用 `shadow-card` / `shadow-popover` / `shadow-modal` 三档。卡片默认无阴影、以 hairline 分层；hover 使用 shadow-card 与 hairline-strong；临时层依次使用 popover/modal 档。暗色阴影使用更深黑色值，不得改回 none。

## Shapes

圆角只取 `rounded` 令牌。输入框与按钮使用 md（6px），卡片与侧栏条目使用 lg（8px），大容器使用 xl/xxl，小标签使用 sm 或 full。

## Components

- 侧栏条目：36px 高，hover 为 surface-2；选中态为 primary-soft 底、primary 字与左侧 3px primary 指示条。
- 工具卡片：surface 底、hairline 边框、lg 圆角；hover 浮起并加深边框；描述最多两行。
- 工具页标题：display-lg/700/ink；描述为 body-md/text-3；收藏激活态使用 primary。
- 输入与按钮：36px 高、md 圆角；Naive 组件外观全部通过 themeOverrides 设置。
- 弹出层：亮色为纯白、暗色为 surface-soft，并使用相应阴影档。

## Do's and Don'ts

Do：颜色、间距、圆角、阴影与动效全部引用令牌；状态同时使用颜色与文字/图标；卡片 hover 使用统一浮起规则；组件只通过公开 API 与 themeOverrides 定制。

Don't：不得在业务组件样式中硬编码主题色；不得覆盖 `.n-*` 内部 class；不得自行新增令牌档位；不得把 primary 用作页面或大卡片背景。功能性/用户数据色（取景器、棋盘格、二维码模块、diff 底色、颜色编辑器默认值）除外。

## Responsive Behavior

当前桌面优先，现有 640px 工具页断点继续生效。移动端断点体系与移动端侧栏形态为 M2 待设计事项。

## Accessibility

正文对比度目标 ≥ 4.5:1，大字与控件 ≥ 3:1；所有交互控件须有可见 focus-visible；图标按钮提供 aria-label/title；状态不可只靠颜色；`prefers-reduced-motion` 下动效时长视为 0。

## Architecture

单一事实源为 `apps/web/src/styles/tokens.css`（CSS 自定义属性，`:root` 亮色 / `html.dark` 暗色）。
三方消费：UnoCSS theme（`unocss.config.ts`）、Naive UI themeOverrides（`naive-theme.ts`，
**必须字面量**，不支持 CSS 变量）、原生 CSS（`var(--token)`）。

暗色双通道：`html.dark` class 控制 CSS 变量；Naive `darkTheme` 对象控制组件外观；
`App.vue` 用 computed 按 `preferencesStore.isDark` 选择 `naiveDarkThemeOverrides` / `naiveLightThemeOverrides`。

## 规则

1. 组件样式禁止硬编码 hex/rgba 颜色值；一律引用 `var(--color-*)` 令牌。
2. Naive 组件一律通过 themeOverrides 定制；禁止覆盖 `.n-*` 内部 class。
3. **暗色允许使用阴影**（深色阴影值）——v1"暗色禁用阴影"作废。
4. 卡片 hover 抬升：`box-shadow: var(--shadow-card)` + `border-color: var(--color-hairline-strong)`。
5. 侧边栏激活态：`--color-primary-soft` 背景 + `--color-primary` 文字 + `inset 3px 0 0 var(--color-primary)`。
6. 控制高度基准 36px；圆角基准 `--radius-md`(6px) / `--radius-lg`(8px)。
7. 功能性/用户数据色（取景器、棋盘格、二维码模块、diff 底色、用户可编辑默认色）不受规则 1 约束。
8. 间距/圆角/阴影/动效档位以本文件与 tokens.css 为准，不得自行新增档位。

## Known Gaps

1. 移动端断点体系与移动端导航形态（M2）。
2. 图标尺寸规范（现有 16/20px 尚未正式令牌化）。

## 迁移说明（v1 → v2）

- 主色绿 `#18a058` 系全部作废 → 青绿 `#0f766e` 系；语义状态色对齐 Naive（error `#e03131`、warning `#dd5b00`）。
- canvas/surface 语义反转：canvas=页面底（白），surface=区块底（暖灰）。
- `--color-text-2/3` 名称保留，值由 rgba 黑改为暖灰 hex。
- `--spacing-section` 64→80；64 档迁移为 `--spacing-xxxl`。
- 新增：`--color-link`、`--color-surface-soft`、`--color-hairline-strong`、`--color-muted`、
  `--radius-xs`、`--radius-xxl`。
```

- [ ] **Step 2: 最终验证（全部通过才算完成）**

```bash
pnpm --filter @toolnest/web type-check   # 通过
pnpm --filter @toolnest/web test         # 4 用例通过
pnpm --filter @toolnest/web lint         # 错误数 ≤ 68（存量基线，不得增加）
pnpm --filter @toolnest/web build        # 通过
```

Run: `grep -rniE "#(18a058|36ad6a|0c7a43)" apps/web/src/ DESIGN.md`
预期：无输出（绿系零残留）。

- [ ] **Step 3: 删除 Notion 参考文件**

```bash
rm notion-design.md
```

- [ ] **Step 4: Commit（spec 提交 5）**

```bash
git add DESIGN.md
git rm notion-design.md
git commit -m "docs: rewrite DESIGN.md as v2 contract"
```

- [ ] **Step 5: 收尾核对**

Run: `git log --oneline master..HEAD`
预期：看到全部 5–6 个提交（font、tokens、naive theme、shell/card、purge、docs）。

走查截图基线保留在 `.scratch/ui-reskin-v2/`（不提交，.scratch 已被 git 忽略则无需处理）。
