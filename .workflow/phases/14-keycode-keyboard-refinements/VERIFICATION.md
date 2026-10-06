# Engineering verification

- Commit/branch: SHA pending — `feature/phase-14-keycode-keyboard-refinements`（worktree `.worktrees/phase-14-keycode-keyboard-refinements`，基线 = phase 12 tip `2428bf1`）
- Date: 2026-10-02
- Review: 两处实现缺陷在浏览器验证中被发现并修复：① 行高表达式多减了 3px（键帽自身上下 1.5px margin）导致键帽偏高而非正方形，改为以未扣减的 4 列道宽作行高；② `:deep(.n-card__content)` 类名错误（naive-ui 实为 `.n-card-content`），历史列未被约束而溢出至 1033px，修正选择器并加 `overflow: hidden`；③ 单独按修饰键显示为 `Shift+Shift` / `Ctrl+Control`，按修饰键别名归一后为单个名称。三者均补了单测或复验
- Codebase health: not triggered（单工具内部重构，无跨模块/依赖变更）

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Tests | `pnpm test`（worktree） | PASS | 235 web（34 文件，含新 `keyboard-history.test.ts` 8 个）+ 52 server（8 文件） |
| Lint | `node .scratch/differential-lint.mjs`（基线 `2428bf1`） | PASS（delta 0） | 4 个改动/新增 ts|vue 文件均 0 新增错误；locale json 无 eslint 覆盖；repo 基线 231 错未变 |
| Typecheck | `pnpm type-check` | PASS | apps/web `vue-tsc --noEmit` + apps/server `tsc --noEmit` |
| Build | `pnpm build` | PASS | web `vite build` 40.66 s |
| Integration | Chrome DevTools MCP（真实按键 + 页内计时断言 + 真实主题切换） | PASS | 见 `ACCEPTANCE.md` 8 条；含键帽尺寸 3 组、计时 5 个采样点、三列等高/无溢出、历史上限与滚动、暗色真实切换 |

门禁在最后一次源码改动（修饰键别名修复）之后完整重跑，结果如上。

Record failures, skipped checks, environment limitations, and reruns. Acceptance evidence belongs in `ACCEPTANCE.md`.
