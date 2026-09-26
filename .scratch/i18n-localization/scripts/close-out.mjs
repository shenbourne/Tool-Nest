import fs from 'node:fs';

const DIR = '.scratch/i18n-localization';

// 1. mark all batch issues resolved
const issues = fs.readdirSync(`${DIR}/issues`).filter((f) => f.endsWith('.md'));
for (const f of issues) {
  const p = `${DIR}/issues/${f}`;
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('Status: resolved')) continue;
  s = s.replace(/^Status: .+$/m, 'Status: resolved');
  s += `\n- 已完成：批次提交见 \`git log --grep="feat(i18n)"\`；本地化片段 \`${DIR}/fragments/\`。\n`;
  fs.writeFileSync(p, s);
}
console.log(`marked ${issues.length} issue files resolved`);

// 2. add issue files for the extra batches discovered during implementation
const extra = {
  '17-crontab-diagram.md': `# 17 — crontab 语法图示本地化

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 背景

\`CrontabGenerator.vue\` 的 \`<pre>\` 中存在硬编码的多行 cron 字段示意图
（minute / hour / day of month / month / day of week）。标签位于每行行尾，
翻译不会破坏左侧 \`|\` 列对齐。

## 产出

- 新增键 \`tools.crontabGenerator.syntaxDiagram\`（en/zh，含换行）
- \`<pre>\` 改为 \`{{ t('tools.crontabGenerator.syntaxDiagram') }}\`

## Comments
- 已完成。
`,
  '18-service-layer.md': `# 18 — service 层文案本地化

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 背景

组件层本地化完成后，浏览器实测与静态扫描发现**第二层遗漏**：部分
\`.service.ts\` 与 \`password-strength-analyser/index.ts\` 会返回直接渲染到 UI 的
英文字符串（错误提示、结果标签、破解时间、建议列表、时长单位）。

## 方案

service 引入全局 i18n 实例（\`import { i18n } from '@/i18n'\`），调用
\`i18n.global.t(...)\`。当 service 函数在组件 \`computed\` 内被调用时，\`t\` 会读取
locale ref，从而自动建立响应式依赖 —— 切换语言即刷新，无需改动消费侧组件。

模块级常量（\`MASK_PATTERNS\`）在 import 时即求值，无法使用该方案，因此改为暴露
\`labelKey\`，由组件渲染时调用 \`t(labelKey)\`。

## 覆盖范围

\`date-time-converter\`（含 dayjs 相对时间 locale）、\`docker-compose-to-1panel\`、
\`docker-run-to-compose\`、\`email-normalizer\`、\`json-minify\`、\`json-to-csv\`、
\`json-viewer\`、\`regex-tester\`、\`xml-formatter\`、\`info-masking\`、
\`eta-calculator\`（时长单位与 \`toLocaleString\` locale）、\`password-strength-analyser\`。

## 不在范围

第三方库自身产生的消息（\`JSON.parse\` 语法错误、\`DOMParser\` 的
\`parseError.textContent\`）、服务端返回的 API 错误消息。

## Comments
- 已完成；\`verify-keys.mjs\` 已扩展为同时校验 \`t()\` 与 \`i18n.global.t()\`。
`,
  '19-naive-ui-locale.md': `# 19 — 绑定 Naive UI 组件库 locale

Status: resolved
Type: task
Blocked by: —

## 背景

浏览器实测发现 \`/base64-encoder\` 上出现英文 "Please Input"。定位为 Naive UI
内置语言包的默认值（\`locales/common/enUS.mjs\` 的 \`Input.placeholder\`）——
\`NConfigProvider\` 未绑定 \`:locale\`，因此组件库内部文案（输入框占位符、
空数据提示、日期面板等）始终为英文。

## 方案

\`App.vue\` 中按应用 locale 绑定 \`:locale\` 与 \`:date-locale\`：
zh → \`zhCN\` / \`dateZhCN\`，en → \`enUS\` / \`dateEnUS\`。

## Comments
- 已完成；\`/base64-encoder\` 上该占位符现为「请输入」。
`,
  '20-i18n-localstorage-guard.md': `# 20 — i18n 模块 localStorage 守卫

Status: resolved
Type: task
Blocked by: 18-service-layer

## 背景

service 层引入 \`@/i18n\` 后，\`registry.test.ts\`（经工具注册表间接 import 全部
\`index.ts\`）在 node 环境下报 \`ReferenceError: localStorage is not defined\` ——
\`i18n.ts\` 在模块顶层读取 \`localStorage\`。

## 方案

\`i18n.ts\` 增加 \`typeof localStorage === 'undefined'\` 守卫，默认回退 \`zh\`。
同时使该模块在 SSR / 测试等非 DOM 环境下可用。

## Comments
- 已完成；web 测试 38/38 通过。
`,
};
for (const [name, body] of Object.entries(extra)) {
  fs.writeFileSync(`${DIR}/issues/${name}`, body);
}
console.log(`wrote ${Object.keys(extra).length} extra issue files`);

// 3. append implementation result to spec
let spec = fs.readFileSync(`${DIR}/spec.md`, 'utf8');
if (!spec.includes('## 实施结果')) {
  spec += `
## 实施结果

### 补充批次（实施期间新发现）

| # | 批次 | 说明 | Issue |
| --- | --- | --- | --- |
| 17 | crontab 语法图示 | \`<pre>\` 中硬编码的 cron 字段示意图 | [issues/17-crontab-diagram.md](issues/17-crontab-diagram.md) |
| 18 | service 层文案 | 10 个 \`.service.ts\` + \`password-strength-analyser/index.ts\` 返回的 UI 可见英文 | [issues/18-service-layer.md](issues/18-service-layer.md) |
| 19 | Naive UI locale | \`NConfigProvider\` 未绑定 \`:locale\`，组件库内置文案为英文 | [issues/19-naive-ui-locale.md](issues/19-naive-ui-locale.md) |
| 20 | i18n localStorage 守卫 | service 引入 i18n 后测试环境缺少 localStorage | [issues/20-i18n-localstorage-guard.md](issues/20-i18n-localstorage-guard.md) |

### 数据

- 基线：196 个文件 / 754 处硬编码英文
- 结果：0 个文件 / 0 处（18 处按 spec §非目标 豁免，见 \`scan-allowlist.json\`）
- locale 键：560 → 1404（en/zh 完全对齐）
- 代码中引用的 i18n 键：934 个，全部可解析（含 service 层 \`i18n.global.t\`）

### 验收

- [x] 扫描报告 0 处硬编码英文文案（豁免项见 \`scan-allowlist.json\`）
- [x] \`en.json\` 与 \`zh.json\` 键集合完全一致
- [x] \`zh.json\` 中每个值含中文（专有名词/纯符号白名单除外）
- [x] \`pnpm --filter @toolnest/web type-check\` 通过
- [x] \`pnpm --filter @toolnest/web lint\` 无新增错误（错误文件数 97 → 91）
- [x] \`pnpm --filter @toolnest/web test\` 38/38 通过
- [x] 浏览器实测 zh / en 双语渲染正确：首页、分类、工具页、service 层文案、Naive UI 内置文案、无键名泄漏

### 遗留（明确不在本轮范围）

- 第三方库自身产生的英文消息：\`JSON.parse\` 语法错误、\`DOMParser.parseError.textContent\`、
  \`sql-formatter\`/\`@iarna/toml\` 等的原生报错
- 服务端 \`apps/server\` 的 API 错误消息（前端按 code 映射属独立改造）
- 工具标签（\`tool.tags\`，如 \`converter\`/\`json\`）为筛选用的技术标识，按设计不翻译
`;
  fs.writeFileSync(`${DIR}/spec.md`, spec);
  console.log('spec.md updated');
}
