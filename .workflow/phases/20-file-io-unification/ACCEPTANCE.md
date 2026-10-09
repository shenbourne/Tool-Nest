# Phase 20 — Acceptance Criteria

## Per-tool criteria

Each migrated tool must demonstrate:
1. Input side shows 导入文件 and 从剪贴板复制 buttons (if input exists)
2. Output side shows 复制 and 导出文件 buttons (if output exists)
3. Import button opens file picker and loads file content into input
4. Paste button reads clipboard text into input
5. Copy button copies output to clipboard with success feedback
6. Export button downloads output as a file
7. Existing tool functionality is unchanged (computation logic untouched)
8. No console errors

## ToolTextPanel new props

9. `hideInput` renders only the output column with actions
10. `hideOutput` renders only the input column with actions
11. Existing 82 tools using ToolTextPanel are unaffected (no regression)

## Browser verification sample

At minimum, drive these routes in a real browser:
- `/url-encoder` — input+output migration
- `/uuid-generator` — hideInput migration
- `/text-statistics` — hideOutput migration
- `/slugify` — single-line input+output migration

## Gates

- `pnpm --filter @toolnest/web test` PASS
- `pnpm --filter @toolnest/web type-check` PASS (or `vue-tsc --noEmit`)
- `pnpm --filter @toolnest/web build` PASS
- Differential lint: 0 added errors on changed files
