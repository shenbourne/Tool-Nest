# Acceptance verification

All checks performed by the agent via Chrome DevTools MCP against `pnpm dev:web` on `http://localhost:3004`, 2026-09-28. Files were supplied through the real `<input type="file">` via `DataTransfer`, so naive-ui's own change handling ran.

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| R-002 | Open `/convert-to-pdf`. A visible file-import control is rendered (non-zero bounding box, readable label). | `.n-upload-dragger` rect 850×126 at (655, 224.5); label `点击或拖拽文件到此处`; hint `支持格式：image/*`. Before the fix the trigger measured 0×0 with `border: 0px none`. | PASS |
| R-002 | Open `/convert-to-jpg`. Same as above. | `.n-upload-dragger` rect 850×126; same label and hint. | PASS |
| R-002 | Select a JPG/PNG through the control; the file name appears and the convert button becomes enabled. | `page.png` / `sample.png` listed in `.tool-file-upload__name`; `转换为 PDF` and `转换为 JPG` buttons went from `disabled` to enabled. | PASS |
| R-002 | Click convert on `/convert-to-jpg` with a real image; a preview and a download button appear; the download is a valid JPEG. | Preview `<img>` src starts with `data:image/jpeg` (2903 chars); `下载 JPG` button present. | PASS |
| R-002 | Click convert on `/convert-to-pdf` with a real image; a download button appears; the download is a valid PDF. | `下载 PDF` button present; intercepted blob is 195297 bytes, `type: application/pdf`, first five bytes read `%PDF-`. This required commit `c538dc3` — see `PLAN.md` scope log. | PASS |
| R-002 | Re-selecting a file replaces the previous selection (single-file tools). | On `/convert-to-jpg`: after picking `one.png` then `two.png`, the list held only `two.png` and the label switched to `点击或拖拽以更换文件`. | PASS |
| R-002 | `/pdf-merge` accepts multiple PDFs and lists them. | Picked `a.pdf`, `b.pdf`, `c.pdf`; all three listed and the tool's own alert read `已选择 3 个文件`. | PASS |
| R-002 | Control label renders in zh-CN and in en-US (English fallback). | zh: `点击或拖拽以更换文件` / `支持格式：image/*`. en: `Click or drop to replace` / `Accepted: image/*`, `<html lang="en">`, h1 `Convert to JPG`. | PASS |
| R-002 | No `NUpload` site remains without a trigger slot. | `grep NUpload apps/web/src` matches only `components/ToolFileUpload.vue` (which supplies `NUploadDragger`) and the generated `components.d.ts`. All 19 tool components migrated. | PASS |
| R-002 | Every migrated tool page renders the control. | Swept all 19 routes; each rendered `.n-upload-dragger` at 850×126 with the expected h1 (`转换为 PDF`, `图片水印`, `PDF 合并`, `PDF 转 PNG`, …). | PASS |

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.

Manual browser checks performed by the agent via Chrome DevTools MCP against the local dev server.
