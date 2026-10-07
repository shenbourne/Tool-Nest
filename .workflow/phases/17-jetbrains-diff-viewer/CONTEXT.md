# Phase context

- Phase: 17 — JetBrains 风格差异查看器
- Goal: 文本对比（text-diff）与 JSON 差异对比（json-diff）的结果呈现改为 JetBrains 文件差异查看器的展现样式：双栏并排、双侧行号、行内字符级高亮、gutter 差异条；文本对比的算法从按行号朴素对齐换成真正的行级 diff（Myers）。
- Requirements: 用户直接需求（2026-10-07 会话），无 R 编号
- Constraints:
  - DESIGN.md v2：组件样式一律引用 `var(--color-*)` 令牌（规则 7 豁免功能性 diff 底色，但亮暗双主题必须都可用，故进 tokens.css 做令牌）
  - 工具栏用图标不用文字（用户长期偏好）
  - 纯逻辑必须落在 `.ts` 纯模块以便 vitest 覆盖（apps/web 的 vitest 是 node 环境，.vue 内逻辑不可测）
  - 不引入第三方 diff 依赖（仓库惯例：自研纯工具模块）
- Decisions already made: 2026-10-07 对话确认——两个工具都改；算法换 Myers 行级 diff 纳入本任务；特征取核心集（双栏并排+双侧行号+同步滚动+行内字符级高亮+gutter 差异条），不做上一个/下一个差异跳转、不做双栏/统一视图切换
- Open questions: none
- Boundary: 只改 `apps/web/src/tools/text-diff`、`apps/web/src/tools/json-diff` 的结果呈现与文本对比的 diff 算法；新增共享组件 `apps/web/src/components/DiffViewer.vue` 与纯模块 `apps/web/src/utils/line-diff.ts`；输入区、统计标签、语义 diff 引擎（json-diff 的路径递归）不动
