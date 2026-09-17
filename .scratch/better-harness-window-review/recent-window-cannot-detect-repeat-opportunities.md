# Better-harness 会话空窗排查与采集来源根修复记录

Status: resolved（排查、结论记录与采集修复已完成；下一窗口复核为后续验证动作）
Type: finding-repair
Finding: `recent-window-cannot-detect-repeat-opportunities`（近期记录不足，重复工作与维护机会无从识别）
来源报告: `.qoder/better-harness/2026-09-17/084530-tool-nest/`（findings.json、canvas.json，保持原样未改写）

## 排查范围与窗口

- 工作区：`d:\Users\Projects\SelfProgram\tool-nest`
- 冻结窗口（normal，30 天）：约 `2026-08-18T00:45Z` 至 `2026-09-17T00:45Z`（以上一轮复核运行时刻为准）
- 采集口径与 evidence-bundle 会话通道同源：better-harness `session-analysis`（platform=qoder，facts 命令）

## 来源根与配置状态（实测）

采集 home 默认解析为 `~/.qoder`（`C:\Users\ROG\.qoder`）。7 个来源根实测状态：

| 来源根 | home 相对路径 | 默认 home（~/.qoder） | CN home（~/.qoder-cn） |
| --- | --- | --- | --- |
| qoder-audit | `audit/audit.jsonl` | 不存在（optional；missing-optional-root 警告） | 不存在（同警告） |
| qoder-run-manifests | `logs/runs` | 存在 | 存在 |
| qoder-log-sessions | `logs/sessions/<slug>` | 存在（仅 1 个会话目录） | 存在（排查时刻 14 个会话目录） |
| qoder-projects | `projects/<slug>` | 存在（无会话 JSONL，仅 canvases/memory） | 存在（含会话目录与 subagents JSONL） |
| qoder-home-sessions | `sessions` | 不存在（optional；警告） | 不存在（同警告） |
| qoder-cache-projects | `cache/projects` | 存在；默认禁用（需 --include-cache） | 存在；默认禁用 |
| qoder-global-projects | `projects` | 存在；默认禁用（需 --include-global-capabilities；lead 通道默认启用，报告中的 “4/6 enabled source roots exist” 由此而来） | 存在；默认禁用 |

关键事实：本机 Qoder CN IDE（含当前会话）把该工作区的任务会话写入 CN home `C:\Users\ROG\.qoder-cn`；`~/.qoder` 对本工作区只保留了 qodercli（headless）产生的少量运行产物。

## 30 天窗口为何只登记到 1 个无请求会话

- 默认 home 复现（同窗口）：`taskEpisodes=1`、`candidateEpisodes=0`、`distinctRequests=0`、候选 0、请求根 0、populationCoverage 全 0、`omitted.noRequest=1`。
- 唯一会话 `e0a22b98-38a6-4648-8e5d-c0a53ceaf3d7`：`~/.qoder/logs/sessions/.../segments/2026-09-16T04-46-23|30|36+08:00-*-p79356.jsonl` 共 3 段（约 17KB），为 qodercli headless 运行（`session.config.loaded{interactive:false}`、`mcp_context.refresh`、`headless_plugin_install` 阶段），不含任何用户请求。
- 对照复现（`--qoder-home C:\Users\ROG\.qoder-cn`，同窗口）：`taskEpisodes=266`、`candidateEpisodes=18`、`distinctRequests=16`，产出候选 E1–E5 与请求根 R1–R8（真实需求如“四工具整合为统一 Web 应用”“按 DEVELOPMENT_PLAN 推进 ToolNest”“继续harness”等）。
- 结论：窗口内记录并非真的稀少，而是采集来源根错位——默认 `~/.qoder` 不是本机 IDE 会话的存放根，叠加唯一被采集会话为无请求的 headless 运行段。

## 空窗结论（正式记录）

- 冻结窗口（2026-08-18 ~ 2026-09-17）在默认采集配置下记为空窗：1 会话 / 0 请求 / 0 候选 / 0 请求根 / 变更·检查·结果信号均为 0；该可见性下重复工作与维护机会无法识别。
- 该空窗由来源根错位造成，不构成“工作区内没有值得固化的重复”的结论依据。
- 同一窗口在 CN home 采集下已验证可产出不少于 2 个可比 Task Episode（实际 5 个候选）。

## 下一窗口复核约定

- 复核采集显式指定 `--qoder-home C:\Users\ROG\.qoder-cn`（evidence-bundle 的会话通道与 lead 通道均接受该参数）。
- 验收：下一窗口给出 ≥2 个可比 Task Episode，或依据新的采集事实给出明确空窗结论。

## 复跑命令

```powershell
$q = "C:\Users\ROG\.qoder-cn\plugins\cache\qoder-bundler\better-harness\scripts\session-analysis\platforms\qoder.mjs"
node $q sources --workspace "d:\Users\Projects\SelfProgram\tool-nest"
node $q facts --workspace "d:\Users\Projects\SelfProgram\tool-nest" --qoder-home "C:\Users\ROG\.qoder-cn" --since "2026-08-18T00:45:00Z" --until "2026-09-17T00:45:00Z" --limit 5 --episode-limit 5
```
