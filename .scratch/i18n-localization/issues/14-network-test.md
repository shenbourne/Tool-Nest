# 14 — network-test 分类

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 范围

14 个文件 / 29 处硬编码。

| 文件 | 处数 |
| --- | ---: |
| `tools/censorship-check/CensorshipCheck.vue` | 3 |
| `tools/connectivity-check/ConnectivityCheck.vue` | 1 |
| `tools/dns-leak-test/DnsLeakTest.vue` | 1 |
| `tools/dns-resolver/DnsResolver.vue` | 2 |
| `tools/global-latency-test/GlobalLatencyTest.vue` | 2 |
| `tools/ip-info/IpInfo.vue` | 1 |
| `tools/mac-lookup/MacLookup.vue` | 3 |
| `tools/mtr-test/MtrTest.vue` | 2 |
| `tools/ping-test/PingTest.vue` | 2 |
| `tools/rule-test/RuleTest.vue` | 3 |
| `tools/service-status/ServiceStatus.vue` | 2 |
| `tools/speed-test/SpeedTest.vue` | 1 |
| `tools/webrtc-detection/WebrtcDetection.vue` | 4 |
| `tools/whois-lookup/WhoisLookup.vue` | 2 |

## 待替换文案明细

### `tools/censorship-check/CensorshipCheck.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 49 | text | "Check" |

### `tools/connectivity-check/ConnectivityCheck.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 30 | text | "Test Connectivity" |

### `tools/dns-leak-test/DnsLeakTest.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 49 | text | "Run Test" |

### `tools/dns-resolver/DnsResolver.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 25 | text | "Resolve" |

### `tools/global-latency-test/GlobalLatencyTest.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 38 | text | "Test Latency" |

### `tools/ip-info/IpInfo.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 37 | text | "Refresh" |

### `tools/mac-lookup/MacLookup.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 27 | text | "Lookup Vendor" |

### `tools/mtr-test/MtrTest.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 38 | text | "Trace" |

### `tools/ping-test/PingTest.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 38 | text | "Ping" |

### `tools/rule-test/RuleTest.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 42 | text | "Test" |

### `tools/service-status/ServiceStatus.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 31 | text | "Check Status" |

### `tools/speed-test/SpeedTest.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | text | "Start Speed Test" |

### `tools/webrtc-detection/WebrtcDetection.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 27 | text | "Detect IPs" |

### `tools/whois-lookup/WhoisLookup.vue`

| 行 | 位置 | 原文 |
| ---: | --- | --- |
| 28 | text | "Whois Lookup" |

## 产出

1. 修改上表所有 `.vue` 文件：引入 `useI18n()`（若尚未引入），将硬编码替换为 `t('…')`
2. 写翻译片段到 `.scratch/i18n-localization/fragments/14-network-test.json`：
   ```json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   ```
   **不要**直接编辑 `locales/en.json` / `locales/zh.json`。
3. 提交：`feat(i18n): localize network-test tools`

## 约束

- 优先复用 `common.*` / `tool.*` / `nav.*` 已有键；仅当文案为该工具专属时才新建 `tools.<toolKey>.*`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 `pnpm --filter @toolnest/web type-check` 与 `lint`

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
