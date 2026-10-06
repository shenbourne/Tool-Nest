# Phase context

- Phase: 18 — crontab-generator Cron 字段三行五列布局与标题中文化
- Goal: 打开 crontab-generator 不再白屏；Cron 五个字段横向排成 5 列，每列自上而下为「标题 / 文本输入框 / 范围」三行；标题随界面语言切换（中文模式下为中文）。
- Requirements: 用户口头需求（该仓库 requirements 文档未给这两条编号，记为本次会话的直接需求）
- Constraints:
  - 主工作树被多个会话共用，仍有其他会话的未提交改动（`AGENTS.md`、`apps/web/vite.config.ts`、`package.json`、`apps/web/src/components.d.ts`）；本相位不得触碰。
  - `apps/web` 的 `pnpm lint` 在既有基线上就失败，只能做逐文件差分 lint。
  - vue-i18n 把消息里的 `|` 当复数分隔符，字面竖线会让渲染函数抛错（本次白屏的根因）。
- Decisions already made: 无 ADR。局部 UI 调整，未引入新抽象；字段名改为 i18n 键（`labelKey`）而非硬编码英文。
- Open questions: none
- Boundary:
  - 包含：`CrontabGenerator.vue` 字段区模板、`crontab-generator.service.ts` 的 `CronFieldDef`、`en.json` / `zh.json` 的字段标题键。
  - 不包含：其他工具、其他页面的布局；不包含把本相位合并进 `master`（需用户单独授权）。
- 背景（非本分支产物）：白屏修复本身（把 `tools.crontabGenerator.syntaxDiagram` 里的 ASCII `|` 换成 `│`）已随另一会话的提交 `7b7eb00` 进入 `master`——那次提交把当时工作树里的 locale 中间状态一并提交了。因此本分支只承载字段标题 i18n 与三行五列布局。
