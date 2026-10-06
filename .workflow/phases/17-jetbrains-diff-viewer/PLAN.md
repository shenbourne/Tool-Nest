# Implementation plan

- Branch/worktree: `feature/phase-17-jetbrains-diff-viewer` / `.worktrees/phase-17-jetbrains-diff-viewer`（基于 master `7b7eb00`；远端 origin/master 落后本地 20 个已合并提交，推 master 由用户决定）
- Relevant files/interfaces:
  - 新增 `apps/web/src/utils/line-diff.ts`：`diffLines(oldText, newText): DiffRow[]`，行级 Myers 对齐 + changed 行字符级分段；附 `line-diff.test.ts`
  - 新增 `apps/web/src/components/DiffViewer.vue`：props `rows: DiffRow[]`；双栏+gutter 条纹+行号
  - 修改 `apps/web/src/styles/tokens.css`：diff 亮暗令牌
  - 修改 `apps/web/src/tools/text-diff/TextDiff.vue`：结果区换 DiffViewer
  - 修改 `apps/web/src/tools/json-diff/JsonDiff.vue`：结果列表改 JetBrains 视觉语言双栏行（复用 diff 令牌）
- Risks: 大文本下渲染行数多（接受，开发者工具场景文本量有限）；json-diff 对象值多行缩进在双栏单元格内的排版

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | `line-diff.ts` + `line-diff.test.ts`（TDD 先测） | vitest：中间插入行后下方仍对齐为 same；删除/新增/修改；字符级分段公共前后缀 | SHA pending | Planned |
| 2 | `tokens.css` diff 令牌（亮+暗） | 浏览器验收时核对暗色 | SHA pending | Planned |
| 3 | `DiffViewer.vue` 组件 | 浏览器验收：双栏对齐/行号/滚动同步/gutter 条纹/行内高亮 | SHA pending | Planned |
| 4 | `TextDiff.vue` 接入 DiffViewer | 浏览器验收 + 既有 locale key 复用 | SHA pending | Planned |
| 5 | `JsonDiff.vue` 结果区改造 | 浏览器验收：路径 gutter + 红/绿双栏 | SHA pending | Planned |
| 6 | 门禁：test/type-check/build + 差分 lint | pnpm 三门禁 PASS；变更文件 0 新增 lint | SHA pending | Planned |
| 7 | 浏览器验收 + VERIFICATION/ACCEPTANCE/STATE/ROADMAP | Chrome DevTools 证据 | SHA pending | Planned |

Update this plan when discoveries change the implementation. Record scope changes rather than silently replacing them.
