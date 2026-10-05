# Phase context

- Phase: 15 — keycode-combo-highlight
- Goal: 当最后按下的是组合键时，按住的修饰键与主键一起高亮，并在 500ms 内无新按键时一起变暗（phase 14 只高亮最后按下的单个物理键）。
- Requirements: 用户直接需求（2026-10-02）；前置为 phase 12（键盘可视化）与 phase 14（500ms 自动变暗）。
- Constraints: 设计令牌 `var(--color-*)`；纯逻辑放 `.ts` 便于单测；stacked 在 phase 14 tip `926ec88` 之上（phase 12/14 均未合并且改动同文件）。
- Decisions already made: 单一计时器覆盖整个高亮集合（修饰键与主键同时变暗）；已按住的修饰键集合由修饰键的 keydown/keyup 维护，因此能区分左右（如仅高亮 ControlLeft）。
- Open questions: 无。
- Boundary: 包含高亮集合逻辑、修饰键按下状态跟踪、组件 prop 改造、单测与浏览器验收。不包含历史记录/字段表改动、按键释放即时取消高亮（释放后仍等计时器统一变暗）。
