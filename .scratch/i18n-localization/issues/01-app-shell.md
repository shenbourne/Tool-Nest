# 01 — 应用外壳：页面与公共组件

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

4 个文件 / 5 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `components/CommandPalette.vue` | 1 |
| `pages/HomePage.vue` | 1 |
| `pages/NotFoundPage.vue` | 2 |
| `pages/ToolPage.vue` | 1 |

## 待替换文案明细

### `components/CommandPalette.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 109 | text | "↑↓ Navigate · Enter Select · Esc Close" |

### `pages/HomePage.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 98 | attr:description | "No tools installed yet" |

### `pages/NotFoundPage.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 13 | text | "Go Home" |

### `pages/ToolPage.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 53 | text | "Loading..." |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/01-app-shell.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize app-shell tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
