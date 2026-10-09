# Phase 20 — Context

## Branch

`feature/phase-20-file-io-unification` cut from `master` at `313a6b2` (post phase-16 1Panel merge).

## Shared Panel Components

### ToolTextPanel

Location: `apps/web/src/components/ToolTextPanel.vue`

Props:
- `inputTitle?: string` — input column title
- `outputTitle?: string` — output column title
- `inputText: string` — input value (v-model:inputText)
- `outputText: string` — output value (readonly)
- `exportName?: string` — default "output.txt"
- `hideInput?: boolean` — NEW: render only output column
- `hideOutput?: boolean` — NEW: render only input column

Slots:
- `#input` — input NInput/textarea
- `#output` — output NInput/textarea
- `#params` — parameters section below columns

Actions built-in:
- Input side: 导入文件 (file import), 从剪贴板复制 (paste from clipboard)
- Output side: 复制 (copy to clipboard), 导出文件 (export as file)

### ToolTextPairPanel

For diff tools with two inputs. Not needed in this phase.

### ToolFilePanel / ToolFileUpload

For file-based tools (already migrated in phases 06/07/10). Not needed in this phase.

## Locale Keys

Existing keys in `apps/web/src/locales/en.json` and `zh.json`:
- `tool.importFile` / `tool.pasteFile` / `tool.copy` / `tool.exportFile`
- `tool.importFailed` / `tool.pasteFailed`
- `common.input` / `common.output`

No new locale keys needed for this phase.

## Testing

Existing test files that must keep passing:
- `apps/web/src/tools/tool-text-panels.test.ts` — shared panel contract tests
- `apps/web/src/tools/tool-file-import-controls.test.ts` — file import control tests

## Commit Convention

Single-line Conventional Commit subjects (commit-lint hook rejects multi-line).
Each tool migration = 1 commit.
