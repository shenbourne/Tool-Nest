# M1 设计地基 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 apps/web 建立单一事实源的设计令牌体系（CSS 变量）与机器可审的设计契约文件 DESIGN.md，并在布局壳层做首批消费示范。

**Architecture:** `tokens.css` 用 CSS custom properties 定义全部语义令牌（`:root` 亮色 / `html.dark` 暗色两套映射），作为唯一事实源；UnoCSS theme 与 Naive UI `themeOverrides` 都改为引用这些变量，不重复定义值；全局样式从 `App.vue` 抽出到 `global.css`。暗色中性色逐一对齐 Naive UI 2.45.3 的 darkTheme common tokens，保证自定义 CSS 与 Naive 组件表面无缝。

**Tech Stack:** Vue 3 + Composition API、Naive UI 2.45.3（NConfigProvider / darkTheme / GlobalThemeOverrides）、UnoCSS（presetUno / presetAttributify / presetIcons）、Vite、TypeScript、vitest 1.6、ESLint 10 扁平配置

**Spec:** `docs/superpowers/specs/2026-09-17-m1-design-foundation-design.md`

## Global Constraints

- 视觉方向：保留绿色主色 `#18a058`，只做精致化，不做品牌换色
- 令牌唯一事实源是 `apps/web/src/styles/tokens.css`；禁止在三处消费方重复定义颜色值
- 令牌命名前缀固定：`--color-`、`--spacing-`、`--radius-`、`--font-`、`--shadow-`、`--motion-`
- Naive 组件外观只通过 `themeOverrides` 调整，禁止覆盖 Naive 内部 class
- Vue 3 Composition API only；`useI18n()` 只能在组件 `setup()` 内调用，不得在 Pinia store 中调用
- Naive UI 承载所有 UI 基元；UnoCSS 承载布局与工具类
- 暗色模式沿用现有 `html.dark` class 切换机制
- 本模块不清存量 lint 错误（当前 68 个），不迁移页面/工具组件样式
- 每次提交前必须通过：`pnpm --filter @toolnest/web type-check`、`pnpm --filter @toolnest/web test`、`pnpm --filter @toolnest/web lint`（不得新增错误）

## Naive UI 2.45.3 基值对照（暗色对齐依据，实现时不得臆造）

暗色 common base：`neutralBody rgb(16,16,20)` = `#101014`｜`neutralCard rgb(24,24,28)` = `#18181c`｜`neutralModal rgb(44,44,50)` = `#2c2c32`｜`neutralPopover rgb(72,72,78)` = `#48484e`｜`alpha1 .9 / alpha2 .82 / alpha3 .52`｜`alphaBorder .24`｜`alphaDivider .09`

亮色 common base：`neutralBody #FFF`｜`neutralCard #FFF`｜`alpha1 .82 / alpha2 .72 / alpha3 .38`｜`alphaBorder .12`｜`alphaDivider .06`｜`primaryDefault #18a058 / primaryHover #36ad6a / primaryActive #0c7a43`

## File Structure

| 动作 | 文件 | 职责 |
|---|---|---|
| 新增 | `DESIGN.md` | 设计契约：机器可读 frontmatter 令牌 + 人类可读设计规则 |
| 新增 | `apps/web/src/styles/tokens.css` | 令牌唯一事实源（亮/暗两套映射） |
| 新增 | `apps/web/src/styles/global.css` | 全局基线样式：字体栈、滚动条、过渡、reduced-motion |
| 修改 | `apps/web/unocss.config.ts` | theme 引用 CSS 变量；扩展 shortcuts |
| 修改 | `apps/web/src/App.vue` | themeOverrides 引用变量；`<style>` 块迁出 |
| 修改 | `apps/web/src/layouts/AppLayout.vue` | 首批令牌消费示范（侧栏表面/激活态/间距） |
| 修改 | `apps/web/src/layouts/ToolLayout.vue` | 首批令牌消费示范（标题字号/间距/描述色） |

---

## 执行前准备（每个模块开始时必做）

- [ ] **P1: 检查工作区状态**

Run: `git status --short`

Expected: 仅剩 `.scratch/`、`.superpowers/` 未跟踪；无已修改未提交的源码文件。若出现其他改动，先向用户确认归属，不得擅自提交或丢弃。

- [ ] **P2: 从 master 创建任务分支**

```bash
git checkout master
git checkout -b refactor/m1-design-foundation
git log --oneline -1
git status --short
```

Expected: 分支为 `refactor/m1-design-foundation`，基点 commit 为 master 最新（当前 `e68f318`）；工作区仍仅剩 scratch 目录未跟踪。

- [ ] **P3: 记录基线截图**

M1 前基线已在 `.scratch/verify-sidebar-*.png`、`.scratch/reverify-*.png`。确认这些文件存在（`ls .scratch/*.png`），Task 3 的视觉对比以它们为基线。

---

### Task 1: 设计契约 DESIGN.md

**Files:**
- Create: `DESIGN.md`（仓库根目录）

**Interfaces:**
- Consumes: 无
- Produces: `DESIGN.md` 中的令牌名与取值是 Task 2 实现 `tokens.css` 的唯一依据；frontmatter 中 `colors` / `typography` / `rounded` / `spacing` / `components` 的键必须与 `tokens.css` 的变量名一一对应（例如 frontmatter `colors.primary` ↔ `--color-primary`）

- [ ] **Step 1: 写 DESIGN.md frontmatter**

写入以下 YAML frontmatter（值来自 spec 与 Naive 基值对照表）：

```yaml
---
version: alpha
name: ToolNest
description: 开发者工具聚合站的界面设计契约。绿色主色、Naive UI 基元、亮暗双主题，追求高信息密度下的清晰与克制。
colors:
  primary: "#18a058"
  primary-hover: "#36ad6a"
  primary-pressed: "#0c7a43"
  success: "#18a058"
  warning: "#f0a020"
  error: "#d03050"
  info: "#2080f0"
  canvas: "#fafafc"
  surface: "#ffffff"
  surface-2: "#f2f2f5"
  hairline: "#e5e5e8"
  ink: "rgba(0, 0, 0, 0.82)"
  text-2: "rgba(0, 0, 0, 0.72)"
  text-3: "rgba(0, 0, 0, 0.38)"
typography:
  display-lg:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 36px
    letterSpacing: 0px
  heading-lg:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 30px
    letterSpacing: 0px
  heading-md:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: 0px
  body-md:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0px
  body-sm:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 19px
    letterSpacing: 0px
  caption:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0px
  code-md:
    fontFamily: "'SF Mono', 'Cascadia Code', Consolas, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px
components:
  sidebar-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.xs} {spacing.md}"
    height: 40px
  sidebar-item-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  sidebar-item-selected:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.primary}"
  sidebar-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  card-hover:
    backgroundColor: "{colors.surface-2}"
  page-title:
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
  tool-description:
    textColor: "{colors.text-3}"
    typography: "{typography.body-md}"
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: 34px
  text-input-focused:
    textColor: "{colors.ink}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 34px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-disabled:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-3}"
---
```

- [ ] **Step 2: 写正文章节**

按顺序写 `##` 章节，内容要求如下（每条都要落到可执行规则，不得写"保持简洁"这类空话）：

- `## Overview`：产品定位（开发者工具聚合站，118 个工具）；期望观感——信息密度高但克制、依赖中性灰阶分层而非阴影、绿色只用于主操作与激活态
- `## Colors`：逐条说明 7 个语义色 + 7 个中性色的用途与禁用场景；明确"绿色不得用于大面积填充背景""语义状态色必须配合文字或图标，不得只靠颜色区分"；记录暗色映射取值（canvas `#101014`、surface `#18181c`、surface-2 `#2c2c32`、hairline `rgba(255,255,255,0.24)`、ink `rgba(255,255,255,0.9)`、text-2 `rgba(255,255,255,0.82)`、text-3 `rgba(255,255,255,0.52)`）
- `## Typography`：7 级层级各自的使用场景（display-lg 仅页面主标题、heading-md 区块标题、body-md 正文与控件标签、code-md 代码与数据面）；禁止自定义字号
- `## Layout`：4px 基准间距；页面内容最大宽度 900px（工具页现状）；侧栏 240px / 折叠 60px；区块纵向节奏用 `section` 分隔
- `## Elevation & Depth`：亮色三级阴影（`shadow-card` / `shadow-popover` / `shadow-modal`）；暗色一律用 hairline 边框替代阴影
- `## Shapes`：圆角档位与适用面（控件与卡片 md/lg、标签 full 或 sm）；禁止自由圆角值
- `## Components`：逐个组件令牌说明状态（default / hover / focus-visible / disabled / selected），并写明"何时允许新增变体"——仅在现有变体无法表达语义时
- `## Do's and Don'ts`：至少各 5 条，覆盖硬编码颜色禁令、Naive 内部 class 禁令、只靠颜色传达状态禁令、阴影用于分层的禁令（暗色）
- `## Responsive Behavior`：现状为桌面优先，移动端断点 640px 的处理已有局部实现（ToolLayout），M2 系统化——本节标注为 M2 待补
- `## Accessibility`：对比度期望（正文 ≥ 4.5:1、大字号与控件 ≥ 3:1）；focus-visible 必须可见；`prefers-reduced-motion` 必须尊重
- `## Known Gaps`：标注 `needs-design-decision` — 移动端断点体系（M2）、工具组件局部样式迁移策略（M4）、图标尺寸规范

- [ ] **Step 3: 校验 frontmatter 可解析且引用有效**

Run: `node -e "const fs=require('fs');const t=fs.readFileSync('DESIGN.md','utf8');const m=t.match(/^---\n([\s\S]*?)\n---/);if(!m)throw new Error('no frontmatter');const y=m[1];const keys=['version','name','description','colors','typography','rounded','spacing','components'];for(const k of keys){if(!new RegExp('^'+k+':','m').test(y))throw new Error('missing '+k);}console.log('frontmatter keys OK');"`

Expected: 输出 `frontmatter keys OK`

- [ ] **Step 4: 校验所有令牌引用有定义**

Run: `node -e "const fs=require('fs');const t=fs.readFileSync('DESIGN.md','utf8');const refs=[...t.matchAll(/\{([a-z-]+)\.([a-z0-9-]+)\}/g)].map(m=>m[1]+'.'+m[2]);const uniq=[...new Set(refs)];const bad=uniq.filter(r=>{const [g,k]=r.split('.');const re=new RegExp('^  '+k+':','m');return !re.test(t);});if(bad.length){console.error('unresolved refs:',bad);process.exit(1);}console.log('resolved refs:',uniq.length);"`

Expected: 输出 `resolved refs: N`（N > 0），无 `unresolved refs`

- [ ] **Step 5: 跑 design.md lint（若 CLI 可用）**

Run: `npx --yes @google/design.md lint DESIGN.md`

Expected: 无 error 级问题。若 CLI 不可用（网络/包不存在），记录"design.md CLI 不可用，已用 Step 3–4 的本地校验替代"，并继续

- [ ] **Step 6: 提交**

```bash
git add DESIGN.md
git commit -m "docs: add DESIGN.md design contract"
```

---

### Task 2: 令牌单源与三处消费接线

**Files:**
- Create: `apps/web/src/styles/tokens.css`
- Create: `apps/web/src/styles/global.css`
- Modify: `apps/web/unocss.config.ts`
- Modify: `apps/web/src/App.vue`
- Modify: `apps/web/src/main.ts`

**Interfaces:**
- Consumes: Task 1 的 `DESIGN.md` frontmatter 令牌名与取值
- Produces: CSS 变量名集合（Task 3 直接消费）：`--color-{primary,primary-hover,primary-pressed,primary-soft,success,warning,error,info,canvas,surface,surface-2,hairline,ink,text-2,text-3}`、`--spacing-{xxs,xs,sm,md,lg,xl,xxl,section}`、`--radius-{none,sm,md,lg,xl,full}`、`--font-size-{display,heading-lg,heading-md,body-md,body-sm,caption,code}` + `--line-height-*` 同名后缀、`--font-family-base`、`--font-family-mono`、`--shadow-{card,popover,modal}`、`--motion-{fast,base,slow}`、`--motion-ease`；UnoCSS shortcuts `page-container`、`flex-center`、`flex-between`

- [ ] **Step 1: 写 tokens.css**

创建 `apps/web/src/styles/tokens.css`：

```css
:root {
  --color-primary: #18a058;
  --color-primary-hover: #36ad6a;
  --color-primary-pressed: #0c7a43;
  --color-primary-soft: rgba(24, 160, 88, 0.1);
  --color-success: #18a058;
  --color-warning: #f0a020;
  --color-error: #d03050;
  --color-info: #2080f0;

  --color-canvas: #fafafc;
  --color-surface: #ffffff;
  --color-surface-2: #f2f2f5;
  --color-hairline: #e5e5e8;
  --color-ink: rgba(0, 0, 0, 0.82);
  --color-text-2: rgba(0, 0, 0, 0.72);
  --color-text-3: rgba(0, 0, 0, 0.38);

  --spacing-xxs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  --spacing-section: 64px;

  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  --font-family-base: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
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

  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-popover: 0 6px 16px rgba(0, 0, 0, 0.12);
  --shadow-modal: 0 12px 32px rgba(0, 0, 0, 0.16);

  --motion-fast: 0.15s;
  --motion-base: 0.2s;
  --motion-slow: 0.3s;
  --motion-ease: ease-in-out;
}

html.dark {
  --color-primary-soft: rgba(24, 160, 88, 0.18);

  --color-canvas: #101014;
  --color-surface: #18181c;
  --color-surface-2: #2c2c32;
  --color-hairline: rgba(255, 255, 255, 0.24);
  --color-ink: rgba(255, 255, 255, 0.9);
  --color-text-2: rgba(255, 255, 255, 0.82);
  --color-text-3: rgba(255, 255, 255, 0.52);

  --shadow-card: none;
  --shadow-popover: none;
  --shadow-modal: none;
}
```

- [ ] **Step 2: 写 global.css**

创建 `apps/web/src/styles/global.css`（迁移自 `App.vue` 现有 `<style>` 块，字体走令牌）：

```css
body {
  margin: 0;
  font-family: var(--font-family-base);
  background-color: var(--color-canvas);
  color: var(--color-ink);
}

* {
  transition: background-color var(--motion-slow) var(--motion-ease),
    color var(--motion-base) var(--motion-ease),
    border-color var(--motion-slow) var(--motion-ease);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-text-3);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-2);
}

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 3: 在 main.ts 引入样式（顺序：令牌 → 全局 → Uno）**

修改 `apps/web/src/main.ts`，把样式导入改为：

```ts
import './styles/tokens.css';
import './styles/global.css';
import 'virtual:uno.css';
```

（替换原有的 `import 'virtual:uno.css';`）

- [ ] **Step 4: unocss.config.ts 的 theme 改为引用变量**

重写 `apps/web/unocss.config.ts`：

```ts
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  theme: {
    colors: {
      primary: 'var(--color-primary)',
      'primary-hover': 'var(--color-primary-hover)',
      'primary-pressed': 'var(--color-primary-pressed)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      info: 'var(--color-info)',
      canvas: 'var(--color-canvas)',
      surface: 'var(--color-surface)',
      'surface-2': 'var(--color-surface-2)',
      hairline: 'var(--color-hairline)',
      ink: 'var(--color-ink)',
      'text-2': 'var(--color-text-2)',
      'text-3': 'var(--color-text-3)',
    },
    spacing: {
      xxs: 'var(--spacing-xxs)',
      xs: 'var(--spacing-xs)',
      sm: 'var(--spacing-sm)',
      md: 'var(--spacing-md)',
      lg: 'var(--spacing-lg)',
      xl: 'var(--spacing-xl)',
      xxl: 'var(--spacing-xxl)',
      section: 'var(--spacing-section)',
    },
    borderRadius: {
      none: 'var(--radius-none)',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: 'var(--radius-full)',
    },
    fontFamily: {
      base: 'var(--font-family-base)',
      mono: 'var(--font-family-mono)',
    },
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'page-container': 'max-w-[900px] mx-auto p-lg',
  },
});
```

- [ ] **Step 5: App.vue 的 themeOverrides 改为引用变量，并删除内联样式块**

修改 `apps/web/src/App.vue`：

1. 删除整个 `<style>...</style>` 块（内容已迁入 `global.css`），模板根节点保留
2. 把 `themeOverrides` 从 `computed` 改为普通常量，并改用 CSS 变量：

```ts
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: 'var(--color-primary)',
    primaryColorHover: 'var(--color-primary-hover)',
    primaryColorPressed: 'var(--color-primary-pressed)',
    primaryColorSuppl: 'var(--color-primary-hover)',
    borderRadius: 'var(--radius-md)',
  },
};
```

3. 模板中 `:theme-overrides="themeOverrides"` 保持不变；`computed` 仍被 `theme`、`showSidebar` 使用，import 保留

- [ ] **Step 6: 类型检查与单测**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test`

Expected: type-check 无输出即通过；vitest `4 passed`

- [ ] **Step 7: 运行时验证 Naive 是否接受 CSS 变量（关键风险点）**

Naive UI 会对部分颜色做派生计算（seemly 的 `changeColor`/`composite`），传 `var(...)` 可能产出无效值。必须实测。

启动（若 3000 端口已有 dev server，直接复用，不要重复启动）：

```bash
pnpm dev:web
```

在浏览器打开 `http://localhost:3000/`（**不要开 3001，那是 API 端口**），执行 DOM 检查：

```js
() => {
  const btn = document.querySelector('.n-button--primary-type');
  const tag = document.querySelector('.n-tag');
  return {
    buttonBg: btn ? getComputedStyle(btn).backgroundColor : null,
    tagColor: tag ? getComputedStyle(tag).color : null,
    tokenPrimary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
    tokenRadius: getComputedStyle(document.documentElement).getPropertyValue('--radius-md').trim(),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 30),
  };
}
```

Expected: `buttonBg` 为 `rgb(24, 160, 88)`（即 `#18a058` 已解析）；`tokenPrimary` 为 `#18a058`；`bodyBg` 为 `rgb(250, 250, 252)`；`bodyFont` 以 `system-ui` 开头。若页面上没有主色按钮，改点一个会渲染 primary 按钮的页面（如工具页的提交按钮）再测。

**若 `buttonBg` 为 `rgba(0, 0, 0, 0)` 或色值异常（说明 Naive 无法解析 var()）**，执行回退方案并记录：
1. 新建 `apps/web/src/styles/naive-theme.ts`，导出字面量常量：

```ts
export const naiveThemeOverrides = {
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
    primaryColorSuppl: '#36ad6a',
    borderRadius: '6px',
  },
} as const;
```

2. `App.vue` 改 import 该常量，删除本地 themeOverrides
3. 新增 `apps/web/src/__tests__/tokens.test.ts` 断言字面量与 `tokens.css` 一致（读文件正则提取 `--color-primary` 等值比对），防止漂移：

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { naiveThemeOverrides } from '@/styles/naive-theme';

const tokensCss = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');
const readToken = (name: string) =>
  tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

describe('naive theme overrides stay in sync with tokens.css', () => {
  it('primary colors match tokens', () => {
    expect(naiveThemeOverrides.common.primaryColor).toBe(readToken('color-primary'));
    expect(naiveThemeOverrides.common.primaryColorHover).toBe(readToken('color-primary-hover'));
    expect(naiveThemeOverrides.common.primaryColorPressed).toBe(readToken('color-primary-pressed'));
    expect(naiveThemeOverrides.common.borderRadius).toBe(readToken('radius-md'));
  });
});
```

4. 重跑 Step 6 与 Step 7，确认 `buttonBg` 为 `rgb(24, 160, 88)`

- [ ] **Step 8: 暗色与亮色视觉核对**

同一页面切换主题（`html.dark` class），确认：

```js
() => {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  return {
    isDark,
    canvas: getComputedStyle(root).getPropertyValue('--color-canvas').trim(),
    surface: getComputedStyle(root).getPropertyValue('--color-surface').trim(),
    ink: getComputedStyle(root).getPropertyValue('--color-ink').trim(),
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
}
```

Expected: 暗色时 `--color-canvas` 为 `#101014`、`--color-surface` 为 `#18181c`、`--color-ink` 为 `rgba(255, 255, 255, 0.9)`，`bodyBg` 与 canvas 一致；亮色时 `--color-canvas` 为 `#fafafc`。截图保存到 `.scratch/m1-tokens-{light,dark}.png`

- [ ] **Step 9: lint 不新增错误**

Run: `pnpm --filter @toolnest/web lint`

Expected: 错误数仍为 68（当前存量）。若多于 68，先修掉新增项再提交。可用 `npx --yes eslint src --ext .vue,.ts,.tsx 2>&1 | tail -3` 在 `apps/web` 目录下核对总数

- [ ] **Step 10: 提交**

```bash
git add apps/web/src/styles/tokens.css apps/web/src/styles/global.css apps/web/src/main.ts apps/web/unocss.config.ts apps/web/src/App.vue
git commit -m "feat(ui): add CSS design tokens and global styles"
```

（若执行了 Step 7 回退方案，一并 `git add apps/web/src/styles/naive-theme.ts apps/web/src/__tests__/tokens.test.ts`）

---

### Task 3: 布局壳层应用令牌

**Files:**
- Modify: `apps/web/src/layouts/AppLayout.vue`
- Modify: `apps/web/src/layouts/ToolLayout.vue`

**Interfaces:**
- Consumes: Task 2 的 CSS 变量与 `page-container` shortcut
- Produces: 无新增接口。`AppLayout.vue` 的 `<style>` 块中暗色侧栏背景硬编码 `#18181c` 被移除，改由 `--color-surface` 承担

- [ ] **Step 1: AppLayout.vue 侧栏令牌化**

修改 `apps/web/src/layouts/AppLayout.vue`：

1. Logo 区 `padding: 16px` → `var(--spacing-md)`；`border-bottom: 1px solid var(--n-border-color)` → `1px solid var(--color-hairline)`
2. 分类列表容器 `padding: 8px 0` → `var(--spacing-xs) 0`
3. 分类项 style 对象改为令牌（`borderRadius: '6px'` → `var(--radius-md)`，`margin: '2px 8px'` → `2px var(--spacing-xs)`，`padding` 的 `10px 16px` → `10px var(--spacing-md)`，`gap: '12px'` → `var(--spacing-xs)`，`backgroundColor: 'rgba(24,160,88,0.12)'` → `var(--color-primary-soft)`，`color: '#18a058'` → `var(--color-primary)`，`transition: 'background-color 0.2s'` → `background-color var(--motion-base) var(--motion-ease)`）
4. 分类文字 `font-size: 14px` → `var(--font-size-body-md)`
5. Footer `padding: 12px 16px` → `var(--spacing-sm) var(--spacing-md)`；`border-top` 改用 `var(--color-hairline)`
6. 删除文件末尾整个 `<style>` 块（暗色侧栏背景 `#18181c` 由 `--color-surface` 承担，无需 `!important` 覆盖）
7. 内容区 `marginLeft` 的 `transition: 'margin-left 0.3s'` → `margin-left var(--motion-slow) var(--motion-ease)`

- [ ] **Step 2: ToolLayout.vue 令牌化**

修改 `apps/web/src/layouts/ToolLayout.vue`：

1. 模板根节点 class 由 `tool-layout` 改为使用 UnoCSS shortcut：`class="page-container"`，并从 scoped 样式中删除 `.tool-layout` 规则（`max-width` / `margin` / `padding` 三行）
2. 面包屑 `style="margin-bottom: 16px;"` → `margin-bottom: var(--spacing-md)`
3. `.tool-header` 的 `margin-bottom: 24px` → `var(--spacing-lg)`；`padding-bottom: 16px` → `var(--spacing-md)`；`border-bottom` 改用 `var(--color-hairline)`
4. `.tool-title` 的 `font-size: 28px` → `var(--font-size-display)`；`line-height: 1.2` → `var(--line-height-display)`；`font-weight: 700` → `var(--font-weight-semibold)`；`margin: 0 0 8px 0` → `0 0 var(--spacing-xs) 0`
5. `.tool-description` 的 `font-size: 15px` → `var(--font-size-body-md)`；`color: var(--n-text-color-3)` → `var(--color-text-3)`；`line-height: 1.5` → `var(--line-height-body-md)`
6. 收藏按钮激活色 `color: isFavorite ? '#f0a020' : undefined` → `color: isFavorite ? 'var(--color-warning)' : undefined`
7. `@media (max-width: 640px)` 内的 `padding: 16px` → `var(--spacing-md)`；`.tool-title` 的 `font-size: 22px` → `var(--font-size-heading-lg)`；`.tool-header-actions` 的 `margin-top: 12px` → `var(--spacing-sm)`

- [ ] **Step 3: 类型检查、单测、lint**

Run: `pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test && pnpm --filter @toolnest/web lint`

Expected: type-check 通过；vitest `4 passed`；lint 错误数仍为 68

- [ ] **Step 4: 浏览器验证布局未回退**

在已有 dev server 上（复用 3000 端口）：

1. 打开 `http://localhost:3000/`，执行 Step 5 的检查脚本，确认侧栏渲染与令牌生效：

```js
() => {
  const sider = document.querySelector('.n-layout-sider');
  const items = [...document.querySelectorAll('.n-layout-sider [class*="menu"]')];
  const active = items.find(el => getComputedStyle(el).color === 'rgb(24, 160, 88)');
  return {
    siderWidth: sider ? Math.round(sider.getBoundingClientRect().width) : null,
    siderBg: sider ? getComputedStyle(sider).backgroundColor : null,
    hasActiveItem: !!active,
    canvasToken: getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim(),
  };
}
```

Expected: `siderWidth` 为 240（展开态）；`siderBg` 亮色为 `rgb(255, 255, 255)`、暗色为 `rgb(24, 24, 28)`；`hasActiveItem` 为 true（存在绿色激活项）

2. 打开一个工具页（如 `http://localhost:3000/tools/uuid-generator`），确认标题、描述、面包屑、收藏按钮渲染正常
3. 切换暗色，确认侧栏背景为 `rgb(24, 24, 28)` 且无 `!important` 覆盖残留
4. 截图存 `.scratch/m1-layout-{home,tool}-{light,dark}.png`，与 `.scratch/` 中 M1 前基线（`verify-sidebar-*.png`、`reverify-*.png`）逐张目视对比，确认除令牌化带来的细微差异外无回退
5. 若发现回退（间距错乱、颜色异常、激活态丢失），先修复并重跑 Step 3、Step 4，不得带问题提交

- [ ] **Step 5: 提交**

```bash
git add apps/web/src/layouts/AppLayout.vue apps/web/src/layouts/ToolLayout.vue
git commit -m "refactor(ui): apply design tokens to app shell layouts"
```

---

## 已知副作用与注意事项

1. **UnoCSS `borderRadius` 主题被接管**：覆盖 `sm/md/lg/xl/full` 后，存量页面里 `rounded-*` 工具类的实际圆角值会微小变化（例如 `rounded-md` 由 0.375rem 变为 6px）。这是统一化的预期结果，但必须由 Task 3 Step 4 的截图对比确认无视觉回退；若发现某个组件圆角明显异常，记录下来并在 M3 处理，不在本模块扩大范围。

2. **UnoCSS 颜色透明度修饰符不可用**：`bg-primary/10` 这类写法对 `var()` 无效。需要浅色底时使用 `--color-primary-soft` 令牌，不要用 `/opacity` 修饰符。

3. **CJK 字体渲染**：`--font-family-base` 追加了 `PingFang SC` / `Microsoft YaHei`，Windows 上中文渲染可能比先前略有变化（此前无显式中文回退）。Task 3 Step 4 对比截图时留意中文字重是否异常。

4. **`*` 全局过渡仍保留**：`global.css` 沿用了 `*` 通配过渡（原本在 `App.vue`）。这是性能反模式（对每个元素挂过渡），但属于 M2 范围；本模块只做令牌化，不改行为。

## Self-Review

**Spec 覆盖核对**

| Spec 要求 | 对应任务 |
|---|---|
| DESIGN.md 按 design-md-review schema（六组 frontmatter + 规定章节） | Task 1 Step 1–2 |
| 令牌唯一事实源 `tokens.css`（亮/暗两套映射） | Task 2 Step 1 |
| UnoCSS theme 引用变量 | Task 2 Step 4 |
| Naive themeOverrides 引用变量 | Task 2 Step 5 |
| global.css 承接 App.vue 全局样式 | Task 2 Step 2–3 |
| AppLayout / ToolLayout 首批消费示范 | Task 3 Step 1–2 |
| 暗色中性色对齐 Naive 基值 | Task 2 Step 1（值取自 Plan 顶部对照表）、Step 8 验证 |
| DESIGN.md 校验（lint 或本地校验） | Task 1 Step 3–5 |
| 每个提交过 type-check / test / lint | Task 1 Step 3–4、Task 2 Step 6+9、Task 3 Step 3 |
| 浏览器截图对比基线 | Task 2 Step 7–8、Task 3 Step 4 |
| 分支从 master 切出、按模块提交 | 执行前准备 P1–P2、各任务末步提交 |
| 完成后合并回 master | 见「执行方式」节 |

**占位符扫描**：无 TBD/TODO；所有 CSS/TS/YAML 值均已给出具体数值；无需推断的签名。

**接口一致性核对**：Task 2 Produces 列出的变量名与 Task 3 各 Step 中引用的变量名逐一比对一致（`--color-primary-soft`、`--color-hairline`、`--radius-md`、`--font-size-body-md`、`--font-size-display`、`--line-height-display`、`--font-size-heading-lg`、`--font-weight-semibold`、`--motion-base`、`--motion-slow`、`--motion-ease`、`--spacing-*`）；Task 2 定义的 `page-container` shortcut 与 Task 3 Step 2 的 `class="page-container"` 一致。

## 执行方式

按模块内任务顺序执行（Task 1 → Task 2 → Task 3），每个任务结束时提交。全部完成后：

1. 运行全量检查：`pnpm --filter @toolnest/web type-check && pnpm --filter @toolnest/web test && pnpm --filter @toolnest/web lint`
2. 审查差异：`git log --oneline master..HEAD`、`git diff master...HEAD --stat`
3. 合并回本地 master：

```bash
git checkout master
git merge --no-ff refactor/m1-design-foundation -m "merge: M1 design foundation"
git log --oneline -3
```

4. 若检查失败或出现冲突且无法安全解决：停止合并，保留 `refactor/m1-design-foundation` 分支，说明具体失败原因与已尝试的处理，等待用户决策。
5. 向用户报告：分支名、3 个提交的 hash 与标题、合并结果、验证证据。
