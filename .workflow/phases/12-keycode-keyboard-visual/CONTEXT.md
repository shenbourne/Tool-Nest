# Phase context

- Phase: 12 — keycode-keyboard-visual
- Goal: keycode-info 工具显示名改为「键盘信息 / Keyboard Info」，并在工具内容区最上方新增全键盘可视化，实时高亮当前按下的物理键（对照用户提供的全键盘截图实现）。
- Requirements: 用户直接需求（无 REQUIREMENTS 表条目）；截图见会话附件（全键盘布局参考：功能键区/主键区/编辑区/小键盘区）。
- Constraints: 设计令牌一律 `var(--color-*)`，禁止硬编码颜色（DESIGN.md）；路由 `/keycode-info`、目录名、keywords 保持不变（用户确认只改显示名称）；`.vue` 内逻辑不可单测，纯数据/纯函数放 `src/utils/*.ts`（apps/web vitest 约定）。
- Decisions already made: 无新 ADR；复用既有工具注册与 i18n 机制。
- Open questions: 无（实现范围已经用户二选一确认：全键盘可视化+当前键高亮，不含 APM/三态/重置；按 `event.code` 物理键匹配）。
- Boundary: 包含 locale 改名、布局数据模块、KeyboardVisual 组件、KeycodeInfo.vue 集成、单测与浏览器验收。不包含路由/目录重命名、APM、Pressed/Never 历史状态、重置按钮、移动端专属适配。
