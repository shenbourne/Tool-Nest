# Phase 20 — Acceptance

## Summary

22 tools migrated to shared `ToolTextPanel`, gaining unified 导入文件/从剪贴板复制 (input side) and 复制/导出文件 (output side) actions. `ToolTextPanel` gained `hideInput`/`hideOutput` props for single-column layouts.

## Migrated tools

### Input + Output (full two-column)

| Tool | Route | Notes |
|------|-------|-------|
| slugify | `/slugify` | |
| case-converter | `/case-converter` | hideOutput; multi-case results in params |
| text-repeat | `/text-repeat` | |
| url-encoder | `/url-encoder` | decode result in params |
| discord-timestamp | `/discord-timestamp` | |

### Generator (hideInput, output only)

| Tool | Route |
|------|-------|
| lorem-ipsum | `/lorem-ipsum` |
| uuid-generator | `/uuid-generator` |
| token-generator | `/token-generator` |
| ulid-generator | `/ulid-generator` |
| qr-code-generator | `/qr-code-generator` |
| svg-placeholder-generator | `/svg-placeholder-generator` |
| rsa-key-pair-generator | `/rsa-key-pair-generator` |
| bip39-generator | `/bip39-generator` |
| random-number-generator | `/random-number-generator` |
| password-generator | `/password-generator` |
| meta-tag-generator | `/meta-tag-generator` |
| time-between-dates | `/time-between-dates` |

### Analyzer (hideOutput, input only)

| Tool | Route |
|------|-------|
| text-statistics | `/text-statistics` |
| regex-tester | `/regex-tester` |
| user-agent-parser | `/user-agent-parser` |
| whois-lookup | `/whois-lookup` |
| censorship-check | `/censorship-check` |

### Special

| Tool | Route | Notes |
|------|-------|-------|
| html-wysiwyg-editor | `/html-wysiwyg-editor` | hideInput; contenteditable in params |

## Not migrated (evaluated)

| Tool | Reason |
|------|--------|
| benchmark-builder | Multi-suite code editor layout doesn't fit ToolTextPanel's input/output model |

## Verification gates

- Web tests: 335/335 PASS
- Server tests: 52/52 PASS
- Type check: clean
- Build: PASS (57s)
- Differential lint: 0 added errors

## Browser acceptance

Pending user review. Representative routes to verify:
- `/slugify` — import/paste/copy/export
- `/uuid-generator` — hideInput, copy/export
- `/text-statistics` — hideOutput, import/paste
- `/url-encoder` — two-column with decode in params

## 2026-10-10 maintenance — centered file titles

- PASS (source review): upload and output cards both inherit FileCard.vue `.file-card__name { width: 100%; text-align: center; }`; left-alignment overrides removed.
- PASS (source review): long filenames retain overflow clipping, ellipsis, nowrap, and full-name title tooltip.
- Browser screenshot comparison: NOT RUN; acceptance evidence is CSS cascade inspection.
