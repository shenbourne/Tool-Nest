# 13 — pdf 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

11 个文件 / 30 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/compress-pdf/CompressPdf.vue` | 2 |
| `tools/convert-to-pdf/ConvertToPdf.vue` | 3 |
| `tools/pdf-editor/PdfEditor.vue` | 5 |
| `tools/pdf-extract-images/PdfExtractImages.vue` | 2 |
| `tools/pdf-merge/PdfMerge.vue` | 3 |
| `tools/pdf-protect/PdfProtect.vue` | 3 |
| `tools/pdf-rotate/PdfRotate.vue` | 2 |
| `tools/pdf-signature-checker/PdfSignatureChecker.vue` | 1 |
| `tools/pdf-split/PdfSplit.vue` | 3 |
| `tools/pdf-to-epub/PdfToEpub.vue` | 3 |
| `tools/pdf-to-png/PdfToPng.vue` | 3 |

## 待替换文案明细

### `tools/compress-pdf/CompressPdf.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 30 | text | "Compress PDF" |

### `tools/convert-to-pdf/ConvertToPdf.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 32 | text | "Convert to PDF" |

### `tools/pdf-editor/PdfEditor.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 114 | text | "Apply" |

### `tools/pdf-extract-images/PdfExtractImages.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 64 | text | "Extract Images" |

### `tools/pdf-merge/PdfMerge.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 35 | text | "Merge PDFs" |

### `tools/pdf-protect/PdfProtect.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | text | "Process PDF" |

### `tools/pdf-rotate/PdfRotate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 29 | text | "Rotate PDF" |

### `tools/pdf-signature-checker/PdfSignatureChecker.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 50 | text | "Check Signatures" |

### `tools/pdf-split/PdfSplit.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 32 | text | "Extract Pages" |

### `tools/pdf-to-epub/PdfToEpub.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 64 | text | "Convert" |

### `tools/pdf-to-png/PdfToPng.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 66 | text | "Scale:" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/13-pdf.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize pdf tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
