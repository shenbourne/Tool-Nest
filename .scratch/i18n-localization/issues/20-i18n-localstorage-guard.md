# 20 — i18n 模块 localStorage 守卫

Status: resolved
Type: task
Blocked by: 18-service-layer

## 背景

service 层引入 `@/i18n` 后，`registry.test.ts`（经工具注册表间接 import 全部
`index.ts`）在 node 环境下报 `ReferenceError: localStorage is not defined` ——
`i18n.ts` 在模块顶层读取 `localStorage`。

## 方案

`i18n.ts` 增加 `typeof localStorage === 'undefined'` 守卫，默认回退 `zh`。
同时使该模块在 SSR / 测试等非 DOM 环境下可用。

## Comments
- 已完成；web 测试 38/38 通过。
