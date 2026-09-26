# 06 — generator 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

7 个文件 / 61 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/number-generator/NumberGenerator.vue` | 2 |
| `tools/otp-generator/OtpGenerator.vue` | 14 |
| `tools/password-generator/PasswordGenerator.vue` | 8 |
| `tools/qr-code-generator/QrCodeGenerator.vue` | 8 |
| `tools/random-number-generator/RandomNumberGenerator.vue` | 5 |
| `tools/svg-placeholder-generator/SvgPlaceholderGenerator.vue` | 12 |
| `tools/wifi-qr-code-generator/WifiQrCodeGenerator.vue` | 12 |

## 待替换文案明细

### `tools/number-generator/NumberGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 21 | attr:placeholder | "Input..." |

### `tools/otp-generator/OtpGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 95 | text | "Generate new secret" |

### `tools/password-generator/PasswordGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 30 | text | "Length:" |

### `tools/qr-code-generator/QrCodeGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 64 | text | "Foreground" |

### `tools/random-number-generator/RandomNumberGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 23 | text | "Unique only" |

### `tools/svg-placeholder-generator/SvgPlaceholderGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 48 | text | "Width" |

### `tools/wifi-qr-code-generator/WifiQrCodeGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 62 | text | "Encryption" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/06-generator.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize generator tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
