# Phase 20 — File IO Unification

## Goal

Unify all tools' input file box (导入文件 / 从剪贴板复制) and output file box (粘贴到剪贴板 / 导出文件) by migrating the 22 tools that still lack file IO to the shared panel components.

## Background

The `tool-file-io-enhancement` branch (10 commits, 99 files, +3435/-116) attempted to solve this by adding per-tool file IO via three new composables (`useFileUpload`, `useFileDownload`, `usePaste`). This approach is superseded by master's shared panel architecture:

- **ToolTextPanel** — 82 text tools already migrated (phase 11)
- **ToolTextPairPanel** — diff tools (phase 17)
- **ToolFilePanel + ToolFileUpload** — 47 file tools (phases 06/07/10)

The branch is **not merged**. Instead, this phase migrates the remaining 22 tools to the shared panels.

## Scope

### Full migration to ToolTextPanel (input + output + params)

| Tool | Category | Notes |
|------|----------|-------|
| url-encoder | converter | encode + decode outputs, needs custom layout or two panels |
| case-converter | converter | single input, multiple outputs |
| slugify | web | single-line input/output |
| text-repeat | text | input + count param + output |

### Generator tools (output only, needs hideInput)

| Tool | Notes |
|------|-------|
| lorem-ipsum | params: type + count |
| uuid-generator | param: count |
| token-generator | params: length + charset |
| ulid-generator | param: count |
| qr-code-generator | output is canvas/image, not text |
| svg-placeholder-generator | output is SVG text |
| rsa-key-pair-generator | two outputs (public + private) |
| bip39-generator | params: word count |
| random-number-generator | params: min/max/count |
| password-generator | params: length + options |

### Analyzer tools (input only, needs hideOutput)

| Tool | Notes |
|------|-------|
| text-statistics | output is statistics grid, not text |
| regex-tester | three-section layout (pattern/text/results) |
| user-agent-parser | output is parsed fields |
| whois-lookup | output is lookup result |
| censorship-check | output is check result |

### Special cases (evaluate individually)

| Tool | Notes |
|------|-------|
| html-wysiwyg-editor | contenteditable, not NInput |
| time-between-dates | date pickers, not textareas |
| discord-timestamp | single timestamp input |
| benchmark-builder | complex form |
| meta-tag-generator | form + generated output |

## Technical Plan

1. Add `hideInput` / `hideOutput` props to `ToolTextPanel`
2. Migrate each tool to `ToolTextPanel` (or evaluate special handling)
3. Each tool migration = 1 atomic commit
4. Run verification gates
5. Browser acceptance for representative samples

## Non-goals

- Not merging `tool-file-io-enhancement` branch
- Not changing tools already on shared panels
- Not adding file IO to tools that don't need it (e.g., camera-recorder, emoji-picker)
