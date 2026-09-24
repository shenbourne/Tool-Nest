# Notion 风格 UI 整体换肤 — 设计契约 v2 与令牌重构

> 状态：已确认（2026-09-24 brainstorming）
> 上级规划：前端重构 7 模块计划（M1 设计地基已完成）。本 spec 是跨模块的视觉换肤层：重写 DESIGN.md 为 v2 契约、重建令牌体系、重映射 Naive 主题、换装壳层组件；M2–M6 的结构性工作在其之上继续。
> 参考材料：`notion-design.md`（Notion 官网 design.md 分析，35KB，已存仓库根目录）

## 背景与目标

M1 建立了以绿色 `#18a058` 为主色的设计令牌体系与 DESIGN.md 契约。本次基于 Notion 的 design.md 对前端 UI 做**整体换肤**：保留信息架构与全部功能，替换视觉语言——温暖中性灰阶、编辑器白画布、青绿主色、Inter 字体、Notion 式"浮起感"层级。

关键杠杆：审计确认 **209 个工具页几乎不消费设计令牌**（0 个工具文件使用 spacing/radius/font-size/语义色令牌），它们全部通过 Naive UI 组件渲染。因此换肤的最高杠杆点是 **Naive UI 主题映射**——主题一变，全部工具页自动继承。令牌重编号（间距/圆角改为 Notion 档位）经核实零风险（无任何工具文件引用旧档位名）。

### 非目标（本 spec 不负责）

- 布局结构、导航形态、响应式体系改造（M2）
- 共享组件库建设与工具页模式统一（M3/M4）
- 可访问性全面整改（M5）；lint/type 代码债（M6）
- 暗色"无阴影"旧契约的执行（本次明确推翻该条，见决策 3）

## 设计决策汇总（brainstorming 已定）

1. **品牌方向**：取 Notion 骨架 + 自有品牌色。布局与排版节奏学 Notion（侧边栏布局保留，仅换皮肤），主色不用 Notion 紫，用 Notion 品牌青绿加深版 **`#0f766e`**（白字对比度 5.47:1，通过 WCAG AA；Notion 原值 `#2a9d99` 仅 3.27:1，不可用）。
2. **范围与深度**：接受全量清理——动手改 24 个工具文件中的 52 处硬编码颜色（`#d03050`×8、`#18a058`×7 等），并新增 `@fontsource/inter` 依赖。
3. **密度与阴影（推翻 v1 契约三条）**：
   - 控件高度 34px → **36px**（用户定"挤中"；Notion 官网 44px 对工具站过疏）；
   - 推翻"暗色禁用阴影"与"卡片 hover 不加阴影"两条，**改用 Notion 官网的浮起感**：卡片默认 hairline 边框 + hover 微阴影抬升，暗色下同样使用阴影（用深色阴影值，不是亮色值直接搬）；
   - DESIGN.md **原地重写为 v2 契约**（推荐方案），frontmatter 全量替换，冲突条款以本 spec 为准。
4. **语义陷阱处理**：`canvas`/`surface` 语义按 Notion 反转（canvas=页面底=白，surface=区块底=暖灰）。经 grep 核实，引用这两个令牌的非工具文件仅 global.css 与 tokens.css，风险可控。
5. **迁移期别名**：`--color-text-2`、`--color-text-3` 保留为 alias（指向新灰阶 ramp），避免一次性改 200+ 处引用；`--color-primary-soft`（AppLayout 在用）保留，定义为 primary 10% 透明。

## 令牌体系 v2

### 语义色（亮 / 暗）

| Token | 亮色 | 暗色 | 用途 |
|---|---|---|---|
| `--color-primary` | `#0f766e` | `#2dd4bf` | 主按钮、选中态、链接级强调 |
| `--color-primary-hover` | `#12897f` | `#5eead4` | primary 悬停 |
| `--color-primary-pressed` | `#0b5c56` | `#14b8a6` | primary 按下 |
| `--color-primary-soft` | `rgba(15,118,110,0.10)` | `rgba(45,212,191,0.15)` | 激活/选中底、聚焦底（AppLayout 已用） |
| `--color-link` | `#0075de` | `#4ba3f5` | 文本链接（区别于按钮主色） |
| `--color-success` | `#1aae39` | `#23a55b` | 成功态（Naive 对齐） |
| `--color-warning` | `#dd5b00` | `#f0a020` | 警告态（Naive 对齐） |
| `--color-error` | `#e03131` | `#e03131` | 错误态（Naive 对齐） |
| `--color-info` | `#0075de` | `#4ba3f5` | 信息态 |

暗色主色改用亮青绿（teal-400 档）是标准做法：暗底上深青绿对比不足，`#2dd4bf` 对 `#191919` 对比度 >7:1。

### 中性色（温暖灰阶；暗色对齐 Naive dark 基值）

| Token | 亮色 | 暗色 |
|---|---|---|
| `--color-canvas` | `#ffffff` | `#191919` |
| `--color-surface` | `#f6f5f4` | `#202020` |
| `--color-surface-soft` | `#fafaf9` | `#252525` |
| `--color-surface-2` | `#f0eeec` | `#2a2a2a` |
| `--color-hairline` | `#e5e3df` | `rgba(255,255,255,0.13)` |
| `--color-hairline-strong` | `#c8c4be` | `rgba(255,255,255,0.22)` |
| `--color-ink` | `#1a1a1a` | `#e8e6e3` |
| `--color-text-2` | alias → `#5f5e5b` | alias → `#b0aeab` |
| `--color-text-3` | alias → `#97958f` | alias → `#8a8883` |
| `--color-muted` | `#bbb8b1` | `#6f6d68` |

灰阶取 Notion 暖灰（stone 系），与 Inter 的字怀气质一致。`surface-soft` 为新增档（编辑器输出区、嵌入式面板）。

### 字体

- 正文栈：Inter（@fontsource/inter，权重 400/500/600/700）+ 系统中文回退 `'PingFang SC', 'Microsoft YaHei', sans-serif`；代码栈不变。
- 7 级排版层级**名称与数值不变**（display-lg 28/36 等），仅字体族换 Inter；行高对拉丁文略微富余但可接受，M4 时若密集页面感到松散再微调 body 档行高（属本契约允许的调参，不改层级结构）。

### 间距（改为 Notion 12 档，4px 基准）

`xxs 4 / xs 8 / sm 12 / md 16 / lg 24 / xl 32 / xxl 48 / xxxl 64 / section 80 / section-lg 120 / section-xl 160 / section-xxl 200`

映射：v1 `--spacing-section` 64 → v2 `--spacing-xxxl`。核实无工具文件引用旧档位，重命名安全。

### 圆角（改为 Notion 8 档）

`none 0 / xs 2 / sm 4 / md 6 / lg 8 / xl 12 / xxl 16 / full 9999`

映射：v1 `--radius-md` 6 → v2 `--radius-lg`（Naive borderRadius 同步 6→8，与 Notion 按钮一致）。工具页原生元素引用的旧 `--radius-md` 逐文件改为 `--radius-lg`（仅壳层与少量文件，grep 清单已确认）。

### 阴影（推翻 v1：亮暗都用阴影，Notion 5 级简化为 3 级）

| Token | 亮色 | 暗色 |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgba(15,15,15,0.04), 0 4px 12px rgba(15,15,15,0.06)` | `0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.36)` |
| `--shadow-popover` | `0 4px 16px rgba(15,15,15,0.10), 0 12px 32px rgba(15,15,15,0.08)` | `0 4px 16px rgba(0,0,0,0.52), 0 12px 32px rgba(0,0,0,0.44)` |
| `--shadow-modal` | `0 8px 24px rgba(15,15,15,0.14), 0 24px 64px rgba(15,15,15,0.12)` | `0 8px 24px rgba(0,0,0,0.6), 0 24px 64px rgba(0,0,0,0.52)` |

卡片默认态：hairline 边框、无阴影；hover 抬升：`--shadow-card` + 边框色加深至 `--color-hairline-strong`。暗色 hover 同样抬升（深色阴影值）。

### 动效

`--motion-fast 120ms / --motion-base 160ms / --motion-slow 240ms`，缓动统一 `cubic-bezier(0.2, 0, 0.2, 1)`。`prefers-reduced-motion` 降级保留。

## Naive UI 主题映射（最高杠杆）

`naive-theme.ts` 重写为完整映射（亮暗各自一份，随主题切换）：

- common：primaryColor 系 ← primary 三态 + primary-hover；success/warning/error/info ← 对应令牌；borderRadius `8px`；fontFamily ← Inter 栈；textColorBase ← ink；bodyColor ← canvas；cardColor ← surface；modalColor/popoverColor ← canvas（弹出层用纯白/纯深，与页面区块区分）；borderColor/dividerColor ← hairline；borderRadiusSmall `4px`、borderRadiusMedium `8px`、borderRadiusLarge `12px`。
- 暗色 common：bodyColor `#191919`、cardColor `#202020`、textColorBase `#e8e6e3`、borderColor `rgba(255,255,255,0.13)`，primary 用亮青绿四态。
- 明确不覆盖 Naive 内部 class，全部走 themeOverrides。

## 组件与布局

- **AppLayout**：侧栏背景 `--color-canvas`（白）+ hairline 右边框；logo 区高 52px；条目高 36px、圆角 `--radius-lg`、选中态 primary-soft 底 + primary 字 + 左侧 3px primary 指示条；分组标题 12px 500 text-3 全大写；滚动条细化为 10px 中性滑块。内联样式迁 scoped CSS。
- **ToolLayout**：标题 display-lg 28px/700 ink；描述 body-md text-3；面包屑 caption 级；工具区卡片 surface 底 hairline 边框 lg 圆角；收藏星标按钮 icon 化（☆/★ 保留文字符号但按 primary 着色选中态）。
- **ToolCard**：卡片 lg 圆角 hairline 边框，hover 抬升（shadow-card + hairline-strong 边框）；标题 body-md 600（15px 硬编码→token 层级）；描述 2 行截断 text-3；分类标签 type=info、tags 默认边框标签。
- **全局**：body 背景 canvas、文字 ink；`page-container` 最大宽度 900px 不变；全局过渡改用新 motion 令牌时长。

## DESIGN.md v2 重写要点

原地重写仓库根 DESIGN.md：frontmatter 全量替换为 v2 令牌（colors/typography/rounded/spacing/components）；正文章节保留 M1 结构（Overview/Colors/Typography/Layout/Elevation/Shapes/Components/Do's and Don'ts/Responsive/Accessibility/Known Gaps），冲突条款按本 spec 更新：主色绿→青绿、控件 34→36px、暗色禁用阴影→暗色启用深色阴影、卡片 hover 纯底色→hover 浮起、canvas/surface 语义反转。版本号 `version: v2`。Known Gaps 保留 M2 移动断点与图标尺寸规范两条，移除已解决的"暗色阴影"相关缺口。

## 交付文件

| 动作 | 文件 | 说明 |
|---|---|---|
| 重写 | `apps/web/src/styles/tokens.css` | 令牌体系 v2（上表全量，亮暗双映射） |
| 重写 | `apps/web/src/styles/naive-theme.ts` | 完整亮暗主题映射（最高杠杆，209 工具页自动继承） |
| 重写 | `DESIGN.md` | 设计契约 v2（原地重写） |
| 修改 | `apps/web/src/styles/global.css` | Inter 接线、新 motion 时长、canvas 语义适配 |
| 修改 | `apps/web/unocss.config.ts` | theme 引用新变量；fontFamily 换 Inter 栈 |
| 修改 | `apps/web/package.json` | 新增 `@fontsource/inter` |
| 修改 | `apps/web/src/layouts/AppLayout.vue` | 侧栏换肤 + 内联样式迁 scoped CSS |
| 修改 | `apps/web/src/layouts/ToolLayout.vue` | 工具页头部换肤 |
| 修改 | `apps/web/src/components/ToolCard.vue` | 卡片 hover 浮起、字号令牌化 |
| 清理 | 24 个工具文件（grep 清单） | 52 处硬编码颜色改为语义令牌或删除 |
| 删除 | `notion-design.md`（迁移完成后） | 参考材料，随收尾提交移除 |

## 实施阶段

1. **令牌层**：tokens.css v2 + global.css + unocss.config.ts + package.json（Inter）
2. **Naive 映射**：naive-theme.ts 亮暗完整映射
3. **壳层组件**：AppLayout / ToolLayout / ToolCard
4. **页面验证**：首页、全部工具页、分类页走查亮暗两主题
5. **暗色专项**：暗色阴影、亮青绿主色走查
6. **工具文件清扫**：24 文件 52 处硬编码颜色清零
7. **DESIGN.md v2 重写 + 收尾**：契约回填、基线截图更新（.scratch/）、删除 notion-design.md

## 验证标准

1. `pnpm --filter @toolnest/web type-check` 通过
2. `pnpm --filter @toolnest/web test` 通过
3. `pnpm --filter @toolnest/web lint` 不新增错误
4. `pnpm --filter @toolnest/web build` 通过
5. 浏览器走查：首页 + 不少于 3 个代表工具页（文本类/文件类/网络类各一）+ 分类页，亮/暗各一；卡片 hover 抬升、主按钮三态、选中态、弹出层（下拉/对话框）均正常；无绿系残留（抽查 grep `#18a058`/`#36ad6a`/`#0c7a43` 为 0，允许注释与 DESIGN.md 历史段落除外）
6. 走查截图存 `.scratch/` 作为 M7 视觉回归的新基线（替换 M1 基线）

## 任务分支与提交计划

- 分支：`refactor/notion-ui-reskin`，从 master 切出
- 提交 1：`feat(ui): rebuild design tokens v2 with Notion neutral palette and teal primary`（tokens/global/unocss/package.json）
- 提交 2：`feat(ui): map full naive-ui light/dark themes to design tokens`（naive-theme.ts）
- 提交 3：`refactor(ui): reskin app shell, tool layout and tool card`（三个壳层组件）
- 提交 4：`chore(ui): purge hardcoded colors from tool components`（24 工具文件）
- 提交 5：`docs: rewrite DESIGN.md as v2 contract`（DESIGN.md + 基线截图 + 删除 notion-design.md）
- 全部完成后：全量检查 + 走查，合并回本地 master

## 已知风险与回退

- **风险：hover 阴影在密集卡片墙（首页 118 卡）上过吵**。缓解：shadow-card 已取 Notion 最轻档；走查时若仍吵，首页卡退化为仅边框加深，工具页内容卡保留抬升（在 DESIGN.md 中记录该差异）。
- **风险：暗色亮青绿与错误红邻近时的色盲可辨性**。缓解：状态永远颜色+图标/文字双通道（v1 契约保留此条）。
- **回退**：全部改动集中在 5 个提交，任一阶段验收失败可整提交 revert；令牌旧值仅存于 git 历史，无外部依赖。
