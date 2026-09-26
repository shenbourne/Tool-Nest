# 12 — audio 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

6 个文件 / 30 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/audio-change-speed/AudioChangeSpeed.vue` | 5 |
| `tools/audio-converter/AudioConverter.vue` | 5 |
| `tools/audio-extract/AudioExtract.vue` | 5 |
| `tools/audio-loop/AudioLoop.vue` | 5 |
| `tools/audio-merge/AudioMerge.vue` | 4 |
| `tools/audio-trim/AudioTrim.vue` | 6 |

## 待替换文案明细

### `tools/audio-change-speed/AudioChangeSpeed.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 78 | text | "Load FFmpeg" |

### `tools/audio-converter/AudioConverter.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 95 | text | "Load FFmpeg" |

### `tools/audio-extract/AudioExtract.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 90 | text | "Load FFmpeg" |

### `tools/audio-loop/AudioLoop.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 70 | text | "Load FFmpeg" |

### `tools/audio-merge/AudioMerge.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 83 | text | "Load FFmpeg" |

### `tools/audio-trim/AudioTrim.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 71 | text | "Load FFmpeg" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/12-audio.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize audio tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
