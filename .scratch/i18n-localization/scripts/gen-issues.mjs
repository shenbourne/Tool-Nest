import fs from 'node:fs';
import path from 'node:path';

const SRC = 'apps/web/src';
const OUT = '.scratch/i18n-localization';
const scan = fs.readFileSync('.scratch/i18n-localization/baseline-scan.txt', 'utf8');

const re = /^### (.+?) {2}\((\d+)\)\n([\s\S]*?)(?=\n### |\nFILES: |$)/gm;
const blocks = [...scan.matchAll(re)].map((m) => ({
  file: m[1].split(path.sep).join('/'),
  count: Number(m[2]),
  hits: m[3]
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const mm = l.match(/^(.+?):(\d+) {2}\[([a-z:]+)\] {2}(.*)$/);
      return mm ? { line: Number(mm[2]), kind: mm[3], value: mm[4] } : null;
    })
    .filter(Boolean),
}));

const byCat = {};
for (const b of blocks) {
  let cat = '__app__';
  let dir = null;
  const mm = b.file.match(/tools\/([^/]+)\//);
  if (mm) {
    dir = mm[1];
    const s = fs.readFileSync(path.join(SRC, 'tools', dir, 'index.ts'), 'utf8');
    const c = s.match(/category:\s*'([^']+)'/);
    cat = c ? c[1] : 'UNKNOWN';
  }
  (byCat[cat] ||= []).push({ ...b, dir });
}

const batches = [
  { n: '01', slug: 'app-shell', title: '应用外壳：页面与公共组件', keys: ['__app__'] },
  { n: '02', slug: 'converter', title: 'converter 分类', keys: ['converter'] },
  { n: '03', slug: 'developer', title: 'developer 分类', keys: ['developer'] },
  { n: '04', slug: 'video', title: 'video 分类', keys: ['video'] },
  { n: '05', slug: 'image', title: 'image 分类', keys: ['image'] },
  { n: '06', slug: 'generator', title: 'generator 分类', keys: ['generator'] },
  { n: '07', slug: 'text', title: 'text 分类', keys: ['text'] },
  { n: '08', slug: 'data', title: 'data 分类', keys: ['data'] },
  { n: '09', slug: 'web', title: 'web 分类', keys: ['web'] },
  { n: '10', slug: 'crypto', title: 'crypto 分类', keys: ['crypto'] },
  { n: '11', slug: 'measurement', title: 'measurement 分类', keys: ['measurement'] },
  { n: '12', slug: 'audio', title: 'audio 分类', keys: ['audio'] },
  { n: '13', slug: 'pdf', title: 'pdf 分类', keys: ['pdf'] },
  { n: '14', slug: 'network-test', title: 'network-test 分类', keys: ['network-test'] },
  { n: '15', slug: 'math', title: 'math 分类', keys: ['math'] },
  { n: '16', slug: 'network-platform', title: 'network + platform 分类', keys: ['network', 'platform'] },
];

// batch 00 header (hand-written body appended below)
const shared = `# 00 — 共享命名空间扩充

Status: ready-for-agent
Type: task
Blocked by: —

## 目标

在 \`en.json\` / \`zh.json\` 中扩充共享命名空间，使后续各批次的通用文案有键可用，避免重复定义。

## 现状

\`common.*\` 已有：loading, error, retry, close, save, cancel, confirm, back, reset
\`tool.*\` 已有：favorite, unfavorite, copy, copied, clear, download, upload

## 需新增（依据扫描中重复 ≥2 次的文案归纳）

\`\`\`jsonc
// common.*
"input": "Input" / "输入"
"output": "Output" / "输出"
"inputPlaceholder": "Input..." / "输入..."
"outputPlaceholder": "Output..." / "输出..."
"preview": "Preview" / "预览"
"apply": "Apply" / "应用"
"refresh": "Refresh" / "刷新"
"start": "Start" / "开始"
"stop": "Stop" / "停止"
"options": "Options" / "选项"
"results": "Results" / "结果"
"about": "About" / "关于"
"name": "Name" / "名称"
"version": "Version" / "版本"
"width": "Width" / "宽度"
"height": "Height" / "高度"
"count": "Count" / "数量"
"prefix": "Prefix" / "前缀"
"suffix": "Suffix" / "后缀"
"positions": "Positions" / "位移"
"length": "Length" / "长度"
"quantity": "Quantity" / "数量"
"indent": "Indent" / "缩进"
"tolerance": "Tolerance" / "容差"
"background": "Background" / "背景"
"foreground": "Foreground" / "前景"
"lowercase": "Lowercase" / "小写"
"uppercase": "Uppercase" / "大写"
"encode": "Encode" / "编码"
"decode": "Decode" / "解码"
"encrypt": "Encrypt" / "加密"
"decrypt": "Decrypt" / "解密"
"settings": "Settings" / "设置"

// tool.*
"processing": "Processing..." / "处理中..."
"loadFfmpeg": "Load FFmpeg" / "加载 FFmpeg"
\`\`\`

> 该清单为**起点**，执行各批次时若发现其他跨工具重复文案，按 spec 规则追加到 \`common.*\` / \`tool.*\`。

## 约束

- 仅改 \`apps/web/src/locales/{en,zh}.json\`，不改组件
- 键必须同时加入 en 与 zh，且二者键集合保持一致

## Comments
`;

fs.writeFileSync(path.join(OUT, 'issues', '00-shared-namespace.md'), shared);

for (const b of batches) {
  const items = b.keys.flatMap((k) => byCat[k] || []);
  items.sort((a, z) => a.file.localeCompare(z.file));
  const total = items.reduce((s, x) => s + x.count, 0);

  let body = `# ${b.n} — ${b.title}

Status: ready-for-agent
Type: task
Blocked by: 00-shared-namespace

## 范围

${items.length} 个文件 / ${total} 处硬编码。

| 文件 | 处数 |
| --- | ---: |
`;
  for (const it of items) body += `| \`${it.file.replace('apps/web/src/', '')}\` | ${it.count} |\n`;

  body += `\n## 待替换文案明细\n`;
  for (const it of items) {
    body += `\n### \`${it.file.replace('apps/web/src/', '')}\`\n\n`;
    body += '| 行 | 位置 | 原文 |\n| ---: | --- | --- |\n';
    for (const h of it.hits) body += `| ${h.line} | ${h.kind} | ${h.value} |\n`;
  }

  body += `\n## 产出

1. 修改上表所有 \`.vue\` 文件：引入 \`useI18n()\`（若尚未引入），将硬编码替换为 \`t('…')\`
2. 写翻译片段到 \`${OUT}/fragments/${b.n}-${b.slug}.json\`：
   \`\`\`json
   { "en": { "tools": { "<toolKey>": { "<field>": "<English>" } } }, "zh": { "tools": { "<toolKey>": { "<field>": "<中文>" } } } }
   \`\`\`
   **不要**直接编辑 \`locales/en.json\` / \`locales/zh.json\`。
3. 提交：\`feat(i18n): localize ${b.slug} tools\`

## 约束

- 优先复用 \`common.*\` / \`tool.*\` / \`nav.*\` 已有键；仅当文案为该工具专属时才新建 \`tools.<toolKey>.*\`
- 保留 Naive UI 组件、UnoCSS 类名、CSS 变量、业务逻辑不动
- 纯技术键值（MIME 类型、算法名、示例值）不翻译
- 完成后运行 \`pnpm --filter @toolnest/web type-check\` 与 \`lint\`

## Comments
`;
  fs.writeFileSync(path.join(OUT, 'issues', `${b.n}-${b.slug}.md`), body);
}

console.log('issues written');
for (const b of batches) {
  const items = b.keys.flatMap((k) => byCat[k] || []);
  console.log(b.n, b.slug, items.length, 'files', items.reduce((s, x) => s + x.count, 0), 'hits');
}
