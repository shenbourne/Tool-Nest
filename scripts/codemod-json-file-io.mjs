import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'apps/web/src/tools';

const FILE_IO_IMPORTS = [
  "import { useFileUpload } from '@/composables/useFileUpload';",
  "import { useFileDownload } from '@/composables/useFileDownload';",
  "import { usePaste } from '@/composables/usePaste';",
].join('\n');

function makeHandlers(config) {
  const { inputExpr, outputExpr, filename } = config;
  return `
const { readAsText } = useFileUpload();
const { downloadText } = useFileDownload();
const { pasteSupported, readClipboardText } = usePaste();
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerFileInput() { fileInputRef.value?.click(); }

async function handleFileInput(event: Event) {
  const el = (event.target as HTMLInputElement);
  const f = el.files?.[0];
  if (!f) return;
  el.value = '';
  try { ${inputExpr} = await readAsText(f); } catch { /* ignore */ }
}

async function doPaste() {
  const text = await readClipboardText();
  if (text !== null) ${inputExpr} = text;
}

function downloadOutput() {
  if (${outputExpr}) downloadText(${outputExpr}, '${filename}');
}
`;
}

function makeToolbar(accept, clearExpr) {
  return `<NSpace align="center" :size="8" style="margin-bottom:8px;">
        <input ref="fileInputRef" type="file" accept="${accept}" style="display:none" @change="handleFileInput"/>
        <NButton size="small" @click="triggerFileInput()">{{ t('tool.importFile') }}</NButton>
        <NButton size="small" :disabled="!pasteSupported" @click="doPaste">{{ t('tool.paste') }}</NButton>
        <NButton size="small" @click="${clearExpr}">{{ t('tool.clear') }}</NButton>
      </NSpace>`;
}

// ── Helpers ──

function insertAfterLine(content, marker, toInsert) {
  const idx = content.indexOf(marker);
  if (idx === -1) throw new Error('Cannot find marker: ' + marker.slice(0, 60));
  const lineEnd = content.indexOf('\n', idx);
  return content.slice(0, lineEnd + 1) + toInsert + '\n' + content.slice(lineEnd + 1);
}

function insertBeforeCloseScript(content, toInsert) {
  return content.replace(/\r?\n<\/script>/, toInsert + '\n</script>');
}

// Find the copy button by its @click attribute and add a download button next to it
function addDownloadAfterCopy(content, copyClickValue, templateTest) {
  // Match the NButton with the specific @click, using [^>]* to stay within the tag
  const regex = new RegExp(
    `(<NButton[^>]*@click="${copyClickValue}"[^>]*>[^<]*\\{\\{[^}]*\\}\\}[^<]*<\\/NButton>)`
  );
  const match = content.match(regex);
  if (!match) throw new Error('Cannot find copy button with @click="' + copyClickValue + '"');

  const copyBtn = match[1];
  const normalized = copyBtn.replace(/\s+/g, ' ').trim();
  const downloadBtn = `<NButton :disabled="!${templateTest}" @click="downloadOutput">{{ t('tool.exportFile') }}</NButton>`;
  const wrapped = `<NSpace :size="8">${normalized} ${downloadBtn}</NSpace>`;

  return content.replace(copyBtn, wrapped);
}

// ════════════════════════════════════════════
// Group A: Standard converter tools (Pattern A)
// ════════════════════════════════════════════

function processGroupA(filePath, config) {
  let c = fs.readFileSync(filePath, 'utf-8');

  c = insertAfterLine(c, "import { useCurrentTool } from '@/composables/useCurrentTool';", FILE_IO_IMPORTS);
  c = insertBeforeCloseScript(c, makeHandlers(config));
  c = c.replace(/(\r?\n      <NCard )/, '\n      ' + makeToolbar(config.accept, config.clearExpr) + '\n      <NCard ');
  c = addDownloadAfterCopy(c, config.copyClickAttr, config.templateTest);

  fs.writeFileSync(filePath, c, 'utf-8');
  console.log('  ok ' + path.basename(filePath));
}

// ════════════════════════════════════════════
// Group C: Compact tools (Pattern C)
// ════════════════════════════════════════════

function processGroupC(filePath, config) {
  let c = fs.readFileSync(filePath, 'utf-8');

  // Add NButton if missing
  if (!c.includes('NButton')) {
    c = c.replace(/import \{ (.*?) \} from 'naive-ui';/, (_, im) => `import { ${im}, NButton } from 'naive-ui';`);
  }

  // Add imports
  const allImports = ["import { useCopy } from '@/composables/useCopy';", FILE_IO_IMPORTS].join('\n');
  c = insertAfterLine(c, "import ToolLayout from '@/layouts/ToolLayout.vue';", allImports);

  // Add setup + handlers after useI18n
  const setup = `
const { copyToClipboard } = useCopy();
${makeHandlers(config)}
function copyOutput() {
  if (${config.outputTest}) copyToClipboard(${config.outputTest});
}
`;
  c = c.replace(/(const \{ t \} = useI18n\(\);)/, `$1${setup}`);

  // Insert toolbar
  if (config.hasSwitch) {
    c = c.replace(/(<NSwitch[^/]*\/NSwitch>\r?\n)/, `$1      ${makeToolbar(config.accept, config.clearExpr)}\n`);
  } else {
    c = c.replace(/(<NCard><NSpace vertical :size="12">\r?\n)/, `$1      ${makeToolbar(config.accept, config.clearExpr)}\n`);
  }

  // Add copy + download buttons before </NSpace></NCard>
  c = c.replace(
    /(<\/NSpace><\/NCard>)/,
    `<NSpace :size="8" style="margin-top:8px;"><NButton :disabled="!${config.templateTest}" @click="copyOutput">{{ t('tool.copy') }}</NButton> <NButton :disabled="!${config.templateTest}" @click="downloadOutput">{{ t('tool.exportFile') }}</NButton></NSpace>\n    </NSpace></NCard>`
  );

  fs.writeFileSync(filePath, c, 'utf-8');
  console.log('  ok ' + path.basename(filePath));
}

// ════════════════════════════════════════════
// Run
// ════════════════════════════════════════════

console.log('Group A...');

processGroupA(path.join(ROOT, 'json-to-yaml/JsonToYaml.vue'), {
  inputExpr: 'input.value', outputExpr: 'output.value', outputTest: 'output.value',
  templateTest: 'output',
  filename: 'output.yaml', accept: '.yaml,.yml', clearExpr: "input = ''", copyClickAttr: 'copyOutput',
});

processGroupA(path.join(ROOT, 'json-to-csv/JsonToCsv.vue'), {
  inputExpr: 'input.value', outputExpr: 'output.value', outputTest: 'output.value',
  templateTest: 'output',
  filename: 'output.csv', accept: '.csv', clearExpr: "input = ''", copyClickAttr: 'copyOutput',
});

processGroupA(path.join(ROOT, 'json-to-xml/JsonToXml.vue'), {
  inputExpr: 'input.value', outputExpr: 'output.value', outputTest: 'output.value',
  templateTest: 'output',
  filename: 'output.xml', accept: '.xml', clearExpr: "input = ''", copyClickAttr: 'copyOutput',
});

processGroupA(path.join(ROOT, 'json-to-toml/JsonToToml.vue'), {
  inputExpr: 'input.value', outputExpr: 'output.value', outputTest: 'output.value',
  templateTest: 'output',
  filename: 'output.toml', accept: '.toml', clearExpr: "input = ''", copyClickAttr: 'copyOutput',
});

// ── JsonMinify ──
console.log('JsonMinify...');
{
  const fp = path.join(ROOT, 'json-minify/JsonMinify.vue');
  let c = fs.readFileSync(fp, 'utf-8');
  c = insertAfterLine(c, "import { useCurrentTool } from '@/composables/useCurrentTool';", FILE_IO_IMPORTS);
  c = insertBeforeCloseScript(c, `
const { readAsText } = useFileUpload();
const { downloadText } = useFileDownload();
const { pasteSupported, readClipboardText } = usePaste();
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerFileInput() { fileInputRef.value?.click(); }

async function handleFileInput(event: Event) {
  const el = (event.target as HTMLInputElement);
  const f = el.files?.[0];
  if (!f) return;
  el.value = '';
  try { inputJson.value = await readAsText(f); } catch { /* ignore */ }
}

async function doPaste() {
  const text = await readClipboardText();
  if (text !== null) inputJson.value = text;
}

function downloadOutput() {
  if (minified.value.result) downloadText(minified.value.result, 'output.json');
}
`);
  c = c.replace(/(\r?\n      <NCard )/, '\n      ' + makeToolbar('.json', "inputJson = ''") + '\n      <NCard ');
  c = addDownloadAfterCopy(c, 'copyOutput', 'minified.result');
  fs.writeFileSync(fp, c, 'utf-8');
  console.log('  ok JsonMinify.vue');
}

// ── JsonViewer ──
console.log('JsonViewer...');
{
  const fp = path.join(ROOT, 'json-viewer/JsonViewer.vue');
  let c = fs.readFileSync(fp, 'utf-8');
  c = insertAfterLine(c, "import { useCurrentTool } from '@/composables/useCurrentTool';", FILE_IO_IMPORTS);
  c = insertBeforeCloseScript(c, `
const { readAsText } = useFileUpload();
const { downloadText } = useFileDownload();
const { pasteSupported, readClipboardText } = usePaste();
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerFileInput() { fileInputRef.value?.click(); }

async function handleFileInput(event: Event) {
  const el = (event.target as HTMLInputElement);
  const f = el.files?.[0];
  if (!f) return;
  el.value = '';
  try { input.value = await readAsText(f); } catch { /* ignore */ }
}

async function doPaste() {
  const text = await readClipboardText();
  if (text !== null) input.value = text;
}

function downloadOutput() {
  if (result.value.formatted) downloadText(result.value.formatted, 'output.json');
}
`);
  // Insert toolbar inside the input NCard
  c = c.replace(
    /(<NCard :title="t\('common\.inputJson'\)">)\r?\n/,
    '$1\n        ' + makeToolbar('.json', "input = ''") + '\n'
  );
  c = addDownloadAfterCopy(c, 'copyOutput', 'result.formatted');
  fs.writeFileSync(fp, c, 'utf-8');
  console.log('  ok JsonViewer.vue');
}

// ── JsonPrettify ──
console.log('JsonPrettify...');
{
  const fp = path.join(ROOT, 'json-prettify/JsonPrettify.vue');
  let c = fs.readFileSync(fp, 'utf-8');
  c = insertAfterLine(c, "import { useCopy } from '@/composables/useCopy';", FILE_IO_IMPORTS);
  c = insertBeforeCloseScript(c, `
const { readAsText } = useFileUpload();
const { downloadText } = useFileDownload();
const { pasteSupported, readClipboardText } = usePaste();
const fileInputRef = ref<HTMLInputElement | null>(null);
function triggerFileInput() { fileInputRef.value?.click(); }

async function handleFileInput(event: Event) {
  const el = (event.target as HTMLInputElement);
  const f = el.files?.[0];
  if (!f) return;
  el.value = '';
  try { input.value = await readAsText(f); } catch { /* ignore */ }
}

async function doPaste() {
  const text = await readClipboardText();
  if (text !== null) input.value = text;
}

function downloadOutput() {
  if (output.value) downloadText(output.value, 'output.json');
}
`);
  // Add Import + Paste buttons before existing Clear button
  c = c.replace(
    /(        <NButton @click="input = ''">)/,
    `        <input ref="fileInputRef" type="file" accept=".json" style="display:none" @change="handleFileInput"/>
        <NButton size="small" @click="triggerFileInput()">{{ t('tool.importFile') }}</NButton>
        <NButton size="small" :disabled="!pasteSupported" @click="doPaste">{{ t('tool.paste') }}</NButton>
$1`
  );
  // Add download after copy button
  const copyMatch = c.match(/<NButton type="primary" @click="copyOutput" :disabled="!output">\{\{ t\('tool\.copy'\) \}\}<\/NButton>/);
  if (copyMatch) {
    c = c.replace(copyMatch[0], copyMatch[0] + '\n        <NButton @click="downloadOutput" :disabled="!output">{{ t(\'tool.exportFile\') }}</NButton>');
  }
  fs.writeFileSync(fp, c, 'utf-8');
  console.log('  ok JsonPrettify.vue');
}

// ── Group C: Compact tools ──
console.log('Group C...');

processGroupC(path.join(ROOT, 'json-sort/JsonSort.vue'), {
  inputExpr: 'input.value', outputExpr: 'output.value', outputTest: 'output.value',
  templateTest: 'output',
  filename: 'output.json', accept: '.json', clearExpr: "input = ''",
});

processGroupC(path.join(ROOT, 'json-stringify/JsonStringify.vue'), {
  inputExpr: 'input.value', outputExpr: 'output.value', outputTest: 'output.value',
  templateTest: 'output',
  filename: 'output.json', accept: '.json', clearExpr: "input = ''",
});

processGroupC(path.join(ROOT, 'json-validate/JsonValidate.vue'), {
  inputExpr: 'input.value', outputExpr: 'output.value', outputTest: 'output.value',
  templateTest: 'output',
  filename: 'output.json', accept: '.json', clearExpr: "input = ''",
});

processGroupC(path.join(ROOT, 'json-escape/JsonEscape.vue'), {
  inputExpr: 'input.value', outputExpr: 'output.value', outputTest: 'output.value',
  templateTest: 'output',
  filename: 'output.json', accept: '.json', clearExpr: "input = ''", hasSwitch: true,
});

// ── JsonDiff ──
console.log('JsonDiff...');
{
  const fp = path.join(ROOT, 'json-diff/JsonDiff.vue');
  let c = fs.readFileSync(fp, 'utf-8');
  c = insertAfterLine(c, "import ToolLayout from '@/layouts/ToolLayout.vue';", FILE_IO_IMPORTS);
  c = c.replace(/(const \{ t \} = useI18n\(\);)/, `$1
const { readAsText } = useFileUpload();
const { downloadText } = useFileDownload();
const { pasteSupported, readClipboardText } = usePaste();
const leftFileInputRef = ref<HTMLInputElement | null>(null);
const rightFileInputRef = ref<HTMLInputElement | null>(null);
function triggerLeftFile() { leftFileInputRef.value?.click(); }
function triggerRightFile() { rightFileInputRef.value?.click(); }

async function handleLeftFile(event: Event) {
  const el = (event.target as HTMLInputElement);
  const f = el.files?.[0];
  if (!f) return;
  el.value = '';
  try { leftJson.value = await readAsText(f); } catch { /* ignore */ }
}

async function handleRightFile(event: Event) {
  const el = (event.target as HTMLInputElement);
  const f = el.files?.[0];
  if (!f) return;
  el.value = '';
  try { rightJson.value = await readAsText(f); } catch { /* ignore */ }
}

async function doPasteLeft() {
  const text = await readClipboardText();
  if (text !== null) leftJson.value = text;
}

async function doPasteRight() {
  const text = await readClipboardText();
  if (text !== null) rightJson.value = text;
}

function downloadResult() {
  if (!diffResult.value.length) return;
  const lines = diffResult.value.map(d => {
    const parts = [d.type + ': ' + d.path];
    if (d.type !== 'added') parts.push('was: ' + JSON.stringify(d.oldValue));
    if (d.type !== 'removed') parts.push('now: ' + JSON.stringify(d.newValue));
    return parts.join(' | ');
  });
  downloadText(lines.join('\\n'), 'diff-result.txt');
}
`);

  // Add toolbar above flex div
  c = c.replace(
    /(<div style="display:flex;gap:12px;">)/,
    `<NSpace align="center" :size="8" style="margin-bottom:8px;">
        <NButton size="small" @click="leftJson = ''; rightJson = ''">{{ t('tool.clear') }}</NButton>
        <NButton size="small" :disabled="!diffResult.length" @click="downloadResult">{{ t('tool.exportFile') }}</NButton>
      </NSpace>
      $1`
  );

  // Add import/paste inside left card (NCard and NInput are on same line)
  c = c.replace(
    /(<NCard :title="t\('tools\.jsonDiff\.leftJson'\)" style="flex:1;">)(<NInput)/,
    `$1
        <NSpace align="center" :size="8" style="margin-bottom:8px;">
          <input ref="leftFileInputRef" type="file" accept=".json" style="display:none" @change="handleLeftFile"/>
          <NButton size="small" @click="triggerLeftFile()">{{ t('tool.importFile') }}</NButton>
          <NButton size="small" :disabled="!pasteSupported" @click="doPasteLeft">{{ t('tool.paste') }}</NButton>
        </NSpace>
        $2`
  );

  // Add import/paste inside right card
  c = c.replace(
    /(<NCard :title="t\('tools\.jsonDiff\.rightJson'\)" style="flex:1;">)(<NInput)/,
    `$1
        <NSpace align="center" :size="8" style="margin-bottom:8px;">
          <input ref="rightFileInputRef" type="file" accept=".json" style="display:none" @change="handleRightFile"/>
          <NButton size="small" @click="triggerRightFile()">{{ t('tool.importFile') }}</NButton>
          <NButton size="small" :disabled="!pasteSupported" @click="doPasteRight">{{ t('tool.paste') }}</NButton>
        </NSpace>
        $2`
  );

  fs.writeFileSync(fp, c, 'utf-8');
  console.log('  ok JsonDiff.vue');
}

console.log('\nAll 12 JSON tools done.');
