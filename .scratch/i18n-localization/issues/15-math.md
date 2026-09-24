# 15 — math 分类

Status: ready-for-agent
Type: task
Blocked by: 00-shared-namespace

## 范围

6 个文件 / 28 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/arithmetic-sequence/ArithmeticSequence.vue` | 3 |
| `tools/eta-calculator/EtaCalculator.vue` | 12 |
| `tools/generic-calculator/GenericCalculator.vue` | 4 |
| `tools/math-evaluator/MathEvaluator.vue` | 3 |
| `tools/number-sum/NumberSum.vue` | 2 |
| `tools/percentage-calc/PercentageCalc.vue` | 4 |

## 待替换文案明细

### `tools/arithmetic-sequence/ArithmeticSequence.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 16 | attr:placeholder | "First term" |

### `tools/eta-calculator/EtaCalculator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 32 | text | "Total Tasks" |

### `tools/generic-calculator/GenericCalculator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 54 | text | "Calculate" |

### `tools/math-evaluator/MathEvaluator.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 81 | text | "+, -, *, /, ^ (power), % (modulo), () (grouping)" |

### `tools/number-sum/NumberSum.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 20 | attr:placeholder | "Input..." |

### `tools/percentage-calc/PercentageCalc.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 18 | text | "% of" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/15-math.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize math tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments
