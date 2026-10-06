# Implementation plan

- Branch/worktree: `feature/phase-14-keycode-keyboard-refinements` @ `.worktrees/phase-14-keycode-keyboard-refinements`（基线 = phase 12 tip `2428bf1`）
- Relevant files/interfaces:
  - 新增 `apps/web/src/tools/keycode-info/keyboard-history.ts` — 纯函数：`formatKeyToken` / `formatModifierList` / `formatComboLabel` / `formatClock` / `pushHistory` + `HISTORY_LIMIT`
  - 新增 `apps/web/src/tools/keycode-info/keyboard-history.test.ts` — vitest
  - 修改 `apps/web/src/tools/keycode-info/KeyboardVisual.vue` — `.kb-plate` 设 `container-type: inline-size`，行高 `calc(100cqw / 92 * 4 - 3px)`（带 px 回退）
  - 修改 `apps/web/src/tools/keycode-info/KeycodeInfo.vue` — 高亮计时器 + 三列 grid + 历史列表；移除 NSpace/NTag 与修饰键卡片
  - 修改 `apps/web/src/locales/zh.json` / `en.json` — 新增 `currentKey`/`fields`/`history`/`noHistory`，删除孤立的 `modifierKeys`/`noModifiers`
- Risks: `cqw` 需现代浏览器（保留 px 回退）；三列若在窄屏挤压（加 <900px 单列降级）；历史列需内部滚动以免撑高行（行高固定 + flex min-height:0）。

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | keyboard-history.ts + 单测（先行） | vitest 8/8：组合顺序/Space token/修饰键别名去重/时间格式/上限 30/最新在上 | SHA pending | DONE |
| 2 | KeyboardVisual 行高=键宽 | 浏览器实测 1u 键 35.61×35.60、宽键 1 行高、高键 2 行高 | SHA pending | DONE |
| 3 | KeycodeInfo 三列 + 500ms 消隐 + locale | 浏览器：三列均 320 高、无溢出、历史内滚动(1013>230)、+300ms 亮/+750ms 暗、二次按键重置、取消修饰键卡片 | SHA pending | DONE |

验证期间发现并修复 3 处缺陷（行高多减 3px、naive-ui 内容类名 `.n-card-content`、单独按修饰键 `Shift+Shift`），修复后完整重跑门禁。

Update this plan when discoveries change the implementation. Record scope changes rather than silently replacing them.
