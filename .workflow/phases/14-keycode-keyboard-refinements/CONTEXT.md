# Phase context

- Phase: 14 — keycode-keyboard-refinements
- Goal: 在 phase 12 的全键盘可视化基础上完成三项体验修正：① 1u 基础键帽正方形、大键随之等高；② 按键高亮 500ms 后自动变暗（期间无新按键）；③ 键盘图下方改为三列等高等宽布局（键名卡片 / 字段表 / 历史按键记录）。
- Requirements: 用户直接需求（2026-10-02，附参考截图）；phase 12 为其前置。
- Constraints: 设计令牌一律 `var(--color-*)`（DESIGN.md）；`.vue` 内逻辑不可单测，纯函数放 `.ts`；不改路由/目录；stacked 在 phase 12 之上（phase 12 未合并且本次改动同文件）。
- Decisions already made: 高亮时长 500ms；历史记录每条显示「键名 + 时间戳」，最新在上，保留 30 条；移除原「当前修饰键」NTag 卡片（信息并入第一列组合展示）；组合键修饰键顺序 Meta→Ctrl→Alt→Shift（用户确认）。
- Open questions: 无。
- Boundary: 包含键帽方形化、高亮计时、三列重构、历史记录、locale 调整、单测与浏览器验收。不包含 APM/三态/重置（phase 12 已排除）、历史记录持久化、点击历史项回填。
