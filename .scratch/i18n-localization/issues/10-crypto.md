# 10 — crypto 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

11 个文件 / 39 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/bcrypt/BcryptTool.vue` | 6 |
| `tools/bip39-generator/Bip39Generator.vue` | 3 |
| `tools/encryption/EncryptionTool.vue` | 8 |
| `tools/hash-text/HashText.vue` | 2 |
| `tools/hmac-generator/HmacGenerator.vue` | 4 |
| `tools/password-strength-analyser/PasswordStrength.vue` | 4 |
| `tools/rsa-key-pair-generator/RsaKeyPair.vue` | 4 |
| `tools/string-obfuscator/StringObfuscator.vue` | 2 |
| `tools/token-generator/TokenGenerator.vue` | 4 |
| `tools/ulid-generator/UlidGenerator.vue` | 1 |
| `tools/uuid-generator/UuidGenerator.vue` | 1 |

## 待替换文案明细

### `tools/bcrypt/BcryptTool.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 29 | attr:title | "Hash" |

### `tools/bip39-generator/Bip39Generator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 37 | attr:title | "Generate Mnemonic" |

### `tools/encryption/EncryptionTool.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 58 | text | "Decrypt" |

### `tools/hash-text/HashText.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 22 | attr:title | "Hash Text" |

### `tools/hmac-generator/HmacGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 39 | attr:placeholder | "Plain text to compute HMAC..." |

### `tools/password-strength-analyser/PasswordStrength.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 35 | text | "Estimated crack time:" |

### `tools/rsa-key-pair-generator/RsaKeyPair.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 43 | text | "Generate Key Pair" |

### `tools/string-obfuscator/StringObfuscator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 22 | attr:placeholder | "String to obfuscate..." |

### `tools/token-generator/TokenGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 30 | attr:label | "Uppercase" |

### `tools/ulid-generator/UlidGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 23 | attr:label | "Quantity" |

### `tools/uuid-generator/UuidGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 23 | attr:label | "Quantity" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/10-crypto.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize crypto tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
