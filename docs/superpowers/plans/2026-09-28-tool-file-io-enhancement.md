# Tool File I/O Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add file import (upload/paste/drag-drop), file export (download), and clipboard paste to all text/data-format tools that currently only have textarea input.

**Architecture:** Create three shared composables (`useFileUpload`, `useFileDownload`, `usePaste`) in `apps/web/src/composables/`, add common i18n keys, then apply via codemod to ~100 tools grouped by category. Each tool gets a toolbar row above its input textarea (Import File / Paste / Clear) and a toolbar row below its output textarea (Download / Copy).

**Tech Stack:** Vue 3 Composition API, TypeScript, naive-ui (NButton, NUpload, NIcon), vue-i18n

**Spec:** `.scratch/tool-interaction-audit/findings.md` (file I/O gap analysis)

## Global Constraints

- Conventional Commits format: `feat(file-io): ...`
- One commit per atomic change
- i18n keys must be added to BOTH `en.json` and `zh.json`
- Follow existing patterns: `useCopy` composable, `NButton` + `NSpace` toolbar layout
- No new dependencies
- All tools use `ToolLayout` wrapper
- `input-props="{ id: 'xxxFieldN' }"` a11y pattern must be preserved on all inputs

---

## File Structure

### New files
- `apps/web/src/composables/useFileUpload.ts` — File upload composable (programmatic file picker, drag-drop, FileReader)
- `apps/web/src/composables/useFileDownload.ts` — File download composable (blob, text, data URL)
- `apps/web/src/composables/usePaste.ts` — Clipboard paste composable (read text from clipboard)
- `apps/web/src/composables/__tests__/useFileUpload.test.ts`
- `apps/web/src/composables/__tests__/useFileDownload.test.ts`
- `apps/web/src/composables/__tests__/usePaste.test.ts`

### Modified files
- `apps/web/src/locales/en.json` — Add common file I/O keys
- `apps/web/src/locales/zh.json` — Add common file I/O keys
- ~100 tool `.vue` files (listed per task below)

---

### Task 1: Create shared `useFileDownload` composable

**Files:**
- Create: `apps/web/src/composables/useFileDownload.ts`
- Test: `apps/web/src/composables/__tests__/useFileDownload.test.ts`

**Rationale:** ~30 tools currently re-implement `downloadBlob()` with identical code. Centralizing eliminates duplication and gives text-format tools a download capability.

**Interface:**
```ts
export function useFileDownload() {
  function downloadBlob(data: Uint8Array | Blob, filename: string, mimeType?: string): void
  function downloadText(text: string, filename: string, mimeType?: string): void
  function downloadDataUrl(dataUrl: string, filename: string): void
}
```

- [ ] **Step 1: Write tests**

```ts
// apps/web/src/composables/__tests__/useFileDownload.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFileDownload } from '../useFileDownload';

describe('useFileDownload', () => {
  let mockAnchor: HTMLAnchorElement;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    mockAnchor = {
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it('downloadText creates a blob link and clicks it', () => {
    const { downloadText } = useFileDownload();
    downloadText('hello', 'test.txt', 'text/plain');
    expect(mockAnchor.download).toBe('test.txt');
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('downloadBlob sets href from object URL', () => {
    const { downloadBlob } = useFileDownload();
    const data = new Uint8Array([1, 2, 3]);
    downloadBlob(data, 'out.bin', 'application/octet-stream');
    expect(mockAnchor.download).toBe('out.bin');
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('downloadDataUrl uses data URL directly as href', () => {
    const { downloadDataUrl } = useFileDownload();
    downloadDataUrl('data:text/plain,hello', 'test.txt');
    expect(mockAnchor.href).toBe('data:text/plain,hello');
    expect(mockAnchor.download).toBe('test.txt');
    expect(clickSpy).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/web && npx vitest run src/composables/__tests__/useFileDownload.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```ts
// apps/web/src/composables/useFileDownload.ts
/**
 * Shared file-download helpers. Many tools previously re-implemented the same
 * anchor-click dance; this gives every tool a single, tested entry point.
 */
export function useFileDownload() {
  function downloadBlob(data: Uint8Array | Blob, filename: string, mimeType?: string): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
    URL.revokeObjectURL(url);
  }

  function downloadText(text: string, filename: string, mimeType = 'text/plain'): void {
    const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
    URL.revokeObjectURL(url);
  }

  function downloadDataUrl(dataUrl: string, filename: string): void {
    triggerDownload(dataUrl, filename);
  }

  function triggerDownload(href: string, filename: string): void {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return { downloadBlob, downloadText, downloadDataUrl };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && npx vitest run src/composables/__tests__/useFileDownload.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/composables/useFileDownload.ts apps/web/src/composables/__tests__/useFileDownload.test.ts
git commit -m "feat(file-io): add useFileDownload composable with blob/text/dataUrl helpers"
```

---

### Task 2: Create shared `useFileUpload` composable

**Files:**
- Create: `apps/web/src/composables/useFileUpload.ts`
- Test: `apps/web/src/composables/__tests__/useFileUpload.test.ts`

**Interface:**
```ts
export function useFileUpload(options?: { accept?: string; multiple?: boolean }) {
  const file = ref<File | null>(null);
  const files = ref<File[]>([]);
  function openFileDialog(): void  // triggers hidden <input type="file">
  function onFileInput(event: Event): void  // for <input @change>
  function readAsText(f: File): Promise<string>
  function readAsDataURL(f: File): Promise<string>
  function readAsArrayBuffer(f: File): Promise<ArrayBuffer>
  return { file, files, openFileDialog, onFileInput, readAsText, readAsDataURL, readAsArrayBuffer }
}
```

- [ ] **Step 1: Write tests**

```ts
// apps/web/src/composables/__tests__/useFileUpload.test.ts
import { describe, it, expect, vi } from 'vitest';
import { useFileUpload } from '../useFileUpload';

describe('useFileUpload', () => {
  it('readAsText resolves with file contents', async () => {
    const { readAsText } = useFileUpload();
    const mockFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const text = await readAsText(mockFile);
    expect(text).toBe('hello world');
  });

  it('readAsDataURL resolves with data URL prefix', async () => {
    const { readAsDataURL } = useFileUpload();
    const mockFile = new File(['data'], 'test.bin', { type: 'application/octet-stream' });
    const url = await readAsDataURL(mockFile);
    expect(url).toMatch(/^data:application\/octet-stream;base64,/);
  });

  it('readAsArrayBuffer resolves with buffer', async () => {
    const { readAsArrayBuffer } = useFileUpload();
    const mockFile = new File([new Uint8Array([1, 2, 3])], 'test.bin');
    const buf = await readAsArrayBuffer(mockFile);
    expect(new Uint8Array(buf)).toEqual(new Uint8Array([1, 2, 3]));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/web && npx vitest run src/composables/__tests__/useFileUpload.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```ts
// apps/web/src/composables/useFileUpload.ts
import { ref } from 'vue';

/**
 * Shared file-upload helpers. Wraps the hidden-<input> pattern and provides
 * typed FileReader promises so tools don't each re-implement the callback dance.
 */
export function useFileUpload(_options?: { accept?: string; multiple?: boolean }) {
  const file = ref<File | null>(null);
  const files = ref<File[]>([]);

  function readAsText(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(f);
    });
  }

  function readAsDataURL(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(f);
    });
  }

  function readAsArrayBuffer(f: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(f);
    });
  }

  function onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files;
    if (!selected || selected.length === 0) {
      file.value = null;
      files.value = [];
      return;
    }
    file.value = selected[0];
    files.value = Array.from(selected);
    input.value = ''; // reset so the same file can be re-selected
  }

  return { file, files, onFileInput, readAsText, readAsDataURL, readAsArrayBuffer };
}
```

Note: `openFileDialog()` is NOT in the composable — each tool renders its own `<input type="file" ref="fileInput">` and calls `.click()` on it, because the input element needs to live in the template for accessibility (screen readers need a focusable element). The composable provides `onFileInput` and the FileReader helpers.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && npx vitest run src/composables/__tests__/useFileUpload.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/composables/useFileUpload.ts apps/web/src/composables/__tests__/useFileUpload.test.ts
git commit -m "feat(file-io): add useFileUpload composable with FileReader helpers"
```

---

### Task 3: Create shared `usePaste` composable

**Files:**
- Create: `apps/web/src/composables/usePaste.ts`
- Test: `apps/web/src/composables/__tests__/usePaste.test.ts`

**Interface:**
```ts
export function usePaste() {
  const pasteSupported = ref<boolean>(true);
  async function readClipboardText(): Promise<string | null>
  return { pasteSupported, readClipboardText }
}
```

- [ ] **Step 1: Write tests**

```ts
// apps/web/src/composables/__tests__/usePaste.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePaste } from '../usePaste';

describe('usePaste', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn().mockResolvedValue('pasted text'),
      },
    });
  });

  afterEach(() => { vi.unstubAllGlobals(); });

  it('readClipboardText returns clipboard content', async () => {
    const { readClipboardText } = usePaste();
    const text = await readClipboardText();
    expect(text).toBe('pasted text');
  });

  it('readClipboardText returns null when clipboard API unavailable', async () => {
    vi.stubGlobal('navigator', {});
    const { readClipboardText } = usePaste();
    const text = await readClipboardText();
    expect(text).toBeNull();
  });

  it('readClipboardText returns null on read failure', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { readText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    const { readClipboardText } = usePaste();
    const text = await readClipboardText();
    expect(text).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/web && npx vitest run src/composables/__tests__/usePaste.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```ts
// apps/web/src/composables/usePaste.ts
import { ref } from 'vue';

/**
 * Clipboard-read helper. navigator.clipboard.readText() only works in secure
 * contexts and requires user gesture + permission; callers get null on any
 * failure path so they can show an inline error rather than hanging.
 */
export function usePaste() {
  const pasteSupported = ref(
    typeof navigator !== 'undefined' && !!navigator.clipboard?.readText,
  );

  async function readClipboardText(): Promise<string | null> {
    if (!navigator.clipboard?.readText) return null;
    try {
      return await navigator.clipboard.readText();
    } catch {
      return null;
    }
  }

  return { pasteSupported, readClipboardText };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && npx vitest run src/composables/__tests__/usePaste.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/composables/usePaste.ts apps/web/src/composables/__tests__/usePaste.test.ts
git commit -m "feat(file-io): add usePaste composable for clipboard text reading"
```

---

### Task 4: Add common i18n keys for file I/O

**Files:**
- Modify: `apps/web/src/locales/en.json`
- Modify: `apps/web/src/locales/zh.json`

Add these keys under `"tool"`:
```json
"importFile": "Import File",
"paste": "Paste",
"pasteFromClipboard": "Paste from clipboard",
"pasteFailed": "Failed to read clipboard",
"clear": "Clear",
"exportFile": "Export File",
"dragDropHint": "Or drag & drop a file here"
```

And under `"common"`:
```json
"fileInput": "File input",
"noFileSelected": "No file selected"
```

- [ ] **Step 1: Add keys to en.json**

Insert after `"upload": "Upload",` in the `"tool"` section:
```
"importFile": "Import File",
"paste": "Paste",
"pasteFromClipboard": "Paste from clipboard",
"pasteFailed": "Failed to read clipboard",
"exportFile": "Export File",
"dragDropHint": "Or drag & drop a file here"
```

Insert in `"common"` section:
```
"fileInput": "File input",
"noFileSelected": "No file selected"
```

- [ ] **Step 2: Add keys to zh.json**

Insert after `"upload": "上传",` in the `"tool"` section:
```
"importFile": "导入文件",
"paste": "粘贴",
"pasteFromClipboard": "从剪贴板粘贴",
"pasteFailed": "读取剪贴板失败",
"exportFile": "导出文件",
"dragDropHint": "或拖放文件到此处"
```

Insert in `"common"` section:
```
"fileInput": "文件输入",
"noFileSelected": "未选择文件"
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/locales/en.json apps/web/src/locales/zh.json
git commit -m "feat(file-io): add common i18n keys for import/paste/export/drag-drop"
```

---

### Task 5: Apply file I/O to JSON tools (12 tools)

**Tools:** json-prettify, json-minify, json-to-yaml, json-to-csv, json-to-xml, json-to-toml, json-viewer, json-sort, json-stringify, json-validate, json-escape, json-diff

**Pattern for each tool:** Add import file button + paste button above input textarea, add download button next to copy button below output textarea.

**Example transformation** (using `json-to-yaml` as the template):

Before:
```vue
<NCard :title="t('tools.jsonToYaml.input')">
  <NSpace vertical :size="12">
    <NInput v-model:value="input" type="textarea" :rows="10" placeholder='{ "name": "example" }' :input-props="{ id: 'jsonToYamlField0' }"/>
  </NSpace>
</NCard>
```

After:
```vue
<NCard :title="t('tools.jsonToYaml.input')">
  <NSpace vertical :size="12">
    <NSpace :size="8">
      <input ref="fileInput" type="file" accept=".json,application/json" style="display:none" @change="onFileInput" :aria-label="t('common.fileInput')" />
      <NButton size="small" @click="$refs.fileInput.click()">{{ t('tool.importFile') }}</NButton>
      <NButton size="small" :disabled="!pasteSupported" @click="doPaste">{{ t('tool.paste') }}</NButton>
      <NButton size="small" quaternary @click="input = ''">{{ t('tool.clear') }}</NButton>
    </NSpace>
    <NInput v-model:value="input" type="textarea" :rows="10" placeholder='{ "name": "example" }' :input-props="{ id: 'jsonToYamlField0' }"/>
  </NSpace>
</NCard>
```

Output card gets download button:
```vue
<NButton :disabled="!output" @click="copyOutput">{{ t('tool.copy') }}</NButton>
<NButton :disabled="!output" @click="downloadOutput">{{ t('tool.exportFile') }}</NButton>
```

Script additions per tool:
```ts
import { useFileUpload } from '@/composables/useFileUpload';
import { useFileDownload } from '@/composables/useFileDownload';
import { usePaste } from '@/composables/usePaste';

const { onFileInput, readAsText } = useFileUpload();
const { downloadText } = useFileDownload();
const { pasteSupported, readClipboardText } = usePaste();

async function handleFileImport(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (!f) return;
  input.value = '';
  textInput.value = await readAsText(f);
}

async function doPaste() {
  const text = await readClipboardText();
  if (text !== null) textInput.value = text;
  else message.error(t('tool.pasteFailed'));
}

function downloadOutput() {
  if (output.value) downloadText(output.value, 'output.<ext>', 'text/plain');
}
```

- [ ] **Step 1: Apply to all 12 JSON tools**

For each tool, add:
1. Import `useFileUpload`, `useFileDownload`, `usePaste`
2. Add hidden `<input type="file">` + toolbar buttons above input textarea
3. Add `handleFileImport`, `doPaste`, `downloadOutput` functions
4. Add download button next to copy button in output card

File extensions for download filenames:
- json-prettify → `.json`
- json-minify → `.json`
- json-to-yaml → `.yaml`
- json-to-csv → `.csv`
- json-to-xml → `.xml`
- json-to-toml → `.toml`
- json-viewer → `.json`
- json-sort → `.json`
- json-stringify → `.json`
- json-validate → no output (skip download)
- json-escape → `.txt`
- json-diff → `.txt` (two inputs, one output)

- [ ] **Step 2: Run type-check**

Run: `cd apps/web && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Run tests**

Run: `cd apps/web && npx vitest run`
Expected: PASS (no regressions)

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/locales/ apps/web/src/tools/json-*/ apps/web/src/tools/json-diff/
git commit -m "feat(file-io): add import/paste/export to all JSON tools"
```

---

### Task 6: Apply file I/O to YAML tools (3 tools)

**Tools:** yaml-to-json, yaml-to-toml, yaml-viewer

Same pattern as Task 5. File accept: `.yaml,.yml`. Download extensions: `.json`, `.toml`, `.yaml`.

- [ ] **Step 1: Apply to all 3 YAML tools**
- [ ] **Step 2: Run type-check**
- [ ] **Step 3: Commit**

```bash
git add apps/web/src/tools/yaml-*/
git commit -m "feat(file-io): add import/paste/export to YAML tools"
```

---

### Task 7: Apply file I/O to CSV tools (10 tools)

**Tools:** csv-to-json, csv-to-tsv, csv-to-xml, csv-to-yaml, csv-change-separator, csv-find-incomplete, csv-insert-columns, csv-rows-to-columns, csv-swap-columns, csv-transpose

These are the worst offenders — zero file I/O currently. Same pattern. File accept: `.csv,text/csv`. Note: most CSV tools lack copy button too — add copy + download to output.

- [ ] **Step 1: Apply to all 10 CSV tools**
- [ ] **Step 2: Run type-check**
- [ ] **Step 3: Commit**

```bash
git add apps/web/src/tools/csv-*/
git commit -m "feat(file-io): add import/paste/copy/export to all CSV tools"
```

---

### Task 8: Apply file I/O to XML/TOML/SQL/HTML/Base64/Docker tools (10 tools)

**Tools:** xml-to-json, xml-formatter, xml-validator, toml-to-json, toml-to-yaml, sql-prettify, markdown-to-html, html-entities, html-wysiwyg-editor, base64-encoder, tsv-to-json, docker-run-to-compose, docker-compose-to-1panel, jwt-parser

- [ ] **Step 1: Apply to all tools**
- [ ] **Step 2: Run type-check**
- [ ] **Step 3: Commit**

```bash
git add apps/web/src/tools/xml-*/ apps/web/src/tools/toml-*/ apps/web/src/tools/sql-*/ apps/web/src/tools/markdown-to-html/ apps/web/src/tools/html-entities/ apps/web/src/tools/html-wysiwyg-editor/ apps/web/src/tools/base64-encoder/ apps/web/src/tools/tsv-to-json/ apps/web/src/tools/docker-*/ apps/web/src/tools/jwt-parser/
git commit -m "feat(file-io): add import/paste/export to XML/TOML/SQL/HTML/Base64/Docker tools"
```

---

### Task 9: Apply file I/O to text manipulation tools (20+ tools)

**Tools:** case-converter, email-normalizer, encryption, hash-text, hmac-generator, info-masking, list-converter, text-to-binary, text-to-nato-alphabet, text-to-unicode, url-encoder, rot13, text-diff, regex-tester, text-censor, text-join, text-repeat, text-replacer, text-reverse, text-rotate, text-split, text-statistics, text-truncate, remove-duplicate-lines, extract-substring, hidden-char-detector, palindrome-checker, create-palindrome, number-sum, email-extractor

For single-input tools: add import/paste/clear toolbar + copy/download on output.
For dual-input tools (text-diff): add import/paste for each input.

- [ ] **Step 1: Apply to all text tools**
- [ ] **Step 2: Run type-check**
- [ ] **Step 3: Commit**

```bash
git add apps/web/src/tools/case-converter/ apps/web/src/tools/email-normalizer/ apps/web/src/tools/encryption/ apps/web/src/tools/hash-text/ apps/web/src/tools/hmac-generator/ apps/web/src/tools/info-masking/ apps/web/src/tools/list-converter/ apps/web/src/tools/text-to-binary/ apps/web/src/tools/text-to-nato-alphabet/ apps/web/src/tools/text-to-unicode/ apps/web/src/tools/url-encoder/ apps/web/src/tools/rot13/ apps/web/src/tools/text-diff/ apps/web/src/tools/regex-tester/ apps/web/src/tools/text-censor/ apps/web/src/tools/text-join/ apps/web/src/tools/text-repeat/ apps/web/src/tools/text-replacer/ apps/web/src/tools/text-reverse/ apps/web/src/tools/text-rotate/ apps/web/src/tools/text-split/ apps/web/src/tools/text-statistics/ apps/web/src/tools/text-truncate/ apps/web/src/tools/remove-duplicate-lines/ apps/web/src/tools/extract-substring/ apps/web/src/tools/hidden-char-detector/ apps/web/src/tools/palindrome-checker/ apps/web/src/tools/create-palindrome/ apps/web/src/tools/number-sum/ apps/web/src/tools/email-extractor/
git commit -m "feat(file-io): add import/paste/copy/export to text manipulation tools"
```

---

### Task 10: Apply file I/O to list manipulation tools (12 tools)

**Tools:** list-duplicate, list-find-popular, list-find-unique, list-group, list-reverse, list-rotate, list-shuffle, list-sort, list-truncate, list-unwrap, list-wrap

(list-converter already handled in Task 9)

- [ ] **Step 1: Apply to all 12 list tools**
- [ ] **Step 2: Run type-check**
- [ ] **Step 3: Commit**

```bash
git add apps/web/src/tools/list-*/
git commit -m "feat(file-io): add import/paste/copy/export to list manipulation tools"
```

---

### Task 11: Add paste support to image/media tools

**Tools that accept images and could benefit from paste:** convert-to-jpg, convert-to-webp, convert-to-pdf, image-compress, image-flip, image-rotate, image-resize, image-change-opacity, image-watermark, image-change-colors, image-create-transparent, image-crop, image-remove-background, image-editor

For these tools, add a "Paste Image" button that reads clipboard for image data. This is more complex — `navigator.clipboard.read()` returns ClipboardItem array, need to check for image types.

- [ ] **Step 1: Extend `usePaste` with `readClipboardImage()` method**

```ts
async function readClipboardImage(): Promise<File | null> {
  if (!navigator.clipboard?.read) return null;
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          return new File([blob], 'pasted-image', { type });
        }
      }
    }
  } catch { /* permission denied or unsupported */ }
  return null;
}
```

- [ ] **Step 2: Add paste button to image tools**

For each image tool, add a "Paste" button next to the upload area that calls `readClipboardImage()` and sets `file.value`.

- [ ] **Step 3: Run type-check**
- [ ] **Step 4: Commit**

```bash
git add apps/web/src/composables/usePaste.ts apps/web/src/tools/convert-to-jpg/ apps/web/src/tools/convert-to-webp/ apps/web/src/tools/convert-to-pdf/ apps/web/src/tools/image-compress/ apps/web/src/tools/image-flip/ apps/web/src/tools/image-rotate/ apps/web/src/tools/image-resize/ apps/web/src/tools/image-change-opacity/ apps/web/src/tools/image-watermark/ apps/web/src/tools/image-change-colors/ apps/web/src/tools/image-create-transparent/ apps/web/src/tools/image-crop/ apps/web/src/tools/image-remove-background/ apps/web/src/tools/image-editor/
git commit -m "feat(file-io): add paste-from-clipboard to image tools"
```

---

### Task 12: Final verification

- [ ] **Step 1: Run full type-check**

Run: `cd apps/web && npx vue-tsc --noEmit`

- [ ] **Step 2: Run full test suite**

Run: `cd apps/web && npx vitest run`

- [ ] **Step 3: Run lint**

Run: `cd apps/web && npx eslint src/composables/useFileUpload.ts src/composables/useFileDownload.ts src/composables/usePaste.ts`

- [ ] **Step 4: Dev server smoke test**

Run: `pnpm dev` and verify a few tools (yaml-to-json, csv-to-json, json-prettify) show the new toolbar buttons and that import/paste/download work.
