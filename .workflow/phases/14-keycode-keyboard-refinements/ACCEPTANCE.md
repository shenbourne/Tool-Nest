# Acceptance verification

验证方式：Chrome DevTools MCP 驱动 phase-14 worktree dev server（`http://localhost:3213`，独立端口，避免与其他会话的 dev server 冲突）。执行人：Agent，2026-10-02。

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| 基础键帽正方形 | 1u 字母/数字/功能键宽≈高（±1px），宽键仍 1 行高、高键 2 行高 | viewport 1400、键盘内容宽 900px：`KeyA` 35.61×35.60、`Digit5` 35.61×35.60、`Escape` 35.60×35.60（方形）；`Backspace` 74.22×35.60（宽键 1 行高）；`NumpadAdd` 35.61×74.20（高键 2 行高）；`Space` 238.30×35.60 | PASS |
| 高亮自动变暗 | 按键后高亮出现，500ms 内无新按键则自动消失 | 页内派发 `KeyA`：t+30ms active=[KeyA]、t+300ms active=[KeyA]、t+750ms active=[]；真实 `press_key a` 后再次读取 active=[]（窗口已过） | PASS |
| 高亮续期 | 500ms 内再次按键，计时重置 | KeyX 于 t0：t+30ms 亮、t+400ms 仍亮；t+430ms 按 KeyY 后为 [KeyY]、**t+700ms 仍为 [KeyY]**（KeyX 的 500ms 若无重置早已到期）、t+1050ms 为 [] | PASS |
| 三列布局 | 键盘下方三列（键名/字段表/历史），三列等高 | 三列 `.keycode__col` 高度均为 320.0；三列内容区均 250.2；三列 `scrollHeight <= clientHeight`（无溢出）；宽度 260 / 348 / 260 | PASS |
| 键名卡片 | 无修饰键显示键名；有修饰键显示组合 | 无按键 → `?` + 提示；按 a（无修饰）→ `A`；Ctrl+a → `Ctrl+A`；单独按 Shift → `Shift`（首轮截图曾出现 `Shift+Shift`，已修复并复验） | PASS |
| 历史记录 | 最新在上，每条「键名 + HH:MM:SS」，最多 30，列内滚动 | 连按后首条 `A 06:36:08`，次条 `Shift 06:34:40`（最新在上）；`timeFormatOk=true`；连发 35 个按键后 `rowCount=30`（上限生效）；`ul.scrollHeight 1013 > clientHeight 230`（列内滚动） | PASS |
| 移除修饰键卡片 | 不再出现「当前修饰键」NTag 卡片 | `document.body.innerText.includes('当前修饰键') === false`；`.n-tag` 仅剩工具标签（3 个） | PASS |
| 暗色模式 | 暗色下键盘图与三列对比可读 | 通过应用真实主题按钮切到 dark（system→light→dark）：`html.dark` 生效，`.kb-plate` 背景 `rgb(42,42,42)`、卡片 `rgb(32,32,32)`，三列仍等高 320，截图确认可读 | PASS |

补充：无按键时第一列显示 `?`、第二列显示 `—`、第三列显示「暂无按键记录」；页面无裸 i18n key。

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.
