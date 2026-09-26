# 19 — 绑定 Naive UI 组件库 locale

Status: resolved
Type: task
Blocked by: —

## 背景

浏览器实测发现 `/base64-encoder` 上出现英文 "Please Input"。定位为 Naive UI
内置语言包的默认值（`locales/common/enUS.mjs` 的 `Input.placeholder`）——
`NConfigProvider` 未绑定 `:locale`，因此组件库内部文案（输入框占位符、
空数据提示、日期面板等）始终为英文。

## 方案

`App.vue` 中按应用 locale 绑定 `:locale` 与 `:date-locale`：
zh → `zhCN` / `dateZhCN`，en → `enUS` / `dateEnUS`。

## Comments
- 已完成；`/base64-encoder` 上该占位符现为「请输入」。
