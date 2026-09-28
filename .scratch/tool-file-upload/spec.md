# 工具文件导入控件缺失

Status: acceptance-pass

## 问题陈述

图片类与 PDF 类工具的「导入文件」控件在前端不可见，用户无法选择本地文件，转换按钮因此永久禁用。截图见 `.scratch/tool-file-upload/`（`convert-to-pdf`、`convert-to-jpg`）。

## 根因

naive-ui 的 `NUpload` 不提供内置可见触发器。`.n-upload-trigger` 只有 `display: inline-block; box-sizing: border-box` 两条声明——naive-ui 的 upload 样式表中完全没有 `.n-upload-trigger` 的盒模型规则（`grep upload-trigger node_modules/naive-ui/es/upload/styles/index.mjs` 无匹配）。触发器内容必须通过默认插槽传入。

受影响组件全部写成自闭合 `<NUpload ... />`，没有插槽，于是渲染成 0×0 的空 `div`。

实测证据（修复前，`http://localhost:3004/convert-to-pdf`）：

```
trigRect: {width: 0, height: 0}
trigStyle: {display:"inline-block", height:"0px", border:"0px none", padding:"0px", minHeight:"0px"}
```

次要缺陷：`defaultUpload` 默认为 `true`。未提供 `action` 时，naive-ui 仍为每个文件创建 `XMLHttpRequest` 并注册回调（`Upload.mjs:167-199`），但不发送，文件永久停留在 `pending`。

## 范围

- 纳入：19 个使用裸 `<NUpload>` 的工具组件，以及替代用共享组件与其 i18n 文案。
- 不纳入：`.scratch/tool-interaction-audit/findings.md` 已记录的 D4/D11 缺陷（吞异常、object URL 泄漏）；服务端上传接口（19 个工具均为 `runtimeLocation: 'browser'`）。

## 验收

见 `.workflow/phases/01-tool-file-upload/ACCEPTANCE.md`。

## Comments

- 2026-09-28 初次立项。初版范围只有截图中的两个工具，经 `grep` 确认 19 处同源缺陷后扩大到全部；修复两个会留下 17 个同样不可用的工具。
