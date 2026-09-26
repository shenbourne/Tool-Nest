# 02 — converter 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

23 个文件 / 93 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/base-converter/BaseConverter.vue` | 4 |
| `tools/base64-encoder/Base64Encoder.vue` | 5 |
| `tools/base64-file-converter/Base64FileConverter.vue` | 9 |
| `tools/byte-converter/ByteConverter.vue` | 1 |
| `tools/case-converter/CaseConverter.vue` | 1 |
| `tools/date-time-converter/DateTimeConverter.vue` | 6 |
| `tools/json-to-toml/JsonToToml.vue` | 2 |
| `tools/json-to-xml/JsonToXml.vue` | 3 |
| `tools/json-to-yaml/JsonToYaml.vue` | 3 |
| `tools/list-converter/ListConverter.vue` | 15 |
| `tools/markdown-to-html/MarkdownToHtml.vue` | 6 |
| `tools/morse-code/MorseCode.vue` | 2 |
| `tools/number-to-words/NumberToWords.vue` | 2 |
| `tools/roman-numeral-converter/RomanNumeralConverter.vue` | 4 |
| `tools/temperature/Temperature.vue` | 3 |
| `tools/text-to-binary/TextToBinary.vue` | 5 |
| `tools/text-to-nato-alphabet/TextToNatoAlphabet.vue` | 4 |
| `tools/text-to-unicode/TextToUnicode.vue` | 5 |
| `tools/toml-to-json/TomlToJson.vue` | 2 |
| `tools/toml-to-yaml/TomlToYaml.vue` | 3 |
| `tools/xml-to-json/XmlToJson.vue` | 2 |
| `tools/yaml-to-json/YamlToJson.vue` | 3 |
| `tools/yaml-to-toml/YamlToToml.vue` | 3 |

## 待替换文案明细

### `tools/base-converter/BaseConverter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 31 | attr:label | "Input base" |

### `tools/base64-encoder/Base64Encoder.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 45 | text | "Encode" |

### `tools/base64-file-converter/Base64FileConverter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 86 | text | "Filename:" |

### `tools/byte-converter/ByteConverter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 15 | attr:placeholder | "Enter bytes..." |

### `tools/case-converter/CaseConverter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 40 | attr:placeholder | "Enter text to convert..." |

### `tools/date-time-converter/DateTimeConverter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 44 | text | "Now" |

### `tools/json-to-toml/JsonToToml.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input JSON" |

### `tools/json-to-xml/JsonToXml.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input JSON" |

### `tools/json-to-yaml/JsonToYaml.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input JSON" |

### `tools/list-converter/ListConverter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 66 | text | "Separator" |

### `tools/markdown-to-html/MarkdownToHtml.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 44 | text | "Copy HTML" |

### `tools/morse-code/MorseCode.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 19 | attr:placeholder | "Input..." |

### `tools/number-to-words/NumberToWords.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 24 | attr:placeholder | "Input..." |

### `tools/roman-numeral-converter/RomanNumeralConverter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 49 | text | "Invalid roman numeral" |

### `tools/temperature/Temperature.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 13 | attr:label | "Celsius (°C)" |

### `tools/text-to-binary/TextToBinary.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 38 | attr:title | "Text → ASCII Binary" |

### `tools/text-to-nato-alphabet/TextToNatoAlphabet.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 23 | attr:title | "Input" |

### `tools/text-to-unicode/TextToUnicode.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 30 | attr:title | "Text → Unicode Entities" |

### `tools/toml-to-json/TomlToJson.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input TOML" |

### `tools/toml-to-yaml/TomlToYaml.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input TOML" |

### `tools/xml-to-json/XmlToJson.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input XML" |

### `tools/yaml-to-json/YamlToJson.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input YAML" |

### `tools/yaml-to-toml/YamlToToml.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 26 | attr:title | "Input YAML" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/02-converter.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize converter tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
