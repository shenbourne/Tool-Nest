# Phase context

- Phase: 16 — Memo tool localization (git-memo + regex-memo)
- Goal: 中文模式下 `/git-memo` 与 `/regex-memo` 的每个分节标题显示「英文标题 · 中文翻译」，每条 Git 命令说明、每条正则条目含义以及正则表格的表头显示中文；切到英文模式时两者保持纯英文，不出现中英混杂或英文残留
- Requirements: R-002（双语界面）
- Constraints: 命令本身（`git config --global user.name "[name]"`、`git add .`）与正则语法（`\d or [0-9]`、`foo(?=bar)`）保持原样；不增删速查内容；不重构组件结构；不动 `template/`（上游只读参考）；不改 `apps/server`
- Decisions already made: 用户 2026-10-07 选定连接符为「英文 · 中文」（与 `commandPalette.hint` 的 `↑↓ 导航 · Enter 选择` 一致）；范围由用户确认包含 regex-memo（两个速查表同构，避免一个中文一个英文）
- Open questions: none
- Boundary:
  - 只改 `apps/web/src/tools/git-memo/GitMemo.vue`、`apps/web/src/tools/regex-memo/RegexMemo.vue` 与 `apps/web/src/locales/{en,zh}.json`
  - `RegexMemo.vue` 的 `example` 字段从未被表格渲染，本轮只留原位不翻译（理由见 PLAN 风险）
  - `git-memo` 已记录的 D5 缺陷（整行点击复制、无任何反馈，`.scratch/tool-interaction-audit/findings.md:496`）不在本轮范围
  - 键命名沿用 i18n 规范：`tools.<toolKey>.sections.*` / `tools.<toolKey>.commands.*` / `tools.<toolKey>.<entry>`，`<toolKey>` 与 `index.ts` 一致（`gitMemo` / `regexMemo`）
