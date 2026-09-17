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

## Overview

ToolNest 是一个开发者工具聚合站，当前收录 118 个工具（编码、加解密、格式化、网络、数据等分类），用户绝大多数时间停留在单个工具页完成一次性任务。

期望观感：

- **高信息密度但克制**：一屏内尽量容纳工具本体（输入、输出、参数），去掉装饰性留白与营销式大标题；密度靠 4px 间距基准与紧凑控件高度（34px）达成，不靠缩小字号。
- **分层依赖中性灰阶**：surface / surface-2 / hairline 三级中性色承担"卡片嵌卡片"的层级表达，阴影只留给临时层（popover / modal）。
- **绿色只用于主操作与激活态**：primary 绿仅出现在主按钮、选中态、激活态与聚焦指示上，页面背景、卡片、正文一律保持中性。

## Colors

语义色（7 个）：

- `primary`：品牌主色，主按钮背景、选中态文字、激活指示。禁止用作大面积背景填充（页面、卡片、横幅）。
- `primary-hover`：primary 交互目标在 hover 态的背景。仅允许出现在交互目标的 hover 态。
- `primary-pressed`：primary 交互目标在 active/pressed 态的背景。仅允许出现在 pressed 态。
- `success`：操作成功反馈（如"已复制"提示）。必须与文字或图标配合，禁止只以绿色块表示成功。
- `warning`：需要用户注意的中间态（如覆盖确认）。禁止用于装饰性高亮。
- `error`：校验失败、破坏性操作警示。禁止用于普通强调文本（强调用字重而非颜色）。
- `info`：中性提示信息（如说明、提示气泡）。禁止用于主操作。

中性色（7 个）：

- `canvas`：页面最底层背景。禁止用于任何前景元素。
- `surface`：卡片、输入框、面板背景。禁止用于文字。
- `surface-2`：hover 背景、嵌套层级背景、disabled 控件背景。禁止作为文字颜色。
- `hairline`：分隔线、边框。必须 1px，禁止用作阴影替代以外的填充。
- `ink`：最高层级文字（标题、正文）。
- `text-2`：次级文字（控件标签、侧栏条目）。
- `text-3`：辅助文字（说明、占位、disabled 文字）。

两条硬性规则：

1. 绿色（primary 系）不得用于大面积填充背景。
2. 语义状态色（success / warning / error / info）必须配合文字或图标出现，不得只靠颜色区分状态。

暗色主题映射（实现 tokens.css 暗色变体时使用）：

| 亮色令牌 | 亮色值 | 暗色值 |
|---|---|---|
| canvas | `#fafafc` | `#101014` |
| surface | `#ffffff` | `#18181c` |
| surface-2 | `#f2f2f5` | `#2c2c32` |
| hairline | `#e5e5e8` | `rgba(255,255,255,0.24)` |
| ink | `rgba(0,0,0,0.82)` | `rgba(255,255,255,0.9)` |
| text-2 | `rgba(0,0,0,0.72)` | `rgba(255,255,255,0.82)` |
| text-3 | `rgba(0,0,0,0.38)` | `rgba(255,255,255,0.52)` |

语义色在暗色下沿用 Naive UI 暗色基值，不在本契约内另行规定。

## Typography

7 级层级，每级的使用场景固定，禁止自定义字号：

- `display-lg`（28/700）：仅页面主标题（工具页标题），每页最多一处。
- `heading-lg`（22/600）：页内大区块标题（如设置页分区），工具页内原则上不出现。
- `heading-md`（18/600）：区块标题（卡片组、结果区标题）。
- `body-md`（14/400）：正文、控件标签、按钮文字，是默认文本层级。
- `body-sm`（13/400）：表格行、紧凑列表、工具卡片上的次要信息。
- `caption`（12/400）：辅助说明、时间戳、计数徽标。
- `code-md`（13，等宽）：代码、哈希值、IP、UUID 等数据面内容。

任何场景不得写 frontmatter 之外的字号、字重或行高；强调一律用既有层级的字重差异表达，不得通过增大字号制造层级。

## Layout

- 间距基准为 4px，所有内外边距必须是 `{spacing}` 档位（xxs–section）的倍数组合。
- 页面内容最大宽度 900px（工具页现状），水平居中；编辑器/输出区不受此限时可局部放宽，但需在本契约后续版本中显式记录。
- 侧栏展开 240px、折叠 60px；折叠态只保留图标，不截断文字。
- 区块之间的纵向节奏用 `spacing.section`（64px）分隔，区块内部用 `spacing.lg`（24px）以内的小档；相邻区块禁止用裸 `<br>` 或多个空 div 撑间距。

## Elevation & Depth

亮色主题三级阴影，只允许出现在对应层级：

- `shadow-card`：悬浮卡片（工具卡片 hover 抬升）。卡片默认态无阴影，靠 hairline 边框分层。
- `shadow-popover`：下拉、菜单、气泡。
- `shadow-modal`：对话框，全站最高层级。

暗色主题一律不使用阴影，改用 hairline 边框表达层级与边界；即暗色下 `shadow-*` 三个令牌不输出阴影。

## Shapes

圆角档位：`none`（面板、表格）、`sm`（小标签）、`md`（输入框、按钮、侧栏条目）、`lg`（卡片）、`xl`（大容器，预留）、`full`（圆形头像、计数点）。

- 控件与卡片只允许 `md` / `lg`；标签只允许 `full` 或 `sm`。
- 禁止任何 frontmatter 之外的自由圆角值（包括 `border-radius: 2px`、`50%` 之类手写值，`50%` 场景用 `full` 表达）。

## Components

组件令牌按 `default / hover / focus-visible / disabled / selected` 五态组织；未单列的变体继承 default 令牌的其余属性。

- `sidebar-item`（default）：侧栏导航条目，surface 底、text-2 字、body-md、高 40px。
  - `sidebar-item-hover`：surface-2 底、ink 字。
  - `sidebar-item-selected`：surface-2 底、primary 字——选中态用颜色表达，不加粗。
  - focus-visible：由 Naive UI 组件自身的聚焦环保证，禁止自绘。
- `sidebar-panel`：侧栏容器，surface 底、无圆角。
- `card`：工具卡片与内容容器，surface 底、lg 圆角、md 内边距。
  - `card-hover`：surface-2 底；hover 只改底色，不加阴影（阴影仅 `shadow-card` 允许的场景）。
- `page-title`：display-lg、ink，仅工具页标题。
- `tool-description`：body-md、text-3，工具描述与辅助说明。
- `text-input`：surface 底、ink 字、md 圆角、高 34px。
  - `text-input-focused`：ink 字；聚焦边框由 Naive UI 主题变量提供。
  - disabled：底与文字沿用 button-primary-disabled 的中性降级规则（surface-2 底、text-3 字）。
- `button-primary`：primary 底、白字、body-md、md 圆角、高 34px。
  - `button-primary-hover`：primary-hover 底。
  - `button-primary-disabled`：surface-2 底、text-3 字，禁用态不得保留 primary 色相。

何时允许新增变体：仅当现有变体无法表达某个明确语义状态（例如错误态输入框）时，才允许新增组件令牌；新增必须走设计评审并回填本文件 frontmatter，禁止在代码里先斩后奏。

## Do's and Don'ts

Do：

1. 颜色一律引用 `{colors.*}` 令牌，暗色适配由 tokens.css 的变体承担。
2. 文字一律使用 7 级层级之一，优先 body-md / body-sm。
3. hover 反馈优先用 surface-2 底色切换，其次才是 shadow-card。
4. 状态变化必须同时有颜色与文字/图标双通道表达。
5. 间距、圆角、高度只取 frontmatter 档位值。

Don't：

1. 禁止硬编码任何十六进制/rgba 颜色值到组件样式（白字 `#ffffff` 仅允许作为 button-primary 的 textColor 令牌值存在）。
2. 禁止在业务代码里覆盖或依赖 Naive UI 内部 class（如 `.n-button__content`）写样式；只通过官方 theme-overrides 与 tokens.css 变量定制。
3. 禁止只靠颜色传达状态（红/绿块裸用），必须附图标或文字。
4. 禁止在暗色主题下使用阴影分层，一律用 hairline 边框替代。
5. 禁止为卡片默认态添加阴影——默认态层级由 hairline 边框与中性底色表达，阴影只给 popover/modal。
6. 禁止自定义字号、行高、圆角值或间距值。

## Responsive Behavior

现状为桌面优先：布局按桌面视口设计，移动端断点 640px 以下的处理仅有局部实现（ToolLayout 中的简易适配），尚未体系化。

本节标注为 **M2 待补**：断点体系、移动端侧栏行为、触控目标尺寸将在 M2 中系统化并回填本节。

## Accessibility

- 对比度期望：正文文字（body-md/sm、caption）≥ 4.5:1；大字号（display-lg、heading-lg/md）与控件 ≥ 3:1。text-3 仅允许用于非必要辅助信息；承载关键信息的文字不得低于 text-2。
- 所有交互控件必须有可见的 focus-visible 指示，禁止 `outline: none` 后不补替代方案。
- 必须尊重 `prefers-reduced-motion`：动画时长令牌在 reduced-motion 下一律视为 0，阴影/hover 过渡直接切换。
- 图标按钮必须提供 aria-label。

## Known Gaps

以下条目标记为 `needs-design-decision`：

1. 移动端断点体系与移动端导航形态（M2）。
2. 工具组件局部样式（scoped 覆盖 Naive 组件的散落 CSS）向 tokens.css 迁移的策略（M4）。
3. 图标尺寸规范（目前仅有约定俗成的 16/20px 用法，无正式令牌）。
