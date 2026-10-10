# M2: Format Conversion Tools

## Overview
Migrate 17 format conversion tools from it-tools. These tools require format parsing libraries (js-yaml, @iarna/toml, xml-js, markdown-it, sql-formatter, json5, dayjs, papaparse).

## Dependencies (all installed)
- `js-yaml` + `@types/js-yaml` — YAML parse/stringify
- `@iarna/toml` — TOML parse/stringify
- `xml-js` — XML↔JSON conversion
- `markdown-it` + `@types/markdown-it` — Markdown→HTML
- `sql-formatter` — SQL prettify
- `json5` + `@types/json5` — lenient JSON parsing
- `dayjs` — date formatting
- `papaparse` + `@types/papaparse` — CSV parsing

## Tool List (17 tools)

### Task 1: Simple Converters (4 tools)
1. **text-to-unicode** — Text↔Unicode entity conversion (service: charCode entities)
2. **json-minify** — Minify JSON (remove whitespace)
3. **markdown-to-html** — Markdown→HTML preview + print (markdown-it)
4. **base64-file-converter** — Base64↔File (upload/download)

### Task 2: YAML Tools (4 tools)
5. **yaml-to-json** — YAML→JSON (js-yaml parse + JSON.stringify)
6. **json-to-yaml** — JSON→YAML (JSON5.parse + js-yaml stringify)
7. **yaml-to-toml** — YAML→TOML (js-yaml parse + @iarna/toml stringify)
8. **yaml-viewer** — YAML prettify with sort keys + indent options (js-yaml)

### Task 3: TOML + JSON Format Tools (4 tools)
9. **toml-to-json** — TOML→JSON (@iarna/toml parse + JSON.stringify)
10. **toml-to-yaml** — TOML→YAML (@iarna/toml parse + js-yaml stringify)
11. **json-to-toml** — JSON→TOML (JSON5.parse + @iarna/toml stringify)
12. **json-to-csv** — JSON array→CSV (JSON5.parse + papaparse or manual)

### Task 4: XML + SQL Tools (3 tools)
13. **xml-to-json** — XML→JSON (xml-js)
14. **json-to-xml** — JSON→XML (xml-js)
15. **sql-prettify** — SQL formatter with dialect/case/indent options (sql-formatter)

### Task 5: Date-Time + List Converters (2 tools)
16. **date-time-converter** — Multi-format date converter (dayjs). Includes Unix timestamp bidirectional conversion (merged from inventory #196).
17. **list-converter** — List transformer with sort/dedup/prefix/suffix options

### Task 6: Verification
- Type-check all packages
- Run all tests
- Verify 17/17 i18n keys in en.json + zh.json
- Verify registry auto-discovery

## Migration Pattern
Each tool:
1. `apps/web/src/tools/<name>/index.ts` — defineTool with i18n keys, category, tags, keywords
2. `apps/web/src/tools/<name>/<Name>.vue` — ToolLayout + Naive UI components
3. `apps/web/src/tools/<name>/<name>.service.ts` — pure conversion functions (when needed)
4. i18n entries in `apps/web/src/locales/en.json` + `zh.json`

## Global Constraints
- Use `ToolLayout` wrapper + `useCurrentTool()` composable
- Use Naive UI components (NCard, NInput, NButton, NSpace, NSelect, etc.)
- Service functions return `{ result: string, error: string | null }` pattern
- All text in UI uses `t('tool.xxx')` i18n keys
- No hardcoded English/Chinese strings in components
