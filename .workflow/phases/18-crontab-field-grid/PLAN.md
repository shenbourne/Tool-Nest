# Implementation plan

- Branch/worktree: `feature/phase-18-crontab-field-grid` @ `.worktrees/phase-18-crontab-field-grid`（从 `master` `7b7eb00` 切出；主工作树仍停在 `master`，其未提交改动未被触碰）
- Relevant files/interfaces:
  - `apps/web/src/tools/crontab-generator/crontab-generator.service.ts` — `CronFieldDef` 由 `{ name }` 改为 `{ labelKey }`，`CRON_FIELDS` 给出 5 个 i18n 叶子名。
  - `apps/web/src/tools/crontab-generator/CrontabGenerator.vue` — 字段区由纵向 `NSpace` 的横向行改为一个 `display: grid` 容器，5 列 × 3 行（标题 / 输入框 / 范围），按行分三次渲染，保证同一行的元素共享行高、纵向对齐。
  - `apps/web/src/locales/{en,zh}.json` — 新增 `tools.crontabGenerator.fieldMinute|fieldHour|fieldDayOfMonth|fieldMonth|fieldDayOfWeek`。
- Risks:
  - 中英文字段名长度不同（最长 "Day of month"），若某列标题换行，列内垂直对齐会错位 → 采用按行渲染的 grid（而非每列一个纵向 flex），使同一行的 5 个单元格共享行高。
  - 窄视口下 5 列输入框会被压窄 → 用 `minmax(0, 1fr)` 允许收缩，不再额外加断点（超出本相位范围）。
  - 输入框 id：修复了此前 5 个输入框共用 `crontabGeneratorField0` 的重复 id，改为按索引 `crontabGeneratorField${i}`（仓库既有 a11y 约定）。已 grep 确认无测试依赖旧 id。

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | `CRON_FIELDS` 改用 `labelKey`；组件按 `labelKey` 取文案 | `npx vue-tsc --noEmit` 通过；浏览器中文/英文标签断言 | 见 VERIFICATION | Done |
| 2 | 字段区改为 5 列 × 3 行 grid（标题/输入框/范围） | 浏览器读计算样式与各元素 rect：5 条列轨道、三个唯一行 top | 见 VERIFICATION | Done |
| 3 | 新增 5 个字段标题 i18n 键（中/英） | 中/英文模式标签分别为 分钟…/Minute… | 见 VERIFICATION | Done |
| 4 | 相位文档与状态记录 | 本目录 4 份文档 + `STATE.md` 更新 | 见 VERIFICATION | Done |
