# 18 — service 层文案本地化

Status: resolved
Type: task
Blocked by: 00-shared-namespace

## 背景

组件层本地化完成后，浏览器实测与静态扫描发现**第二层遗漏**：部分
`.service.ts` 与 `password-strength-analyser/index.ts` 会返回直接渲染到 UI 的
英文字符串（错误提示、结果标签、破解时间、建议列表、时长单位）。

## 方案

service 引入全局 i18n 实例（`import { i18n } from '@/i18n'`），调用
`i18n.global.t(...)`。当 service 函数在组件 `computed` 内被调用时，`t` 会读取
locale ref，从而自动建立响应式依赖 —— 切换语言即刷新，无需改动消费侧组件。

模块级常量（`MASK_PATTERNS`）在 import 时即求值，无法使用该方案，因此改为暴露
`labelKey`，由组件渲染时调用 `t(labelKey)`。

## 覆盖范围

`date-time-converter`（含 dayjs 相对时间 locale）、`docker-compose-to-1panel`、
`docker-run-to-compose`、`email-normalizer`、`json-minify`、`json-to-csv`、
`json-viewer`、`regex-tester`、`xml-formatter`、`info-masking`、
`eta-calculator`（时长单位与 `toLocaleString` locale）、`password-strength-analyser`。

## 不在范围

第三方库自身产生的消息（`JSON.parse` 语法错误、`DOMParser` 的
`parseError.textContent`）、服务端返回的 API 错误消息。

## Comments
- 已完成；`verify-keys.mjs` 已扩展为同时校验 `t()` 与 `i18n.global.t()`。
