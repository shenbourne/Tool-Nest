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
