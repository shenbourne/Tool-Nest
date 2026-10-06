# Acceptance verification

验证方式：Chrome DevTools MCP 驱动 worktree dev server（`http://localhost:3212`，端口 3000/3002/3021 被其他会话占用，故用独立端口）。执行人：Agent，2026-10-02。

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| 改名 | 侧边栏/工具页标题显示「键盘信息」，路由仍为 `/keycode-info` | 页面 heading 与面包屑均为「键盘信息」，`location.pathname` = `/keycode-info`；截图确认 | PASS |
| 全键盘图 | 内容区最上方渲染完整键盘（功能键区/主键区/编辑区/方向键/小键盘区） | `.kb-key` = 104 个（含 tall 的 NumpadAdd/NumpadEnter，rowSpan 2）；数字行上档符号 `.kb-key__sub` = 21 个；plate 宽 900px、1u 键宽 36px；两张截图布局与参考图一致 | PASS |
| 按键高亮 | 按 A：KeyA 高亮，大字卡片/字段同步；按左 Shift：仅 ShiftLeft 高亮 | press_key `a` → active=[KeyA]，字段=[a,65,KeyA,0,无]；press_key `q` → active=[KeyQ]；press_key `Shift` → active=[ShiftLeft]（物理键语义 ✓） | PASS |
| 修饰键 | 按 Shift：对应键高亮且修饰键标签出现 | press_key `Shift` → active=[ShiftLeft] 且 `.n-tag` 出现「Shift」 | PASS |
| 小键盘/方向键 | Numpad7、ArrowUp 高亮 | press_key `Numpad7` → active=[Numpad7]；press_key `ArrowUp` → active=[ArrowUp] | PASS |
| 无按键态 | 未按键时无高亮，提示文案可见 | 初始 evaluate：activeCount=0，提示「在键盘上按下任意键」可见 | PASS |
| 暗色模式 | 暗色主题下图纸对比可读、高亮清晰 | `<html>` 加 `dark` class（与 preferences store 同一代码路径）：plate/键帽切换为暗色 token，S 键高亮（teal）清晰可读，截图确认。注：直接加 class 不触发 naive-ui 组件主题覆写，外壳卡片保持亮色，属验证手法 artifact，非本组件缺陷 | PASS |

附注：基线版本（未改动的 KeycodeInfo.vue）在按键时同样输出 Vue warning「Duplicate keys found during update: 1」（源自原有 `:key="i"` 字段列表与 NSpace 交互），为既有问题，不在本 phase 范围，已记录 STATE.md follow-ups。

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.
