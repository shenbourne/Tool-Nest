# 08 — data 分类

Status: ready-for-agent
Type: task
Blocked by: 00-shared-namespace

## 范围

22 个文件 / 46 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/csv-change-separator/CsvChangeSeparator.vue` | 1 |
| `tools/csv-find-incomplete/CsvFindIncomplete.vue` | 2 |
| `tools/csv-insert-columns/CsvInsertColumns.vue` | 4 |
| `tools/csv-rows-to-columns/CsvRowsToColumns.vue` | 2 |
| `tools/csv-swap-columns/CsvSwapColumns.vue` | 3 |
| `tools/csv-to-json/CsvToJson.vue` | 2 |
| `tools/csv-to-tsv/CsvToTsv.vue` | 2 |
| `tools/csv-to-xml/CsvToXml.vue` | 2 |
| `tools/csv-to-yaml/CsvToYaml.vue` | 2 |
| `tools/csv-transpose/CsvTranspose.vue` | 2 |
| `tools/list-duplicate/ListDuplicate.vue` | 2 |
| `tools/list-find-popular/ListFindPopular.vue` | 2 |
| `tools/list-find-unique/ListFindUnique.vue` | 2 |
| `tools/list-group/ListGroup.vue` | 2 |
| `tools/list-reverse/ListReverse.vue` | 2 |
| `tools/list-rotate/ListRotate.vue` | 2 |
| `tools/list-shuffle/ListShuffle.vue` | 2 |
| `tools/list-sort/ListSort.vue` | 2 |
| `tools/list-truncate/ListTruncate.vue` | 1 |
| `tools/list-unwrap/ListUnwrap.vue` | 2 |
| `tools/list-wrap/ListWrap.vue` | 3 |
| `tools/tsv-to-json/TsvToJson.vue` | 2 |

## 待替换文案明细

### `tools/csv-change-separator/CsvChangeSeparator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 24 | attr:placeholder | "CSV input..." |

### `tools/csv-find-incomplete/CsvFindIncomplete.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 29 | attr:placeholder | "Input..." |

### `tools/csv-insert-columns/CsvInsertColumns.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 34 | attr:placeholder | "CSV input..." |

### `tools/csv-rows-to-columns/CsvRowsToColumns.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | attr:placeholder | "Input..." |

### `tools/csv-swap-columns/CsvSwapColumns.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 29 | attr:placeholder | "CSV input..." |

### `tools/csv-to-json/CsvToJson.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | attr:placeholder | "Input..." |

### `tools/csv-to-tsv/CsvToTsv.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 23 | attr:placeholder | "Input..." |

### `tools/csv-to-xml/CsvToXml.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 29 | attr:placeholder | "Input..." |

### `tools/csv-to-yaml/CsvToYaml.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | attr:placeholder | "Input..." |

### `tools/csv-transpose/CsvTranspose.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | attr:placeholder | "Input..." |

### `tools/list-duplicate/ListDuplicate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 15 | attr:placeholder | "Input..." |

### `tools/list-find-popular/ListFindPopular.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 16 | attr:placeholder | "Input..." |

### `tools/list-find-unique/ListFindUnique.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 12 | attr:placeholder | "Input..." |

### `tools/list-group/ListGroup.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 18 | attr:placeholder | "List items (one per line)..." |

### `tools/list-reverse/ListReverse.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 12 | attr:placeholder | "Input..." |

### `tools/list-rotate/ListRotate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "List items..." |

### `tools/list-shuffle/ListShuffle.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 16 | attr:placeholder | "Input..." |

### `tools/list-sort/ListSort.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 12 | attr:placeholder | "Input..." |

### `tools/list-truncate/ListTruncate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 13 | attr:placeholder | "List items..." |

### `tools/list-unwrap/ListUnwrap.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 12 | attr:placeholder | "Input..." |

### `tools/list-wrap/ListWrap.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 14 | attr:placeholder | "List items..." |

### `tools/tsv-to-json/TsvToJson.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | attr:placeholder | "Input..." |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/08-data.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize data tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments
