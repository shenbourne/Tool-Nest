# Engineering verification

- Commit/branch: `3b7df53` / `feature/phase-17-jetbrains-diff-viewer`（worktree `.worktrees/phase-17-jetbrains-diff-viewer`，基于 master `7b7eb00`）
- Date: 2026-10-07
- Review: 自查发现 JsonDiff 用 `:nth-child(3)` 定位左值列，改为显式 `.json-diff-value-left` 类（`cdcf46e`）。残留：无。json-diff 引擎从扁平 DiffEntry 重写为递归树状对比（`json-tree-diff.ts`），JsonDiff.vue 基线 lint 错误从 9 降至 3（差分 -6，0 added）
- Codebase health: not triggered（两个工具页内呈现改造，无跨模块结构变化）

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Tests | `pnpm test` | PASS | 284 web（含 13 line-diff + 11 json-tree-diff + 4 tool-text-panels）+ 52 server，全绿 |
| Lint | `node .scratch/phase-17-evidence/differential-lint.mjs 7b7eb00` | PASS（差分） | 12 个变更文件 0 added / 6 removed（JsonDiff.vue 重写消除 6 个基线错误）；全量 `pnpm lint` 在基线即失败（231 错误/88 文件），按仓库惯例差分 |
| Typecheck | `pnpm type-check` | PASS | vue-tsc + tsc 无错误 |
| Build | `pnpm build` | PASS | web 27.09 s（vite build 能暴露 SFC 结构错误） |
| Integration | Chrome DevTools MCP 驱动 `http://localhost:3017` | PASS | 见 ACCEPTANCE.md 的 DOM/计算样式证据 |

Record failures, skipped checks, environment limitations, and reruns. Acceptance evidence belongs in `ACCEPTANCE.md`.

## 实现备注

- `apps/web/src/utils/line-diff.ts`：Myers SES（O(ND)）行级对齐，changed 行经公共前后缀裁剪产出字符级分段；`\r\n` 归一化；末尾单个换行不产生幻影空行；空串视为零行。TDD：先写 `line-diff.test.ts` 观察 RED（模块不存在），实现后 GREEN 13/13
- `DiffViewer.vue`：单滚动容器 + 全量行一个 grid（`display: contents` 行）保证双栏列宽跨行一致；gutter 条纹、双侧行号、sticky 标题、行内加深段。软换行版（`eea3bd0`）列改 `minmax(0,1fr)`，单元格 `pre-wrap + overflow-wrap:anywhere`，去掉 max-content 与横向滚动
- `ToolTextPairPanel.vue`（`da8dddc`）：双输入比较器的共享面板，每栏标题+折叠箭头+textarea 插槽+导入/粘贴图标按钮（hover tooltip）；共享折叠态点任一同步折叠/展开两栏；每栏隐藏 file input；粘贴先读剪贴板文件后回退文本；页面级 Ctrl+V 有文件时路由到最近聚焦栏（默认左栏）。text-diff/json-diff 接入（`69a22c6`），保留 NInput id 与 v-model；json-diff 传 `accept=".json,application/json"`
- 暗色验证注意：全局 `* { transition: background-color … }` 使计算样式在切类后 ~240 ms 内仍是过渡值，断言前须等待 ≥500 ms（本阶段踩过，读自定义属性不受影响）
