# 07 — text 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

20 个文件 / 46 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/create-palindrome/CreatePalindrome.vue` | 2 |
| `tools/email-extractor/EmailExtractor.vue` | 2 |
| `tools/emoji-picker/EmojiPicker.vue` | 1 |
| `tools/extract-substring/ExtractSubstring.vue` | 3 |
| `tools/hidden-char-detector/HiddenCharDetector.vue` | 2 |
| `tools/numeronym-generator/NumeronymGenerator.vue` | 1 |
| `tools/palindrome-checker/PalindromeChecker.vue` | 2 |
| `tools/quote-generator/QuoteGenerator.vue` | 1 |
| `tools/remove-duplicate-lines/RemoveDuplicateLines.vue` | 2 |
| `tools/rot13/Rot13.vue` | 2 |
| `tools/text-censor/TextCensor.vue` | 2 |
| `tools/text-diff/TextDiff.vue` | 3 |
| `tools/text-join/TextJoin.vue` | 2 |
| `tools/text-repeat/TextRepeat.vue` | 2 |
| `tools/text-replacer/TextReplacer.vue` | 4 |
| `tools/text-reverse/TextReverse.vue` | 2 |
| `tools/text-rotate/TextRotate.vue` | 2 |
| `tools/text-split/TextSplit.vue` | 2 |
| `tools/text-statistics/TextStatistics.vue` | 8 |
| `tools/text-truncate/TextTruncate.vue` | 1 |

## 待替换文案明细

### `tools/create-palindrome/CreatePalindrome.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 15 | attr:placeholder | "Input..." |

### `tools/email-extractor/EmailExtractor.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 15 | attr:placeholder | "Input..." |

### `tools/emoji-picker/EmojiPicker.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 25 | attr:placeholder | "Search emoji..." |

### `tools/extract-substring/ExtractSubstring.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 14 | attr:placeholder | "Input text..." |

### `tools/hidden-char-detector/HiddenCharDetector.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 20 | attr:placeholder | "Input..." |

### `tools/numeronym-generator/NumeronymGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 23 | attr:placeholder | "Enter a word, e.g. 'internationalization'" |

### `tools/palindrome-checker/PalindromeChecker.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 18 | attr:placeholder | "Input..." |

### `tools/quote-generator/QuoteGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | text | "Next Quote" |

### `tools/remove-duplicate-lines/RemoveDuplicateLines.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 12 | attr:placeholder | "Input..." |

### `tools/rot13/Rot13.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 15 | attr:placeholder | "Input..." |

### `tools/text-censor/TextCensor.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input..." |

### `tools/text-diff/TextDiff.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 33 | attr:title | "Original" |

### `tools/text-join/TextJoin.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 13 | attr:placeholder | "Input..." |

### `tools/text-repeat/TextRepeat.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 13 | attr:placeholder | "Text to repeat..." |

### `tools/text-replacer/TextReplacer.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 23 | text | "Regex" |

### `tools/text-reverse/TextReverse.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 12 | attr:placeholder | "Input..." |

### `tools/text-rotate/TextRotate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input lines..." |

### `tools/text-split/TextSplit.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 15 | attr:placeholder | "Input..." |

### `tools/text-statistics/TextStatistics.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 18 | attr:placeholder | "Paste or type text here..." |

### `tools/text-truncate/TextTruncate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 18 | attr:placeholder | "Input text..." |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/07-text.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize text tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
