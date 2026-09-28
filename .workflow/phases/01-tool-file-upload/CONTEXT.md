# Phase context

- Phase: 01 — Tool file import controls
- Goal: Every tool that reads a local file shows a working, visible file-import control, and the chosen file reaches the tool's conversion logic.
- Requirements: R-002 (unified, usable tool UI)
- Constraints: Vue 3 + naive-ui; bilingual (zh/en with English fallback); control-height baseline 42px per `DESIGN.md`; no new runtime dependency.
- Decisions already made: none (no ADR yet)
- Open questions: none
- Boundary: IN scope — the 19 tool components under `apps/web/src/tools/` that use a bare `<NUpload>`, plus a shared replacement component and its i18n strings. OUT of scope — the D4/D11 error-handling and object-URL-lifecycle defects already logged in `.scratch/tool-interaction-audit/findings.md`; server-side upload APIs (all 19 tools are `runtimeLocation: 'browser'`).

## Root cause (evidence)

`NUpload` in naive-ui does **not** ship a built-in visible trigger. Its `.n-upload-trigger` element gets only `display: inline-block; box-sizing: border-box; opacity: 1; transition` — no box model at all (`node_modules/naive-ui/es/upload/src/styles/index.cssr.mjs`, the `cB("upload-trigger", ...)` block). The trigger content must be supplied through the default slot; naive-ui's own docs always pass an `n-button` or `n-upload-dragger`. `.n-upload-dragger` *is* fully styled (padding, dashed border, radius, hover, `--drag-over` highlight), and `Upload.mjs:602-604` only sets `draggerInsideRef` — which gates drag-and-drop acceptance — when the first default-slot child is the dragger. So the dragger is the only correct trigger.

All 19 affected tool components use `<NUpload ... />` self-closing with no slot, so the picker renders as a 0×0 empty `div.n-upload-trigger`.

Live evidence on the dev server (`http://localhost:3004/convert-to-pdf`, before the fix):

```
trigRect: {width: 0, height: 0}
trigStyle: {display: "inline-block", height: "0px", border: "0px none rgb(95, 94, 91)", padding: "0px", minHeight: "0px"}
```

The page accessibility snapshot contained only the info alert and the (disabled) convert button — no file control.

Secondary defect: `defaultUpload` defaults to `true`. With no `action`, naive-ui still constructs an `XMLHttpRequest` per file and registers handlers (`Upload.mjs:167-199`) even though nothing is sent, leaving files stuck in `pending` forever. The replacement sets `:default-upload="false"`.

## Why the prior audit missed it

`.scratch/tool-interaction-audit/findings.md` assumes uploads work — its triggers read "上传一个损坏的/伪装的文件" — so every finding in that file is downstream of a control that never rendered. The audit verified conversion logic by reading code, not by clicking the control. Recorded here so the next audit pass does not repeat the assumption.
