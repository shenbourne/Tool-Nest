# 17 — crontab 语法图示本地化

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 背景

`CrontabGenerator.vue` 的 `<pre>` 中存在硬编码的多行 cron 字段示意图
（minute / hour / day of month / month / day of week）。标签位于每行行尾，
翻译不会破坏左侧 `|` 列对齐。

## 产出

- 新增键 `tools.crontabGenerator.syntaxDiagram`（en/zh，含换行）
- `<pre>` 改为 `{{ t('tools.crontabGenerator.syntaxDiagram') }}`

## Comments
- 已完成。
