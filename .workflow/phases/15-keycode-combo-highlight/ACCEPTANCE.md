# Acceptance verification

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| 组合键一起高亮 | 按住 Ctrl 再按 A：ControlLeft 与 KeyA 同时高亮 | 页内 dispatch ControlLeft keydown → KeyA keydown(ctrlKey)，采样 `.kb-key--active` 的 `title` = `["ControlLeft","KeyA"]` | PASS |
| 一起变暗 | 最后一次按键后 500ms 无新按键，修饰键与主键同时熄灭 | 上述组合 +700ms 采样 = `[]` | PASS |
| 左右区分 | 只按左侧 Shift 时仅 ShiftLeft 高亮，不误亮 ShiftRight | dispatch ShiftLeft keydown，采样 = `["ShiftLeft"]`（无 ShiftRight） | PASS |
| 释放修饰键后不误亮 | 松开 Ctrl 后按 A，只高亮 KeyA | ControlLeft keydown→keyup，再 KeyA keydown，采样 = `["KeyA"]`（无 ControlLeft） | PASS |
| 多修饰键 | Ctrl+Shift+A 三个键同时高亮并一起变暗 | 依次 dispatch ControlLeft、ShiftLeft、KeyA(带 ctrl+shift)，采样 = `["ControlLeft","KeyA","ShiftLeft"]`；+700ms = `[]` | PASS |
| 单键仍正常 | 单独按 A 仅高亮 KeyA；无按键时无高亮 | 基线采样 = `[]`；KeyA keydown 采样 = `["KeyA"]`；+600ms = `[]` | PASS |
| 组合键只记一条历史 | 按 Ctrl+Shift+A，历史记录只新增一条 `Ctrl+Shift+A`，不出现 `Ctrl`/`Ctrl+Shift` 等多条；单独按修饰键不记历史 | 依次 dispatch ControlLeft、ShiftLeft、KeyA，历史采样 = `["Ctrl+Shift+A"]`（仅一条）；随后单键 B → `["B","Ctrl+Shift+A"]`；再单独按 ControlLeft，历史不变 | PASS |
| 松掉的修饰键不误亮 | 按 Shift 再按 Ctrl，只亮 ControlLeft 不误亮 ShiftLeft；即使 Shift 的 keyup 丢失也一样 | dispatch ShiftLeft keydown→keyup 后再 ControlLeft keydown = `["ControlLeft"]`；再测 ShiftLeft keydown（不派 keyup）后直接 ControlLeft keydown = `["ControlLeft"]`；组合 Ctrl+Shift+A 仍三键同亮 | PASS |

验收方式：Chrome DevTools MCP `evaluate_script` 在 `/keycode-info` 路由页内派发 `KeyboardEvent` 并按时序采样高亮集合（`.kb-key--active` 的 `title` 属性 = 物理 code）。dev server `:3215`。2026-10-02 由接手会话执行。

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.
