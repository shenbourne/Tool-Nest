# Acceptance verification

All checks performed by the agent via Chrome DevTools MCP on 2026-09-30 against `pnpm dev:web` at `http://localhost:3002` (ports 3000/3001 were already held by earlier processes on this machine). Two kinds of evidence are distinguished: a **synthetic** paste (`new ClipboardEvent('paste', { clipboardData: dt })` with a real `DataTransfer` and a real `File`, verified in-page to carry the same `clipboardData` object the browser supplies), and a **real Ctrl+V** driven with `press_key` against the actual Windows clipboard set by `Set-Clipboard -Path <file>`.

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| R-002 | On `/compress-pdf`, paste a `.pdf`: the name appears in the control's list and `压缩 PDF` enables. | Synthetic: before `{label: 点击、拖拽或粘贴文件到此处, names: [], disabled: true}` → after `{names: ['sample.pdf'], disabled: false}`, `defaultPrevented: true`. Real Ctrl+V on `/pdf-protect` with the file on the OS clipboard and focus on `BODY`: list `['sample.pdf']`, `处理 PDF` went disabled → enabled. | PASS |
| R-002 | An image tool imports a pasted screenshot-style `image/png`. | `/image-compress` synthetic paste → `pasted-screenshot.png` listed, `压缩` enabled, then the tool produced `原图：107.6 KB → 新图：149.3 KB` and a `blob:` preview. Real Ctrl+V with `verify-homepage.png` on the clipboard → `verify-homepage.png` listed, button enabled. | PASS |
| R-002 | Single-file controls replace the previous selection on paste. | `/image-compress`: pasting `pasted-screenshot.png` then `second-paste.png` left only `second-paste.png`; label switched to `点击、拖拽或粘贴以更换文件`. | PASS |
| R-002 | `/pdf-merge` (`multiple`) appends pasted PDFs. | Pasting `sample.pdf` then `second.pdf` → names `['sample.pdf', 'second.pdf']`, the tool's alert read `已选择 2 个文件`, merge button enabled at 2. | PASS |
| R-002 | A file the control's `accept` rejects is not imported and is reported. | On `/compress-pdf` (`accept=".pdf"`) pasting a `image/png` file → list unchanged (`['sample.pdf']`), message `粘贴的内容不是支持的文件格式`, `defaultPrevented: false`. | PASS |
| R-002 | A clipboard with no file is ignored, so ordinary text pastes still reach tool inputs. | Pasting a clipboard holding only `text/plain` → no list change, no message, `defaultPrevented: false` (the property that leaves the browser's native text paste intact). | PASS |
| R-002 | The control's copy mentions paste in zh-CN and en-US. | zh: `点击、拖拽或粘贴文件到此处` / `支持格式：.pdf`. `$i18n.locale = 'en'`: `Click, drop, or paste a file here`. | PASS |
| R-002 | Unmounting the tool removes the listener, and no duplicate listener accumulates. | `document.add/removeEventListener` instrumented in-page: in-app navigation `/image-compress` → `/hash-text` logged `removed: ['/hash-text']` with no control on the destination page; a file paste on `/hash-text` was a complete no-op (no list, no message, `prevented: false`); navigating to `/compress-pdf` logged exactly `added: ['/compress-pdf']` and a single paste produced exactly one entry. | PASS |
| R-002 | No regression: click-to-pick still imports. | Assigned a real `File` to the real `<input type="file">` and fired `change` → `/image-compress` list replaced `verify-homepage.png` with `picked.png`. | PASS |
| R-002 | No regression: drag-and-drop still imports. | Not reproducible with synthetic events — naive-ui maps `dataTransfer.items` through `webkitGetAsEntry()` and skips null entries with no `dataTransfer.files` fallback (`naive-ui/es/upload/src/UploadTrigger.mjs:55-66`), so a JS-constructed `DataTransfer` can never import. Covered instead by code inspection: this phase's diff touches only the `<script setup>` block and the copy — the template, the `NUpload` props (`accept`, `multiple`, `default-upload`, `show-file-list`) and the `NUploadDragger` slot are byte-identical to `origin/master`. | PASS (pick behavioral, drop by inspection) |

No console errors or warnings were recorded during any of the above (`list_console_messages` filtered to `error`/`warn` returned none).

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.

Manual browser checks performed by the agent via Chrome DevTools MCP against the local dev server.
