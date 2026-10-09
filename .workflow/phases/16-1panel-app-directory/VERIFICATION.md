# Verification

日期：2026-10-07。工作区：`.worktrees/phase-16-1panel-app-directory`，分支 `feature/phase-16-1panel-app-directory`（基于本地 master `5049bb3`，远端无新提交）。

## 技术验证（worktree 内）

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| web 单测 | `pnpm test`（apps/web，vitest） | PASS：39 文件 / 274 用例（新增 15：service 5 + directory 10，含 zip 解包断言） |
| server 单测 | `pnpm test`（apps/server） | PASS：8 文件 / 52 用例（本 phase 未触碰 server） |
| 类型检查 | `npx vue-tsc --noEmit`（apps/web） | PASS（修复后无错误） |
| 构建 | `pnpm build:web`（vue-tsc + vite） | PASS，32.18 s；`jszip` 独立分包 `jszip.min-*.js`，不进主包 |
| 定向 lint | `npx eslint <本 phase 6 个改动文件>` | 0 错误 0 警告（仓库基线 231 错误未变，未全量跑） |

## 浏览器验收（Chrome DevTools MCP，dev server `:3012`，路由 `/docker-compose-to-1panel`）

页内 `evaluate_script` 驱动 + 真实 CDP click；zip 内容经页内 `JSZip.loadAsync` 解包断言。明细见 ACCEPTANCE.md。

注意：naive-ui 2.45 的折叠标题对合成 `el.click()` 不响应（`happensIn` 依赖真实事件路径），用 CDP 真实点击验证折叠正常——真实用户不受影响。

## 残留/未做

- `apps/web/src/components.d.ts`（+1 行 ToolTextPanel 注册）与 `auto-imports.d.ts` 为构建再生成产物，按仓库惯例未暂存。
- 主工作树仍有其他会话的未提交改动（AGENTS.md、vite.config.ts、package.json 等），本 phase 全程在隔离 worktree 进行，未触碰。
- dev server（:3012）验证完毕后已停止。
