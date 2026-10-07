# Implementation plan

- Branch/worktree: `feature/phase-16-memo-i18n` @ `.worktrees/phase-16-memo-i18n`, cut from local `master` `5049bb3`（`origin/master` `ed56014` 落后 19 个提交，phase 15 合并尚未推送，故基点取本地 `master` 以保住 phase 12/14/15 的树）
- Relevant files/interfaces:
  - `apps/web/src/tools/git-memo/GitMemo.vue` — `sections` 由普通常量改为 `computed`，`title` / `description` 改走 `t()`
  - `apps/web/src/tools/regex-memo/RegexMemo.vue` — 同样处理 `sections`，并把 `columns` 也改为 `computed` 以取表头文案
  - `apps/web/src/locales/{en,zh}.json` — `tools.gitMemo` / `tools.regexMemo` 子树新增键
  - 新增 `apps/web/src/tools/memo-tools-i18n.test.ts` — 覆盖键树对齐、静态键可解析、标题双语格式与无英文残留
- Risks:
  - `apps/web/src/locales/*.json` 是并行会话的公共写点（主工作树当前就有另一会话未提交的改动），合并时可能冲突；本轮只在 worktree 内改，合并交给后续会话
  - `RegexMemo.vue` 的 `example` 字段未被渲染（`columns` 只有 syntax/meaning），翻译它等于产出无人读取的文案；本轮保持原样，作为既有观察记录在 `VERIFICATION.md`
  - `apps/web/vitest.config.ts` 只收 `src/**/*.test.ts`（node 环境），`.vue` 内逻辑不可测；因此测试直接比对 locale JSON 与 `.vue` 中的静态键字面量

| Task | Change | Test/evidence | Commit | Status |
| --- | --- | --- | --- | --- |
| 1 | GitMemo.vue 改 `computed` + `t()`；en/zh 增加 `sections.*`（8）与 `commands.*`（35） | 浏览器核对 `/git-memo` 中英两态（8/8 双语标题、35/35 中文注释 / 纯英文 en 态） | `cbcfc47` | DONE |
| 2 | RegexMemo.vue 改 `computed` + `t()`（含表头）；en/zh 增加 `sections.*`（7）、`*Column`（2）与条目含义（47）；量词花括号用 intlify 转义 | 浏览器核对 `/regex-memo` 中英两态（7/7 双语标题、语法/含义表头、47/47 中文含义） | `72f1e0d` | DONE |
| 3 | `memo-tools-i18n.test.ts` 覆盖键树对齐、静态键可解析、定义键全覆盖、语言纯净、标题双语格式、花括号守卫 | `pnpm --filter @toolnest/web test`：271 通过（含本文件 12 条） | `72f1e0d` | DONE |
| 4 | 门禁 + 差分 lint + 浏览器验收；写 VERIFICATION.md / ACCEPTANCE.md | type-check PASS、build PASS（32.00 s）、差分 lint +0 / -4 | docs 提交 | DONE |
| 5 | 更新 `.workflow/STATE.md` 与 `ROADMAP.md` | 文档一致性自查 | docs 提交 | DONE |
