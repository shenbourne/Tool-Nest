# prompt-analysis 技能渐进披露重构记录

Status: resolved（获得用户级授权后完成拆分；asset-baseline 复检两项标签清除）
Type: finding-repair
Finding: `prompt-analysis-skill-over-long`（prompt-analysis 技能无法按需加载，触发即读入全部内容）
来源报告: `.qoder/better-harness/2026-09-17/084530-tool-nest/`（findings.json、canvas.json 保持原样未改写）

## 修复内容

用户级资产 `C:\Users\ROG\.qoder\skills\prompt-analysis\`（本轮已获得用户级资产修改授权）：

- `SKILL.md`：586 → 106 行。保留 frontmatter 触发信息与主干（Git AI 简介、初始化与取数范围、分析路径选择、subagent 迭代模式与提示词模板、重要注意事项），新增 Reference Index 指向 4 个引用文件。
- 新增 `references/schema-and-queries.md`（55 行）：prompts 表结构 + 聚合查询示例。
- 新增 `references/examples-prompt-quality.md`（214 行）：原示例 1/3/4/7（工作类型分类、可复用模式、清晰度评分、最佳实践评级）。
- 新增 `references/examples-acceptance-outcomes.md`（145 行）：原示例 2/5/6（低接受率归因、提示技巧关联、失败提示词定性分析）。
- 新增 `references/caveats-and-setup.md`（73 行）：清理、排障、数据陷阱与「失败提示词」定义、权限设置。
- 原文完整备份：`.scratch/prompt-analysis-fix/staging/original-SKILL.md`（586 行；全部细节内容已搬迁至引用文件，未丢弃）。

## 验证证据

- 修复前基线（`baseline-before.json`）：lint findings=2 —— `skill-length-hard-cap`（warning，586 行）+ `skill-long-without-progressive-references`（advisory，无本地引用）。
- 修复后基线（`baseline-after.json`）：lint findings=0、errors=0、warnings=0、advisories=0、missingReferences=0（4 个引用链接均解析成功，无 `skill-missing-local-reference`）。
- 行数：SKILL.md 106 < 上限 500；引用文件均可单独读取（schema-and-queries 56 行 / caveats-and-setup 73 行 / examples-acceptance-outcomes 145 行 / examples-prompt-quality 214 行）。
- 复跑命令：`node .scratch/prompt-analysis-fix/capture-baseline.mjs before|after`；应用脚本 `node .scratch/prompt-analysis-fix/apply-fix.mjs`。

## 边界

- 本轮修复由用户手动传入修复提示词，未携带机器回调（better-harness-fix-output 契约），不满足 record-fix-output 前置条件，故报告工件保持原样，未回写 finding 状态。
