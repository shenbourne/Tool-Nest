# 11 — measurement 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

12 个文件 / 34 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/benchmark-builder/BenchmarkBuilder.vue` | 12 |
| `tools/check-leap-years/CheckLeapYears.vue` | 2 |
| `tools/chronometer/Chronometer.vue` | 4 |
| `tools/date-weekday-calculator/DateWeekdayCalculator.vue` | 1 |
| `tools/days-to-hours/DaysToHours.vue` | 2 |
| `tools/discord-timestamp/DiscordTimestamp.vue` | 1 |
| `tools/hours-to-days/HoursToDays.vue` | 2 |
| `tools/seconds-to-time/SecondsToTime.vue` | 2 |
| `tools/time-between-dates/TimeBetweenDates.vue` | 2 |
| `tools/time-to-decimal/TimeToDecimal.vue` | 2 |
| `tools/time-to-seconds/TimeToSeconds.vue` | 2 |
| `tools/truncate-clock-time/TruncateClockTime.vue` | 2 |

## 待替换文案明细

### `tools/benchmark-builder/BenchmarkBuilder.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 111 | text | "+ Add Suite" |

### `tools/check-leap-years/CheckLeapYears.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input..." |

### `tools/chronometer/Chronometer.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 22 | text | "Start" |

### `tools/date-weekday-calculator/DateWeekdayCalculator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "YYYY-MM-DD" |

### `tools/days-to-hours/DaysToHours.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input..." |

### `tools/discord-timestamp/DiscordTimestamp.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 18 | attr:placeholder | "YYYY-MM-DDTHH:mm" |

### `tools/hours-to-days/HoursToDays.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input..." |

### `tools/seconds-to-time/SecondsToTime.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input..." |

### `tools/time-between-dates/TimeBetweenDates.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 22 | attr:placeholder | "Start date/time" |

### `tools/time-to-decimal/TimeToDecimal.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input..." |

### `tools/time-to-seconds/TimeToSeconds.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 17 | attr:placeholder | "Input..." |

### `tools/truncate-clock-time/TruncateClockTime.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 21 | attr:placeholder | "Input..." |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/11-measurement.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize measurement tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
