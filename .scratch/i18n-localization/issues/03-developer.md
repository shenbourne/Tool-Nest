# 03 — developer 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

17 个文件 / 88 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/crontab-generator/CrontabGenerator.vue` | 6 |
| `tools/docker-compose-to-1panel/DockerComposeTo1panel.vue` | 14 |
| `tools/docker-run-to-compose/DockerRunToCompose.vue` | 4 |
| `tools/email-normalizer/EmailNormalizer.vue` | 4 |
| `tools/json-diff/JsonDiff.vue` | 5 |
| `tools/json-escape/JsonEscape.vue` | 2 |
| `tools/json-minify/JsonMinify.vue` | 5 |
| `tools/json-sort/JsonSort.vue` | 2 |
| `tools/json-stringify/JsonStringify.vue` | 2 |
| `tools/json-to-csv/JsonToCsv.vue` | 3 |
| `tools/json-validate/JsonValidate.vue` | 2 |
| `tools/json-viewer/JsonViewer.vue` | 4 |
| `tools/regex-tester/RegexTester.vue` | 11 |
| `tools/sql-prettify/SqlPrettify.vue` | 7 |
| `tools/xml-formatter/XmlFormatter.vue` | 8 |
| `tools/xml-validator/XmlValidator.vue` | 2 |
| `tools/yaml-viewer/YamlViewer.vue` | 7 |

## 待替换文案明细

### `tools/crontab-generator/CrontabGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 74 | text | "Invalid cron expression" |

### `tools/docker-compose-to-1panel/DockerComposeTo1panel.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 99 | text | "Converts standard docker-compose YAML to 1Panel-compatible format by:" |

### `tools/docker-run-to-compose/DockerRunToCompose.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 54 | text | "Warnings" |

### `tools/email-normalizer/EmailNormalizer.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 44 | attr:title | "Input Email Addresses" |

### `tools/json-diff/JsonDiff.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 75 | attr:title | "Left JSON" |

### `tools/json-escape/JsonEscape.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 18 | text | "Escape / Unescape" |

### `tools/json-minify/JsonMinify.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 23 | attr:title | "Invalid JSON" |

### `tools/json-sort/JsonSort.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input..." |

### `tools/json-stringify/JsonStringify.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 15 | attr:placeholder | "Input..." |

### `tools/json-to-csv/JsonToCsv.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input JSON" |

### `tools/json-validate/JsonValidate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 16 | attr:placeholder | "Input..." |

### `tools/json-viewer/JsonViewer.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 36 | text | "Indent:" |

### `tools/regex-tester/RegexTester.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 94 | text | "Global (g)" |

### `tools/sql-prettify/SqlPrettify.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 58 | text | "SQL Dialect" |

### `tools/xml-formatter/XmlFormatter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 43 | text | "Format" |

### `tools/xml-validator/XmlValidator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 20 | attr:placeholder | "Input..." |

### `tools/yaml-viewer/YamlViewer.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 51 | text | "Indent size:" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/03-developer.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize developer tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
