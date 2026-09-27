# Batch 09

## 概要
- 审计工具数：19
- 发现：P0 0 条 / P1 1 条 / P2 7 条 / P3 3 条
- clean 工具：security-checklist, slugify, string-obfuscator, temperature, text-diff, text-repeat, text-reverse, text-rotate, text-split（text-replacer 仅有已校准样例中的 D12，不重复计入）

## 发现

### safelink-decoder
1. **D5 / P2** `apps/web/src/tools/safelink-decoder/SafelinkDecoder.vue:37-41`
   - 触发：点击「复制」按钮，或剪贴板 API 因权限/非安全上下文拒绝时。
   - 期望：复制成功后给出成功提示，失败时提示失败。/ 实际：`navigator.clipboard.writeText` 是浮动 promise，无 try/catch、无任何成功/失败反馈；权限被拒时静默失败。
   - 修复建议：加 try/catch 并用 message 提示成功/失败。
   - 真实缺陷理由：与已校准样例 hash-text 完全同型（复制无 try/catch、无反馈），用户无法确认是否已复制。

### screenshot-share
1. **D5 / P3** `apps/web/src/tools/screenshot-share/ScreenshotShare.vue:45-55`
   - 触发：截图成功后点击「复制到剪贴板」，复制成功时。
   - 期望：有成功提示。/ 实际：仅失败路径写 `errorMsg`，成功路径无任何反馈，用户需自行粘贴验证。
   - 修复建议：成功后写一条成功提示（或复用 `errorMsg` 的提示位换成 message 成功态）。
   - 真实缺陷理由：复制成功无任何可见反馈；失败已有处理，故定级低于无 try/catch 的同类问题。

### seconds-to-time
1. **D8 / P2** `apps/web/src/tools/seconds-to-time/SecondsToTime.vue:9-13`
   - 触发：输入负数（如 `-5`）、带垃圾后缀（`12abc`）、小数（`1.5`）或非数字。
   - 期望：非法输入被拒绝或提示，或负数按正确符号格式化。/ 实际：`parseInt` 静默截断后缀与小数；`-5` 产出 `-1:-1:-5` 这种非法时间串且无任何提示，被静默接受为「结果」。
   - 修复建议：用受校验的解析（如 `Number` + `Number.isFinite` + 非负检查），非法输入显示提示而非输出。
   - 真实缺陷理由：非法输入静默产出错误结果（D12 边缘），无输入校验、无上下界约束。

### service-status
1. **D12 / P2** `apps/web/src/tools/service-status/ServiceStatus.vue:16-22`
   - 触发：检测一个返回 HTTP 404/500 的 URL（网络可达但服务报错）。
   - 期望：错误状态码应被标注为异常或不可达。/ 实际：`mode: 'no-cors'` 产生 opaque 响应，任何 HTTP 错误状态也 resolve，`fetch` 成功分支无条件写入 `reachable` 并附响应时间，用户把挂掉的服务误判为正常。
   - 修复建议：通过可读取状态码的方式（如同源探针/后端代理）获取 status；若做不到，至少在界面说明「仅检测网络可达性，不代表 HTTP 状态正常」。
   - 真实缺陷理由：结果被标注为错误的状态（把 5xx 标为可达），会误导决策；这是该工具的核心输出。

### speed-test
1. **D4 / P1** `apps/web/src/tools/speed-test/SpeedTest.vue:16,24`
   - 触发：延迟或下载请求失败（如网络断开、cloudflare 端点被拦截、CORS/网络错误）。
   - 期望：失败时告知用户测试未完成。/ 实际：两处 `catch {}` 吞掉异常；延迟失败则 `latency` 保持 0、下载失败则 `downloadSpeed` 保持 0，成功样式的 NAlert 仍显示「0 Mbps / 0ms」，失败与真实测得 0 不可区分；两者都失败时界面无任何输出、无任何提示。
   - 修复建议：catch 中设置错误状态并用 error 提示展示失败原因。
   - 真实缺陷理由：与已校准样例 dns-resolver 同型（catch 吞异常，失败不可见），且把失败渲染成成功样式的结果，直接误导用户。
2. **D7 / P3** `apps/web/src/tools/speed-test/SpeedTest.vue:18-24`
   - 触发：慢网络下开始测速（需下载 10MB），用户想中止或查看进度。
   - 期望：长任务提供取消/进度。/ 实际：无进度显示、无取消按钮，只能等 10MB 下完或离开页面。
   - 修复建议：用 AbortController 支持取消，读取流时计算已下载字节数显示进度。
   - 真实缺陷理由：10MB 下载在慢网下可能持续数分钟，无任何进度/取消手段。

### sql-prettify
1. **D5 / P2** `apps/web/src/tools/sql-prettify/SqlPrettify.vue:45-47`
   - 触发：点击输出区的「复制」按钮。
   - 期望：复制有成功/失败提示。/ 实际：`navigator.clipboard.writeText` 无 try/catch（浮动 promise）、无成功反馈；剪贴板权限被拒时静默失败。
   - 修复建议：加 try/catch 并用 message 反馈。
   - 真实缺陷理由：与已校准样例 hash-text 同型。

### svg-placeholder-generator
1. **D8 / P2** `apps/web/src/tools/svg-placeholder-generator/svg-placeholder-generator.service.ts:11-14`
   - 触发：在自定义文本中输入含 `<`、`&`、`"` 等 XML 特殊字符（如 `A < B & C`）。
   - 期望：文本被转义后嵌入 SVG，产物仍是合法 SVG。/ 实际：`displayText` 未经任何转义直接拼进 `<text>` 节点，生成的 SVG 为非法 XML，预览图文字截断/消失，下载/复制的 SVG 文件无法正确解析。
   - 修复建议：对 customText 做 XML 转义（`& < > " '`）后再插入。
   - 真实缺陷理由：非法输入被静默接受并产出损坏结果，属于交互正确性缺陷（非纯安全设计问题）。
2. **D5 / P2** `apps/web/src/tools/svg-placeholder-generator/SvgPlaceholderGenerator.vue:32-34`
   - 触发：点击「复制 SVG 代码」按钮。
   - 期望：复制有成功/失败提示。/ 实际：`navigator.clipboard.writeText` 无 try/catch、无反馈，权限被拒时静默失败。
   - 修复建议：加 try/catch 并用 message 反馈。
   - 真实缺陷理由：与已校准样例 hash-text 同型。

### text-censor
1. **D6 / P3** `apps/web/src/tools/text-censor/TextCensor.vue:11-13`
   - 触发：输入包含敏感词子串的正常单词，如 `hello`（含 `hell`）、`shell`、`hacker`（部分匹配 `hack` 的情形之外）等。
   - 期望：按词边界审查，正常词不被误伤（或至少有提示）。/ 实际：纯子串替换无词边界判断，`hello` → `h***o`、`shell` → `s***l`，正常文本被静默改写成错误输出。
   - 修复建议：用 `\b` 词边界正则匹配。
   - 真实缺陷理由：可复现的误匹配导致输出结果错误，属边界/逻辑错误；因审查类工具的朴素实现常见，定 P3。

### text-join
1. **D3 / P2** `apps/web/src/tools/text-join/TextJoin.vue:10`
   - 触发：输入行中包含空行，如 `a\n\nb`，执行合并。
   - 期望：每个输入行对应一个输出项，或至少告知空行被丢弃。/ 实际：`.filter(Boolean)` 静默删除空行，`a\n\nb` 变成 `a, b`，输入行数与输出项数不一致且无任何提示，用户对照原文时丢失条目。
   - 修复建议：保留空行为空字符串项，或在界面说明空行将被忽略。
   - 真实缺陷理由：与已校准样例 list-sort 同型（静默删除空行导致数据丢失），此处为只读合并场景故降一级。

### text-replacer
- 仅存在已校准样例中的问题（`TextReplacer.vue:17` 非法正则将错误文案写入输出区，D12/P2），按要求不重复计入本批统计。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| safelink-decoder | D5/P2 ×1 |
| screenshot-share | D5/P3 ×1 |
| seconds-to-time | D8/P2 ×1 |
| security-checklist | clean |
| service-status | D12/P2 ×1 |
| slugify | clean |
| speed-test | D4/P1 ×1、D7/P3 ×1 |
| sql-prettify | D5/P2 ×1 |
| string-obfuscator | clean |
| svg-placeholder-generator | D8/P2 ×1、D5/P2 ×1 |
| temperature | clean |
| text-censor | D6/P3 ×1 |
| text-diff | clean（逐行位置 diff 为既定简单算法，按设计选择处理） |
| text-join | D3/P2 ×1 |
| text-repeat | clean |
| text-replacer | 仅已知样例（D12/P2，不重复计入） |
| text-reverse | clean |
| text-rotate | clean（负数 positions 已由取模归一化处理） |
| text-split | clean |
