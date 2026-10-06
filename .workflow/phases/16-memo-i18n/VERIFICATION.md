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
