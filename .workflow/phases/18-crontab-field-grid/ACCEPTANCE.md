# Acceptance verification

验证环境：`apps/web` dev server（`npx vite --port 3010 --strictPort`，主工作树内容），Chrome DevTools MCP `evaluate_script` 读取真实 DOM 计算样式与元素 rect。执行人：Agent，2026-10-07。

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| R-001 | 打开 `/crontab-generator` 不再白屏，页面各区块完整渲染 | `document.body.innerText.length = 649`；Cron 字段 / Cron 表达式 / 下次执行时间 / 语法参考 四张卡片均渲染；`list_console_messages` 无任何消息 | PASS |
| R-002 | 五个字段横向排列为 5 列 | 容器计算样式 `display: grid`，`grid-template-columns` 解析为 `160.531px ×4 + 160.542px`（5 条轨道），`column-gap: 12px` | PASS |
| R-003 | 每列自上而下三行：标题 / 输入框 / 范围，且纵向对齐 | 15 个子元素；`getBoundingClientRect().top` 去重后仅 3 个值：272（标题行）/ 300（输入框行）/ 348（范围行）——同一行 5 个元素 top 完全相同 | PASS |
| R-004 | 中文模式下标题为中文 | 标题行文本：`分钟 | 小时 | 日 | 月 | 星期` | PASS |
| R-005 | 英文模式下标题为英文 | 切换语言后标题行文本：`Minute | Hour | Day of month | Month | Day of week`；切回中文后恢复为中文 | PASS |
| R-006 | 输入框 id 唯一且符合仓库 a11y 约定 | 5 个 input 的 id 依次为 `crontabGeneratorField0..4`（修复了此前 5 个框共用 `crontabGeneratorField0` 的重复 id） | PASS |
| R-007 | 范围文案与字段定义一致 | 范围行文本：`0 - 59 | 0 - 23 | 1 - 31 | 1 - 12 | 0 - 6`，与 `CRON_FIELDS[i].min/max` 一致 | PASS |
| R-008 | 生成表达式 / 描述 / 下次执行等既有功能未回归 | 默认 `40 * * * *`：表达式卡片渲染、下次执行表格有数据、控制台无报错；`crontab-generator.service.test.ts` 2 例通过（含 day-of-month vs day-of-week 的 OR 语义） | PASS |
| R-009 | 未把其他会话的工作树改动带入本相位 | 本分支提交只含 4 个 crontab/locale 文件 + 本相位文档 + `STATE.md`；`AGENTS.md`、`vite.config.ts`、`package.json`、`components.d.ts` 不在提交内 | PASS |
