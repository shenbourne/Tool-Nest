# Implementation plan

- Branch/worktree: `feature/phase-12-keycode-keyboard-visual` @ `.worktrees/phase-12-keycode-keyboard-visual`（基线 master `b44a61a`）
- Relevant files/interfaces:
  - 新增 `apps/web/src/utils/keyboard-layout.ts` — 纯数据模块：6 行 104 键 ANSI 布局（code/主标签/副标签/宽度 u/网格行列），quarter-unit 网格（`UNITS_PER_KEY=4`，总行宽 `TOTAL_UNITS=23`），导出 `findKeyByCode()`
  - 新增 `apps/web/src/utils/keyboard-layout.test.ts` — vitest（8 个用例）
  - 新增 `apps/web/src/tools/keycode-info/KeyboardVisual.vue` — props `activeCode: string | null`，CSS grid（92 列 quarter-unit）
  - 修改 `apps/web/src/tools/keycode-info/KeycodeInfo.vue` — 顶部插入 `<KeyboardVisual :active-code="event?.code ?? null" />`
  - 修改 `apps/web/src/locales/zh.json` / `en.json` — `tools.keycodeInfo.name`
- Risks: 小键盘/编辑区与主键区的行列对齐（用统一 23u 行宽 + 显式 spacer 解决，测试钉住行宽）；窄屏下键帽文字过小（grid 1fr 自适应缩放，实测 900px 容器下 1u 键 36px）。

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | locale 改名（zh 键盘信息 / en Keyboard Info） | 浏览器 heading+面包屑=键盘信息，路由不变 | `a9eb6cd` | DONE |
| 2 | keyboard-layout.ts + 单测（先行） | vitest 8/8（行宽/边界/无重叠/code 唯一/104 键/查找/rowSpan/副标签） | `f093e79` | DONE |
| 3 | KeyboardVisual.vue | 浏览器 press_key 高亮 + 暗色截图 | `f093e79` | DONE |
| 4 | KeycodeInfo.vue 集成 | 浏览器联动字段（a/65/KeyA 等） | `f093e79` | DONE |

Update this plan when discoveries change the implementation. Record scope changes rather than silently replacing them.
