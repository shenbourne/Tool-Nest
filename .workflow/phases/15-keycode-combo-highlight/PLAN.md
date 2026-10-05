# Implementation plan

- Branch/worktree: `feature/phase-15-keycode-combo-highlight` @ `.worktrees/phase-15-keycode-combo-highlight`（基线 = phase 14 tip `926ec88`）
- Relevant files/interfaces:
  - 新增 `apps/web/src/tools/keycode-info/keyboard-highlight.ts` — 纯函数：`isModifierCode` / `toggleHeldModifier` / `computeHighlight`
  - 新增 `apps/web/src/tools/keycode-info/keyboard-highlight.test.ts` — vitest
  - 修改 `apps/web/src/tools/keycode-info/KeycodeInfo.vue` — 高亮由单个 code 改为 code 集合；新增 keyup 监听维护按住的修饰键；单一计时器清空集合
  - 修改 `apps/web/src/tools/keycode-info/KeyboardVisual.vue` — prop 由 `activeCode: string | null` 改为 `activeCodes: string[]`
- Risks: 修饰键释放（keyup）需移除按下状态，否则后续会误亮；组件卸载时需移除 keyup 监听。

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | keyboard-highlight.ts + 单测（先行） | vitest 6 tests PASS（修饰键识别/增删/高亮集合组合与去重） | SHA pending | Done |
| 2 | 组件接线（集合 prop + keyup） | 浏览器：Ctrl+A 同时高亮 ControlLeft 与 KeyA，700ms 后同时变暗；六条验收全 PASS | SHA pending | Done |

Update this plan when discoveries change the implementation. Record scope changes rather than silently replacing them.
