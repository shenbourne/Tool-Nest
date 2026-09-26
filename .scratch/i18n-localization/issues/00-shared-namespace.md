# 00 — 共享命名空间扩充

Status: resolved
Type: task
Blocked by: —

## 目标

在 `en.json` / `zh.json` 中扩充共享命名空间，使后续各批次的通用文案有键可用，避免重复定义。

## 现状

`common.*` 已有：loading, error, retry, close, save, cancel, confirm, back, reset
`tool.*` 已有：favorite, unfavorite, copy, copied, clear, download, upload

## 需新增（依据扫描中重复 ≥2 次的文案归纳）

```jsonc
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
```

> 该清单为**起点**，执行各批次时若发现其他跨工具重复文案，按 spec 规则追加到 `common.*` / `tool.*`。

## 约束

- 仅改 `apps/web/src/locales/{en,zh}.json`，不改组件
- 键必须同时加入 en 与 zh，且二者键集合保持一致

## Comments

- 已完成：批次提交见 `git log --grep="feat(i18n)"`；本地化片段 `.scratch/i18n-localization/fragments/`。
