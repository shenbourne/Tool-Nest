# 05 — image 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

16 个文件 / 68 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/camera-recorder/CameraRecorder.vue` | 13 |
| `tools/convert-to-jpg/ConvertToJpg.vue` | 2 |
| `tools/convert-to-webp/ConvertToWebp.vue` | 2 |
| `tools/image-change-colors/ImageChangeColors.vue` | 4 |
| `tools/image-change-opacity/ImageChangeOpacity.vue` | 2 |
| `tools/image-compress/ImageCompress.vue` | 3 |
| `tools/image-create-transparent/ImageCreateTransparent.vue` | 3 |
| `tools/image-crop/ImageCrop.vue` | 3 |
| `tools/image-editor/ImageEditor.vue` | 10 |
| `tools/image-flip/ImageFlip.vue` | 4 |
| `tools/image-remove-background/ImageRemoveBackground.vue` | 3 |
| `tools/image-resize/ImageResize.vue` | 4 |
| `tools/image-rotate/ImageRotate.vue` | 3 |
| `tools/image-split/ImageSplit.vue` | 6 |
| `tools/image-to-text-ocr/ImageToTextOcr.vue` | 3 |
| `tools/image-watermark/ImageWatermark.vue` | 3 |

## 待替换文案明细

### `tools/camera-recorder/CameraRecorder.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 152 | text | "Your browser does not support camera recording. Please use a modern browser with WebRTC support." |

### `tools/convert-to-jpg/ConvertToJpg.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 31 | text | "Convert to JPG" |

### `tools/convert-to-webp/ConvertToWebp.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 29 | text | "Convert to WebP" |

### `tools/image-change-colors/ImageChangeColors.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 74 | text | "Hue Rotate (0-360):" |

### `tools/image-change-opacity/ImageChangeOpacity.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 33 | text | "Apply" |

### `tools/image-compress/ImageCompress.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 36 | text | "Compress" |

### `tools/image-create-transparent/ImageCreateTransparent.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 97 | text | "Target Color:" |

### `tools/image-crop/ImageCrop.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 206 | text | "Width:" |

### `tools/image-editor/ImageEditor.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 242 | text | "Add Text" |

### `tools/image-flip/ImageFlip.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 33 | text | "Horizontal" |

### `tools/image-remove-background/ImageRemoveBackground.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 142 | text | "Background Color:" |

### `tools/image-resize/ImageResize.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 32 | text | "Resize" |

### `tools/image-rotate/ImageRotate.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 37 | text | "Rotate" |

### `tools/image-split/ImageSplit.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 83 | text | "Rows (1-10):" |

### `tools/image-to-text-ocr/ImageToTextOcr.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 83 | text | "Extract Text" |

### `tools/image-watermark/ImageWatermark.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 38 | text | "Add Watermark" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/05-image.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize image tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
