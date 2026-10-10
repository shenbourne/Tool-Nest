# M1 设计地基 — 设计契约与令牌体系

> 状态：已确认（2026-09-17 brainstorming）
> 上级规划：前端完全重构 7 模块计划（M1 设计地基 → M2 布局壳层 → M3 共享组件库 → M4 工具页模式统一 → M5 可访问性 → M6 代码债清理 → M7 视觉回归基线）

## 背景与目标

tool-nest 前端（apps/web，Vue 3 + Naive UI + UnoCSS）没有设计契约文件，设计令牌仅有 UnoCSS theme 中的 5 个颜色 + 2 个 shortcut。Naive 主题覆盖是 `App.vue` 里硬编码的 4 个 hex 值，全局样式直接内联在 `App.vue` 的 `<style>` 块中（硬编码滚动条颜色、字体栈），118 个工具组件的样式各写各的。

M1 的目标：**建立单一事实源的设计令牌体系和机器可审的设计契约文件**，为后续所有模块（M2–M6）提供审查基准。M1 只建地基并做最小示范应用，不做大规模迁移。

### 非目标（后续模块负责）

- 页面/工具组件的样式迁移到令牌（M3、M4）
- 布局结构与响应式改造（M2）
- 可访问性全面整改（M5）
- lint/type 代码债清理（M6）

## 视觉方向

保留现有绿色主色 `#18a058`（Naive UI 绿），在其上精致化：优化中性灰阶、表面层级、阴影、圆角、字号体系。用户应感到"更精致"，而不是"换了产品"。

## 令牌架构：CSS 变量单源（方案 A）

```
tokens.css (:root 亮色 / html.dark 暗色)
        │
        ├─→ UnoCSS theme 引用 var(--…)
        ├─→ Naive themeOverrides 引用 var(--…)
        └─→ 原生 CSS / 组件内联样式引用 var(--…)
```

唯一事实源是 `tokens.css` 中的 CSS custom properties。三处消费方只引用、不定义颜色值。暗色切换通过 `html.dark` 上的第二组映射完成，零运行时成本。

### 架构约束

- 所有颜色必须走语义变量，禁止新增硬编码 hex（后续模块的 design-debt review 负责逐步清零存量）
- Naive 组件外观以 `themeOverrides` 为调整入口，不覆盖 Naive 内部 class
- 令牌命名前缀 `--color-`、`--spacing-`、`--radius-`、`--font-`、`--shadow-`、`--motion-`

## 令牌草案

### 语义色

| Token | 亮色值 | 用途 |
|---|---|---|
| `--color-primary` | `#18a058` | 主操作、链接、激活态 |
| `--color-primary-hover` | `#36ad6a` | primary 悬停 |
| `--color-primary-pressed` | `#0c7a43` | primary 按下 |
| `--color-success` | `#18a058` | 成功态 |
| `--color-warning` | `#f0a020` | 警告态 |
| `--color-error` | `#d03050` | 错误态 |
| `--color-info` | `#2080f0` | 信息态 |

### 中性色（暗色值对齐 Naive UI 暗色默认，保证自定义 CSS 与 Naive 组件表面一致）

| Token | 亮色 | 暗色 |
|---|---|---|
| `--color-canvas` | `#fafafc` | `#101014` |
| `--color-surface` | `#ffffff` | 对齐 Naive dark card |
| `--color-surface-2` | `#f2f2f5` | 对齐 Naive dark table |
| `--color-hairline` | `#e5e5e8` | 对齐 Naive dark divider |
| `--color-ink` | `#1f2226` | 对齐 Naive dark text |
| `--color-text-2` | 次级文字 | 对齐 Naive dark text-2 |
| `--color-text-3` | 占位/禁用 | 对齐 Naive dark text-3 |

具体暗色取值在实现时以 Naive UI darkTheme 的 common tokens 为准逐一对齐，并在 DESIGN.md 中记录对照。

### 字体（保留系统栈，补中文回退）

- 栈：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`；代码面 `'SF Mono', 'Cascadia Code', Consolas, monospace`
- 7 级令牌：`display 28/36`、`heading-lg 22/30`、`heading-md 18/26`、`body-md 14/22`、`body-sm 13/19`、`caption 12/18`、`code-md 13/20`

### 间距（4px 基准，8 档）

`xxs 4 / xs 8 / sm 12 / md 16 / lg 24 / xl 32 / xxl 48 / section 64`

### 圆角（6 档）

`none 0 / sm 4 / md 6（现值）/ lg 8 / xl 12 / full 9999`

### 阴影与暗色策略

- 亮：`--shadow-card 0 1px 2px rgba(0,0,0,.04)`、`--shadow-popover 0 6px 16px rgba(0,0,0,.12)`、`--shadow-modal 0 12px 32px rgba(0,0,0,.16)`
- 暗：不用阴影表达层级，用 `--color-hairline` 边框（Naive 惯例）

### 动效

- 时长：`--motion-fast .15s / --motion-base .2s / --motion-slow .3s`
- 尊重 `prefers-reduced-motion`：全局过渡降级（global.css 中 media query 覆盖）

## DESIGN.md（设计契约）

- 位置：仓库根目录 `DESIGN.md`
- 格式：遵循 design-md-review 技能的公开 schema——YAML frontmatter 含 `version: alpha`、`name`、`description`、`colors`（8–16 语义令牌）、`typography`（6–12 级）、`rounded`（4–8 档）、`spacing`（6–10 档）、`components`（8–20 个组件令牌映射，含状态变体）；正文按 Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts → Responsive Behavior → Known Gaps 章节
- 组件令牌映射覆盖 M1 示范涉及的面：sidebar、卡片、按钮、输入框（后续模块扩充）
- 无法从现有代码推断的规则标记 `needs-design-decision`，不虚构品牌策略

## 交付文件

| 动作 | 文件 | 说明 |
|---|---|---|
| 新增 | `DESIGN.md` | 设计契约 |
| 新增 | `apps/web/src/styles/tokens.css` | 令牌唯一事实源 |
| 新增 | `apps/web/src/styles/global.css` | 全局样式（字体栈、滚动条、过渡、reduced-motion），从 App.vue 抽出 |
| 修改 | `apps/web/unocss.config.ts` | theme 引用 CSS 变量；扩展 shortcuts |
| 修改 | `apps/web/src/App.vue` | themeOverrides 引用变量；style 块迁移到 global.css |
| 修改 | `apps/web/src/layouts/AppLayout.vue` | 首批令牌消费示范（间距、表面色、激活态） |
| 修改 | `apps/web/src/layouts/ToolLayout.vue` | 同上 |

i18n、路由、store、页面组件本次不动。

## 验证标准

每个提交必须通过：

1. `pnpm --filter @toolnest/web type-check` 通过
2. `pnpm --filter @toolnest/web test` 通过（当前 4 个用例）
3. `pnpm --filter @toolnest/web lint` 不新增错误（存量 68 个错误本模块不清）
4. 浏览器截图对比：首页 + 一个工具页，亮/暗各一，与 M1 前基线相比无意外视觉回退（基线截图存 `.scratch/`）
5. DESIGN.md 通过 `@google/design.md lint`（若 CLI 可用；不可用时用 design-md-review 本地 audit 脚本并报告）

## 任务分支与提交计划

- 分支：`refactor/m1-design-foundation`，从 master 切出
- 提交 1：`docs: add DESIGN.md design contract`（仅 DESIGN.md）
- 提交 2：`feat(ui): add CSS design tokens and global styles`（tokens.css、global.css、unocss.config.ts、App.vue 接线）
- 提交 3：`refactor(ui): apply design tokens to app shell layouts`（AppLayout.vue、ToolLayout.vue）
- 全部完成后：全量检查 + diff 审查，合并回本地 master；若检查失败无法安全解决，保留分支并说明

## 已知缺口（M1 声明）

- 存量 68 个 ESLint 错误留待 M6
- 118 个工具组件的样式迁移留待 M4（M1 只做布局壳层示范）
- 移动端响应式留待 M2
