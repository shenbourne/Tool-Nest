# 09 — web 分类

Status: ready-for-agent
Type: task
Blocked by: 00-shared-namespace

## 范围

9 个文件 / 43 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/html-entities/HtmlEntities.vue` | 3 |
| `tools/html-wysiwyg-editor/HtmlWysiwygEditor.vue` | 4 |
| `tools/http-status/HttpStatus.vue` | 1 |
| `tools/jwt-parser/JwtParser.vue` | 4 |
| `tools/keycode-info/KeycodeInfo.vue` | 4 |
| `tools/slugify/Slugify.vue` | 2 |
| `tools/url-encoder/UrlEncoder.vue` | 5 |
| `tools/url-parser/UrlParser.vue` | 4 |
| `tools/user-agent-parser/UserAgentParser.vue` | 16 |

## 待替换文案明细

### `tools/html-entities/HtmlEntities.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 15 | attr:title | "Input" |

### `tools/html-wysiwyg-editor/HtmlWysiwygEditor.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 67 | text | "Link" |

### `tools/http-status/HttpStatus.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 25 | attr:placeholder | "Search status codes..." |

### `tools/jwt-parser/JwtParser.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 21 | text | "Invalid JWT format" |

### `tools/keycode-info/KeycodeInfo.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 87 | text | "Ctrl" |

### `tools/slugify/Slugify.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 12 | attr:placeholder | "Enter text to slugify..." |

### `tools/url-encoder/UrlEncoder.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:title | "Encode" |

### `tools/url-parser/UrlParser.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 19 | text | "Invalid URL" |

### `tools/user-agent-parser/UserAgentParser.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 29 | attr:title | "User-Agent String" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/09-web.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize web tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments
