# Engineering verification

- Commit/branch: `feature/phase-16-memo-i18n`（commit 待回填），基点 `5049bb3`（本地 `master`；`origin/master` `ed56014` 落后 19 提交且 phase 15 合并未推送，故取本地 master）
- Date: 2026-10-07
- Review: 两个 `.vue` 维持原有结构，仅 `sections`/`columns` 改 `computed` 并走 `t()`；随带删除两处既有的未使用 `NTag` 导入（差分 lint 净减 4 个错误）。发现一处缺陷并修复：量词条目文案含裸 `{0,}` 被 vue-i18n 当作插值占位符，导致 `/regex-memo` 整路由渲染崩溃（Message compilation error: Unterminated closing brace）；改用 intlify 字面量转义 `{'{'}`/`{'}'}` 渲染正常，并在测试中新增「locale 值不得含未转义花括号」回归守卫
- Codebase health: not triggered —— 无新增抽象、无跨模块改动，两个叶子组件 + locale 键 + 一个覆盖测试
- 既有观察（不在本轮范围）：`preferences.store.ts` 在 `load()` 时用服务端偏好覆盖 localStorage 语言项（浏览器验证中 localStorage 写 `en` 被重置为 `zh`，需走界面切换器）；`RegexMemo.vue` 的 `example` 字段从未被表格渲染；`git-memo` 的 D5（整行点击复制无反馈）见 `.scratch/tool-interaction-audit/findings.md:496`
- 生成物不入库：构建再生的 `apps/web/src/components.d.ts`（+1 行 `ToolTextPanel`，phase 11 遗留陈旧声明）与 `auto-imports.d.ts` 保持未暂存

| Check | Command | Result | Evidence / limitation |
| --- | --- | --- | --- |
| Tests | `pnpm --filter @toolnest/web test` | PASS | 271 tests / 38 files（含本阶段 `memo-tools-i18n.test.ts` 12 条：键树对齐 ×2、静态键可解析 ×2、定义键全覆盖 ×2、zh/en 语言纯净 ×2、标题双语格式 ×2、花括号守卫 ×2）；修复花括号前 269 通过但页面崩溃，证明浏览器验收不可替代 |
| Lint | `node .scratch/phase-16-evidence/differential-lint.mjs`（每文件 `eslint --stdin` 对基点 `5049bb3`） | PASS（差分） | +0 / -4：两个组件各消 1 个既有 `no-unused-vars`（NTag）；locale 与测试文件 0 → 0。全量 `pnpm lint` 仍在既有基线上失败（仓库 231 错误级基线，与本阶段无关） |
| Typecheck | `pnpm --filter @toolnest/web type-check`（vue-tsc --noEmit） | PASS | 无输出错误 |
| Build | `pnpm --filter @toolnest/web build` | PASS | 32.00 s（修复花括号后的最终树重跑；首次 51.85 s 为修复前） |
| Integration | Chrome DevTools MCP 驱动 worktree dev server（:3009） | PASS | 见下 |

浏览器验收（dev server :3009，zh 为默认 locale；en 经界面语言切换按钮切换，因 `preferences.store.ts` 会用服务端偏好覆盖 localStorage）：

- `/git-memo` zh：8 个分节标题全部「英文 · 中文」（`Configuration · 配置` … `Log & History · 日志与历史`）；35 条命令说明全部含中文、0 条纯英文；命令本体保持英文原样
- `/git-memo` en：8 个标题纯英文、35 条说明纯英文，0 处中文残留
- `/regex-memo` zh：7 个分节标题全部双语；表头「语法 / 含义」；47 行条目含义全部中文；量词行 `{0,}` `{1,}` `{0,1}` 经转义后字面渲染正常
- `/regex-memo` en：7 个标题纯英文、表头 Syntax/Meaning、47 行含义纯英文、0 处中文残留
- 两页面控制台均无错误/警告

## 合并到 master（2026-10-07，用户授权「合并到master」）

基点已前进：分支从本地 `master` `5049bb3` 切出，合并时 `master` 已到 `5d861af`（其间 `7b7eb00` chmod 双向输入、`ab3468f` crontab 五列网格两个提交也改了 `locales/*.json`），因此不是快进合并。

合并机制（主工作区有并行会话未提交改动，全程不触碰）：

1. `git worktree add --detach .worktrees/phase-16-merge master` → 在隔离树内 `merge --no-ff --no-commit feature/phase-16-memo-i18n`
2. 唯一冲突：`.workflow/STATE.md`（按惯例解为 master 侧较新框架文字 + 本阶段记录）；`apps/web/src/locales/*.json` 自动合并
3. 合并提交 `d429a00` `chore(merge): integrate phase 16 memo localization`
4. 主工作区（正在 `master` 上）`git merge --ff-only d429a00` 推进，未切换分支、未 stash、对方 WIP（`AGENTS.md`、`apps/web/vite.config.ts`、`package.json`、`apps/web/src/components.d.ts`）全程未被写入
5. `git worktree remove .worktrees/phase-16-merge`

完整性验证（命令与结果）：

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 祖先关系 | `git merge-base --is-ancestor {c793026,5d861af} HEAD` | 两条均成立（分支线 + master 线都在合并结果内） |
| 业务代码字节一致 | `git diff c793026 HEAD -- apps/web/src/tools/git-memo apps/web/src/tools/regex-memo apps/web/src/tools/memo-tools-i18n.test.ts` | 空输出 |
| locale 键并集 | Node 脚本比对 master / 分支 / 合并后三方的叶子键集合 | en、zh 各：丢失 0、意外新增 0；相对分支仅 `tools.crontabGenerator.syntaxDiagram` 取值改为 master 侧更新后的值（转义 `|` 的复数修复），相对 master 零改动 |
| 合并后门禁（主工作树） | `npx vitest run` | PASS 271 tests / 38 files |
| 合并后门禁 | `npx vue-tsc --noEmit` | PASS（exit 0，无输出） |
| 合并后门禁 | `npx vite build` | PASS 32.93 s |

未重跑项与理由：差分 lint 不再重跑——合并只新增 master 侧自身已验证的内容，phase 16 的 5 个文件与分支 tip 逐字节相同，而分支上已测 +0/−4；浏览器验收同理，页面代码与已在两个路由、两种 locale 实测通过的分支 tip 完全一致，locale 差异仅为双方键的并集。master 侧 `chmod`/`crontab` 文件在合并中未被改动（`git diff` 相对分支 tip 显示的是 master 自身的差异）。

推送状态：`master` 现领先 `origin/master` 27 个提交，本地未推送；`feature/phase-16-memo-i18n` 与其 worktree 按惯例保留。
