# Phase 11 Acceptance Criteria

## Scope (grilling-confirmed with user, 2026-10-02)

- [x] All two-textarea text tools (~85) get the two-column layout — 82 tools converted
      (88 with 2+ textareas minus 6 exclusions); each converted tool renders
      `ToolTextPanel` (pinned by `apps/web/src/tools/tool-text-panels.test.ts`, whose
      coverage test accounts for every two-textarea tool: 82 in EXPECTED, 6 in EXCLUDED)
- [x] Exclusions documented in CONTEXT.md: `base64-file-converter` (file tool, has
      ToolFileUpload), `meta-tag-generator` (form generator), `rsa-key-pair-generator`
      (no input), `bip39-generator` (no text output), `json-diff`/`text-diff`
      (two-input comparators)
- [x] No backend / processing-logic change — every transform function, service module
      and composable untouched; only templates, imports, and copy-helper removals

## Layout (per column: title + textarea on top, actions bar below)

- [x] Input column actions: [导入文件][粘贴文件] (user-picked distribution)
- [x] Output column actions: [复制][导出文件], disabled when output is empty
- [x] Parameters / declarations below the columns (`#params` slot): selects, switches,
      action buttons, error/warning alerts all moved there
- [x] Titles preserved where they existed; standard 输入/输出 titles added to
      previously untitled columns
- [x] Visual tokens mirror ToolFilePanel (surface-soft columns, hairline border,
      radius-lg) — consistent with the PDF processing tools

## Behaviour (browser-verified, see VERIFICATION.md)

- [x] 导入文件 reads any file as text into the input textarea (json-prettify, csv-to-tsv)
- [x] 粘贴文件 pastes clipboard text into the input textarea; denial surfaces
      读取剪贴板失败 instead of failing silently (days-to-hours)
- [x] 复制 copies output text with the 已复制！ toast (json-prettify)
- [x] 导出文件 downloads output as a text file with a per-tool name
      (output.json / output.tsv / payload.json / docker-compose.yml …)
- [x] Existing textarea ids preserved (jsonPrettifyField0/1, csvToTsvField0/1, …)
- [x] Multi-section tools keep both sections: text-to-binary/text-to-unicode/encryption
      as two stacked panels; jwt-parser/html-entities stack both outputs in the output
      column (jwt copy/export = payload)
- [x] Params still work after relocation: sql-prettify dialect/case selects format SQL;
      encryption 解密 round-trips 'hello'; json-prettify indent select + 清除 behave

## Technical gate

- [x] `pnpm test` PASS (222 web + 52 server)
- [x] `pnpm type-check` PASS
- [x] `pnpm build` PASS
- [x] Differential lint: 0 added / 0 removed across all 87 changed files vs base
      (repo-wide lint remains on the pre-existing 231-error baseline)
