# 16 — network + platform 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

5 个文件 / 41 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/info-masking/InfoMasking.vue` | 12 |
| `tools/ipv4-range-expander/Ipv4RangeExpander.vue` | 9 |
| `tools/ipv4-subnet-calculator/Ipv4SubnetCalculator.vue` | 3 |
| `tools/mac-address-generator/MacAddressGenerator.vue` | 10 |
| `tools/screenshot-share/ScreenshotShare.vue` | 7 |

## 待替换文案明细

### `tools/info-masking/InfoMasking.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 51 | text | "Detected:" |

### `tools/ipv4-range-expander/Ipv4RangeExpander.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 60 | text | "Invalid IPv4 address" |

### `tools/ipv4-subnet-calculator/Ipv4SubnetCalculator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 52 | text | "Invalid IPv4 CIDR address. Use format like 192.168.1.0/24" |

### `tools/mac-address-generator/MacAddressGenerator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 51 | text | "Quantity:" |

### `tools/screenshot-share/ScreenshotShare.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 60 | text | "Capture" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/16-network-platform.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize network-platform tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
