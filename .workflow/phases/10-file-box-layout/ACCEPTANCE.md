# Acceptance verification

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| 单文件框样式 | 只能放一个文件的框：整宽预览区高 128px，文件名在下方 | `/video-trim`：空态 `392×128` 虚线区；导入后预览 `392×128`、文件名在预览下方且左对齐；`/convert-to-jpg` 输出同为宽卡片 | PASS |
| 多文件框样式 | 能放多个文件的框：128×128 方格按网格排列，文件名在方格下方 | `/video-merge`：全部方格实测 128×128，网格按列宽填充（392px 处 2 列），虚线添加上传块同为 128×128 且排在最后；`/image-split` 输出 4 张 128×128 方格 | PASS |
| 移除方式 | 用卡片自带的 x 按钮移除文件 | 点击第一张方格的 x 后，该文件同时从上传控件与工具状态消失 | PASS |
| 排序方式 | 直接拖动方格调整顺序；删除卡片下方的紧凑排序行 | 拖动最后一个方格到最前，顺序变为 `merge-b` 打头，video-merge 的 `files` 与之完全一致（旧的本地 splice 不同步问题消失）；video-merge 与 audio-merge 的手搓列表已删除 | PASS |
| 覆盖范围 | 全部文件工具的输入框和输出框；输出框不支持排序 | 输入：47 个工具统一走 `ToolFileUpload`（`compact` 属性已从 45 个模板移除，守卫测试钉住）；输出：单结果 → 宽卡片，多结果（image-split/pdf-to-png/pdf-extract-images）→ 方格网格（`output-multiple`）；video-add-audio 两个单文件框均为宽卡片 | PASS |
| 功能不回归 | 粘贴导入、选择导入、拖拽导入仍可用；测试/类型/构建通过 | 合成粘贴事件在 `/video-trim` 导入为宽卡片；`pnpm test` 228 web + 52 server PASS；type-check PASS；build PASS (38.14s)；差分 lint 0 新增/0 消除 | PASS |

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. Manual checks performed by the implementing agent via Chrome DevTools MCP on 2026-10-02 against dev server `http://localhost:3002` (phase worktree).
