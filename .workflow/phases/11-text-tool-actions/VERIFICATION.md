# Phase 11 Verification

Branch `feature/phase-11-text-tool-actions` (worktree `.worktrees/phase-11-text-tool-actions`),
base local `master` `b44a61a` (fetch compared clean: ahead 47 / behind 0 vs origin/master).

## Commands and results

| Check | Command | Result |
| --- | --- | --- |
| Web tests | `npx vitest run` (apps/web) | PASS — 33 files, 222 tests (219 pre-phase + 3 new guard tests) |
| Full tests | `pnpm test` (repo root) | PASS — 222 web + 52 server |
| Type check | `pnpm type-check` (repo root) | PASS (vue-tsc, exit 0) |
| Build | `pnpm build` (repo root) | PASS — web built in 45.26 s |
| Differential lint | `node .scratch/phase-11/differential-lint.mjs b44a61a` | 87 changed files, added 2 / removed 0 on first run — two unused `NSpace` imports introduced by the migration (`docker-run-to-compose`, `hmac-generator`); fixed in `03a7469`, rerun added 0 / removed 0 (repo stays on the pre-existing 231-error baseline) |

## Browser evidence (Chrome DevTools MCP, dev server http://localhost:3003)

| Tool (layout type) | Evidence |
| --- | --- |
| json-prettify (top-params) | 2 columns titled 输入 JSON / 格式化输出; input bar [导入文件][粘贴文件] enabled, output bar [复制][导出文件] disabled when empty. Import via hidden input + change event fills input and enables output buttons. Patched `clipboard.readText` → 粘贴文件 updates input, output recomputes. 复制 shows toast 已复制！. 导出文件 captured `output.json` with the formatted JSON (20 B) |
| csv-to-tsv (codemod uniform) | Columns 输入/输出 with the four buttons; typing `a,b\n1,2` yields `a\tb\n1\t2`; export captured `output.tsv` with the TSV |
| jwt-parser (stacked outputs) | Output column holds 2 textareas; pasting a real 3-part JWT fills header and payload; 导出文件 captured `payload.json` containing the payload JSON |
| text-to-binary (two panels) | 2 ToolTextPanel instances, each 输入/[section title] with the four buttons; 'Hi' → `01001000 01101001`; invalid binary in panel 2 shows 无效的二进制输入 in that panel's params |
| encryption (two panels + action) | Round trip: 加密 panel encrypts 'hello' (44-char ciphertext in output); ciphertext into 解密 panel, click 解密 → output 'hello'. Params hold secret input + algo select (+ button on decrypt) |
| days-to-hours (uniform + alert) | Invalid input `3abc` renders the error alert inside `.tool-text-panel__params`; output empty. Rejected `clipboard.readText` (NotAllowedError) → toast 读取剪贴板失败 (failure is reported, not silent) |
| sql-prettify (params selects) | `select id, name from users where active = 1` → formatted multi-line SQL; dialect + keyword-case selects live in params below the columns |

## Notes / limitations

- `components.d.ts` regenerated during build with an empty content diff (CRLF artefact) — not staged.
- Dev server took port 3003 (3000–3002 held by other sessions' servers).
- Real OS-clipboard paste was not driven end-to-end: Chrome gates `clipboard.readText`
  behind a permission prompt that does not resolve under automation. The button's
  success path was verified with a patched `readText` (all app code real), and the
  denial path with a rejecting `readText` (toast verified). The clipboard util itself
  (`readClipboardText`) has no legacy fallback by design (documented in code).
