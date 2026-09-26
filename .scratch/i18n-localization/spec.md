# Spec: 工具组件硬编码文案汉化

Status: ready-for-agent
Type: feature
Created: 2026-09-24

## 背景

`apps/web/src/locales/{en,zh}.json` 的键已完全对齐（560 键），且 `zh.json` 的所有值均已中文化，工具元数据（`tools/<name>/index.ts` 的 `name` / `description`）也已全部走 i18n 键。

但**组件模板与脚本中仍存在大量硬编码英文文案**，导致中文界面下出现英文/中英混杂。经全量扫描：

- **196 个文件**含硬编码英文文案，共 **754 处**
- 去重后 **506 条**唯一文案，其中 73 条重复出现
- 209 个工具组件中仅 75 个调用了 `useI18n`
- 重复度最高的文案：`Output...`×41、`Input...`×40、`Download`×21、`Load FFmpeg`×19、`Processing...`×19

## 目标

将 `apps/web/src` 下所有面向用户的硬编码文案提取为 i18n 键，使界面在 `zh` 与 `en` 两种语言下均完整正确显示，无英文残留、无键名泄漏。

## 非目标

- 不汉化 `apps/server` 的 API 错误消息（本轮范围外）
- 不修改 `template/` 下的上游模板项目
- 不改变任何业务逻辑、不重构组件结构
- 不新增 `tools/<name>/index.ts` 的元数据键（已完备）
- 不翻译纯技术性标识符（如 MIME 类型、算法名 `SHA-256`、格式名 `JSON`、示例值 `name: example`）

## 键命名约定

三层结构，**优先复用共享命名空间**（已与用户确认）：

| 层级 | 用途 | 示例 |
| --- | --- | --- |
| `common.*` | 跨无关工具复用的通用 UI 词汇 | `common.input`、`common.preview`、`common.width`、`common.version` |
| `tool.*` | 工具页面外壳/动作类文案 | `tool.copy`（已存在）、`tool.processing`、`tool.loadFfmpeg` |
| `tools.<toolKey>.*` | 仅该工具使用的专属文案 | `tools.base64Encoder.encode`、`tools.slugify.inputPlaceholder` |

规则：

1. 一条文案若已存在于 `common.*` / `tool.*` / `nav.*`，**直接复用，不新建**。
2. 一条文案若在 ≥2 个不相关工具中出现，提取到 `common.*` / `tool.*`。
3. 仅出现在单个工具内的文案，放 `tools.<toolKey>.*`。
4. `<toolKey>` 必须与 `tools/<dir>/index.ts` 中 `name: 'tools.<toolKey>.name'` 的 `toolKey` 一致（已校验 209/209 全部命中）。
5. 占位符用命名插值：`"Delete {count} items?"`，不使用位置参数。
6. 键名用 lowerCamelCase，语义化命名（`inputPlaceholder` 而非 `ph1`）。

## 术语与措辞约定

保持与现有 `zh.json` 一致，避免同词多译：

| English | 中文 |
| --- | --- |
| Input / Output | 输入 / 输出 |
| Preview | 预览 |
| Copy / Copied | 复制 / 已复制 |
| Download | 下载 |
| Upload | 上传 |
| Clear / Reset | 清空 / 重置 |
| Apply | 应用 |
| Settings | 设置 |
| Options | 选项 |
| Results | 结果 |
| Processing... | 处理中... |
| Loading... | 加载中... |
| Invalid … | …无效 / 无效的… |
| Width / Height | 宽度 / 高度 |
| Count | 数量 |
| Prefix / Suffix | 前缀 / 后缀 |
| Positions | 位移 |
| Name / Version | 名称 / 版本 |
| Start / Stop | 开始 / 停止 |
| Encode / Decode | 编码 / 解码 |
| Encrypt / Decrypt | 加密 / 解密 |

专有名词保留英文：`JSON`、`YAML`、`TOML`、`XML`、`CSV`、`TSV`、`HTML`、`SQL`、`QR Code`（写作「二维码」）、`FFmpeg`、`Base64`、`UUID`、`ULID`、`JWT`、`HMAC`、`MIME`、`MAC`、`IP`、`URL`、`DNS`、`RSA`、`AES`、`PDF`、`PNG`、`JPG`、`GIF`、`WebP`、`SVG`、`OCR`、`WiFi`、`Git`、`Regex`、`Docker`。

## 实施方式

**分批并行**：按工具分类分批。每个执行单元（子代理）负责一个互不重叠的文件集合：

1. 修改分配给它的 `.vue` 文件 —— 引入 `useI18n()`、替换硬编码为 `t('…')`
2. 产出**翻译片段文件** `.scratch/i18n-localization/fragments/<batch>.json`，形如：
   ```json
   { "en": { "tools": { "slugify": { "inputPlaceholder": "Enter text to slugify..." } } }, "zh": { … } }
   ```
3. **不直接修改 `en.json` / `zh.json`** —— 避免并行写冲突。由主代理统一合并片段后写入。

**为什么**：`en.json` / `zh.json` 是全部批次的公共写点。让子代理各自写片段、主代理串行合并，可并行推进而不冲突。

## 全局约束

- Vue 3 Composition API；`useI18n()` 只能在组件 `setup()` 内调用，**禁止在 Pinia store 中调用**（见 `docs/superpowers/plans/2026-09-17-m1-design-foundation.md`）
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量不动
- 中文优先：`i18n.ts` 默认 locale 为 `zh`，`fallbackLocale` 为 `en`
- 文案中出现的技术键值（如示例文本 `name: example`）不翻译
- 每批完成后必须通过：`pnpm --filter @toolnest/web type-check`、`lint`、`test`
- 提交遵循 Conventional Commits，每批一次提交

---

## 批次划分（Issues）

| # | 批次 | 文件数 | 硬编码数 | Issue |
| --- | --- | --- | --- | --- |
| 00 | 共享命名空间扩充（`common.*` / `tool.*`） | 2 | — | [issues/00-shared-namespace.md](issues/00-shared-namespace.md) |
| 01 | 应用外壳：页面与公共组件 | 4 | 5 | [issues/01-app-shell.md](issues/01-app-shell.md) |
| 02 | converter 分类 | 23 | 93 | [issues/02-converter.md](issues/02-converter.md) |
| 03 | developer 分类 | 17 | 88 | [issues/03-developer.md](issues/03-developer.md) |
| 04 | video 分类 | 13 | 73 | [issues/04-video.md](issues/04-video.md) |
| 05 | image 分类 | 16 | 68 | [issues/05-image.md](issues/05-image.md) |
| 06 | generator 分类 | 7 | 61 | [issues/06-generator.md](issues/06-generator.md) |
| 07 | text 分类 | 20 | 46 | [issues/07-text.md](issues/07-text.md) |
| 08 | data 分类 | 22 | 46 | [issues/08-data.md](issues/08-data.md) |
| 09 | web 分类 | 9 | 43 | [issues/09-web.md](issues/09-web.md) |
| 10 | crypto 分类 | 11 | 39 | [issues/10-crypto.md](issues/10-crypto.md) |
| 11 | measurement 分类 | 12 | 34 | [issues/11-measurement.md](issues/11-measurement.md) |
| 12 | audio 分类 | 6 | 30 | [issues/12-audio.md](issues/12-audio.md) |
| 13 | pdf 分类 | 11 | 30 | [issues/13-pdf.md](issues/13-pdf.md) |
| 14 | network-test 分类 | 14 | 29 | [issues/14-network-test.md](issues/14-network-test.md) |
| 15 | math 分类 | 6 | 28 | [issues/15-math.md](issues/15-math.md) |
| 16 | network + platform 分类 | 5 | 41 | [issues/16-network-platform.md](issues/16-network-platform.md) |

依赖关系：批次 01–16 均 `Blocked by: 00`（需先有共享键）。批次之间无相互依赖，可并行。

## 验收标准

- [ ] 扫描脚本 `.scratch/i18n-scan.mjs` 在 `apps/web/src` 上报告 0 处硬编码英文文案（豁免项除外）
- [ ] `en.json` 与 `zh.json` 键集合完全一致（无缺失、无多余）
- [ ] `zh.json` 中每个值含中文字符（专有名词与纯占位符除外）
- [ ] `zh.json` 与 `en.json` 无意外相同的值（专有名词白名单除外）
- [ ] `pnpm --filter @toolnest/web type-check` 通过
- [ ] `pnpm --filter @toolnest/web lint` 通过
- [ ] `pnpm --filter @toolnest/web test` 通过
- [ ] 在浏览器中抽查 `zh` / `en` 两语言下各分类工具渲染正确，无键名泄漏

## Comments

- 2026-09-24：扫描基线建立，范围与键命名策略经用户确认（全量前端 196 文件；复用共享命名空间；分批原子提交）。

## 实施结果

### 补充批次（实施期间新发现）

| # | 批次 | 说明 | Issue |
| --- | --- | --- | --- |
| 17 | crontab 语法图示 | `<pre>` 中硬编码的 cron 字段示意图 | [issues/17-crontab-diagram.md](issues/17-crontab-diagram.md) |
| 18 | service 层文案 | 10 个 `.service.ts` + `password-strength-analyser/index.ts` 返回的 UI 可见英文 | [issues/18-service-layer.md](issues/18-service-layer.md) |
| 19 | Naive UI locale | `NConfigProvider` 未绑定 `:locale`，组件库内置文案为英文 | [issues/19-naive-ui-locale.md](issues/19-naive-ui-locale.md) |
| 20 | i18n localStorage 守卫 | service 引入 i18n 后测试环境缺少 localStorage | [issues/20-i18n-localstorage-guard.md](issues/20-i18n-localstorage-guard.md) |

### 数据

- 基线：196 个文件 / 754 处硬编码英文
- 结果：0 个文件 / 0 处（18 处按 spec §非目标 豁免，见 `scan-allowlist.json`）
- locale 键：560 → 1404（en/zh 完全对齐）
- 代码中引用的 i18n 键：934 个，全部可解析（含 service 层 `i18n.global.t`）

### 验收

- [x] 扫描报告 0 处硬编码英文文案（豁免项见 `scan-allowlist.json`）
- [x] `en.json` 与 `zh.json` 键集合完全一致
- [x] `zh.json` 中每个值含中文（专有名词/纯符号白名单除外）
- [x] `pnpm --filter @toolnest/web type-check` 通过
- [x] `pnpm --filter @toolnest/web lint` 无新增错误（错误文件数 97 → 91）
- [x] `pnpm --filter @toolnest/web test` 38/38 通过
- [x] 浏览器实测 zh / en 双语渲染正确：首页、分类、工具页、service 层文案、Naive UI 内置文案、无键名泄漏

### 遗留（明确不在本轮范围）

- 第三方库自身产生的英文消息：`JSON.parse` 语法错误、`DOMParser.parseError.textContent`、
  `sql-formatter`/`@iarna/toml` 等的原生报错
- 服务端 `apps/server` 的 API 错误消息（前端按 code 映射属独立改造）
- 工具标签（`tool.tags`，如 `converter`/`json`）为筛选用的技术标识，按设计不翻译
