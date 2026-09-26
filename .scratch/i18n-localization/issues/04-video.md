# 04 — video 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

13 个文件 / 73 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/gif-change-speed/GifChangeSpeed.vue` | 5 |
| `tools/images-to-gif/ImagesToGif.vue` | 5 |
| `tools/video-add-audio/VideoAddAudio.vue` | 6 |
| `tools/video-change-speed/VideoChangeSpeed.vue` | 5 |
| `tools/video-compress/VideoCompress.vue` | 5 |
| `tools/video-crop/VideoCrop.vue` | 6 |
| `tools/video-flip/VideoFlip.vue` | 5 |
| `tools/video-loop/VideoLoop.vue` | 5 |
| `tools/video-merge/VideoMerge.vue` | 7 |
| `tools/video-resize/VideoResize.vue` | 7 |
| `tools/video-rotate/VideoRotate.vue` | 5 |
| `tools/video-to-gif/VideoToGif.vue` | 6 |
| `tools/video-trim/VideoTrim.vue` | 6 |

## 待替换文案明细

### `tools/gif-change-speed/GifChangeSpeed.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 77 | text | "Load FFmpeg" |

### `tools/images-to-gif/ImagesToGif.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 83 | text | "Load FFmpeg" |

### `tools/video-add-audio/VideoAddAudio.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 81 | text | "Load FFmpeg" |

### `tools/video-change-speed/VideoChangeSpeed.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 78 | text | "Load FFmpeg" |

### `tools/video-compress/VideoCompress.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 83 | text | "Load FFmpeg" |

### `tools/video-crop/VideoCrop.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 69 | text | "Load FFmpeg" |

### `tools/video-flip/VideoFlip.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 80 | text | "Load FFmpeg" |

### `tools/video-loop/VideoLoop.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 69 | text | "Load FFmpeg" |

### `tools/video-merge/VideoMerge.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 99 | text | "Load FFmpeg" |

### `tools/video-resize/VideoResize.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 80 | text | "Load FFmpeg" |

### `tools/video-rotate/VideoRotate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 86 | text | "Load FFmpeg" |

### `tools/video-to-gif/VideoToGif.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 75 | text | "Load FFmpeg" |

### `tools/video-trim/VideoTrim.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 74 | text | "Load FFmpeg" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/04-video.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize video tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
