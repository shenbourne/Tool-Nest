# Batch 05

## 概要
- 审计工具数：19
- 发现：P0 0 条 / P1 3 条 / P2 13 条 / P3 8 条
- clean 工具：ipv4-range-expander, ipv4-subnet-calculator

## 发现

### image-split
1. **D2 / P1** `apps/web/src/tools/image-split/ImageSplit.vue:17-24,50-52,93`
   - 触发：先上传图片 A 并点击 Split 生成切片 → 再选择另一张图片 B。
   - 期望：新图片选中后旧切片应清除（或自动重切）。实际：`onFileChange` 只更新 `file`/`imageUrl`，`tiles` 保留图片 A 的切片并继续展示在「Tiles」卡片中；`watch` 仅在 rows/cols 变化时才重切。用户会把 A 的切片误认为 B 的并下载错误切片。
   - 修复建议：`onFileChange` 中清空 `tiles.value`（或Revoke后触发 `splitImage()`）。
   - 真实缺陷理由：输入变化后输出未重算，陈旧结果被展示且可下载，直接误导用户。
2. **D4 / P3** `apps/web/src/tools/image-split/ImageSplit.vue:28-47`
   - 触发：上传损坏/伪装成图片的文件（`accept` 可被绕过），点击 Split。
   - 期望：解码失败给出错误提示。实际：只注册了 `img.onload`，`onerror` 缺失，点击后无任何反应，用户不知道发生了什么。
   - 修复建议：增加 `img.onerror` 并以 NAlert 提示。
   - 真实缺陷理由：失败静默，无 try/catch 等价处理。
3. **D11 / P3** `apps/web/src/tools/image-split/ImageSplit.vue:22`
   - 触发：连续选择多张图片或离开页面。
   - 期望：旧 `URL.createObjectURL` 被 `URL.revokeObjectURL` 释放。实际：从未释放，内存泄漏。
   - 修复建议：选新文件前 revoke 旧 URL，组件卸载时 onUnmounted 释放。

### image-to-text-ocr
1. **D5 / P2** `apps/web/src/tools/image-to-text-ocr/ImageToTextOcr.vue:68-72`
   - 触发：点击「复制」。
   - 期望：复制成功/失败有反馈，clipboard 写入失败（权限拒绝）有提示。实际：`navigator.clipboard.writeText` 为浮动 promise：无 try/catch、无 .catch、无成功提示，失败完全不可见。
   - 修复建议：await + try/catch + message.success/error。
   - 真实缺陷理由：与已知样例 hash-text 完全同型（复制无 try/catch、无成功反馈）。
2. **D11 / P3** `apps/web/src/tools/image-to-text-ocr/ImageToTextOcr.vue:42`
   - 触发：连续选择多张图片或离开页面。
   - 期望：旧 object URL 被 revoke。实际：从未释放。

### image-watermark
1. **D4 / P1** `apps/web/src/tools/image-watermark/ImageWatermark.vue:15-34`
   - 触发：上传伪装成图片的非图片文件（accept="image/*" 可被拖拽/改后缀绕过），点击「加水印」。
   - 期望：解码失败应提示并恢复按钮状态。实际：只注册了 `img.onload`；`img.onerror` 缺失导致回调永不执行，`processing` 永远保持 `true`，「加水印」按钮永久卡在 loading 态，功能死锁，只能刷新页面。
   - 修复建议：增加 `img.onerror` 重置 `processing` 并提示错误。
   - 真实缺陷理由：一次失败输入即可使核心控件永久不可用。
2. **D11 / P3** `apps/web/src/tools/image-watermark/ImageWatermark.vue:33`
   - 触发：多次点击「加水印」或离开页面。
   - 期望：`URL.createObjectURL` 结果在用后 revoke。实际：从未释放。
   - 修复建议：onload 完成后 revoke，或 onUnmounted 释放。
3. **D6 / P3** `apps/web/src/tools/image-watermark/ImageWatermark.vue:14`
   - 触发：点击下载加水印结果。
   - 期望：下载文件名带扩展名（如 `watermarked.png`）。实际：`a.download = 'watermarked'`，保存的文件无扩展名，部分系统下无法双击打开。
   - 修复建议：根据 `file.type` 拼接扩展名。

### images-to-gif
1. **D2 / P3** `apps/web/src/tools/images-to-gif/ImagesToGif.vue:17-22,34-78`
   - 触发：点击「创建 GIF」后在 ffmpeg 执行期间（长任务）重新选择文件列表。
   - 期望：新选择应使旧任务的结果失效。实际：`onFileChange` 清空了 `resultData`/`error`，但进行中的任务结束后仍会把**旧文件列表**的 GIF 写入 `resultData`，覆盖用户的新选择，陈旧结果重新出现。
   - 修复建议：processing 期间禁用文件输入，或用任务 token 在完成后校验 files 是否已变更。
   - 真实缺陷理由：输入已变化但过期任务的输出仍写回结果区，状态不同步。

### info-masking
1. **D6 / P1** `apps/web/src/tools/info-masking/info-masking.service.ts:55-65`
   - 触发：将「保留末尾（preserveLast）」设为 0（NInputNumber `:min="0"` 允许），输入任意含敏感信息的文本。
   - 期望：不保留末尾字符，中间全部打码。实际：`value.slice(-0)` 等价于 `slice(0)` 返回**整个原始字符串**，输出变为 `前2字符 + 掩码 + 完整原文`，输出比输入更长且**完整泄露了本应脱敏的内容**。
   - 修复建议：`const last = preserveLast > 0 ? value.slice(-preserveLast) : '';`。
   - 真实缺陷理由：`slice(-0)` 陷阱导致脱敏结果错误并泄露敏感数据，直接违背工具用途（P0 级后果，按可稳定触发的输入错误定 P1）。
2. **D5 / P2** `apps/web/src/tools/info-masking/InfoMasking.vue:35-37`
   - 触发：点击「复制」。
   - 期望：有成功/失败反馈。实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：await + try/catch + message 反馈。

### ip-info
1. **D4 / P2** `apps/web/src/tools/ip-info/IpInfo.vue:14-31`
   - 触发：ipapi.co 返回 HTTP 错误（如 429 限流），响应体为 JSON 错误对象（无 `ip` 字段）。
   - 期望：检查 `r.ok`，失败时提示。实际：`r.json()` 解析成功不抛异常，表格渲染 11 行全部为空字符串，失败与「查询成功但无数据」不可区分。
   - 修复建议：`if (!r.ok) throw new Error(...)`，或检测 `j.error` 字段。
   - 真实缺陷理由：失败不可见，与已知样例 dns-resolver 同型（失败与无结果不可区分）。

### ipv4-address-converter
1. **D5 / P2** `apps/web/src/tools/ipv4-address-converter/Ipv4AddressConverter.vue:32-34`
   - 触发：点击任意一行的「复制」。
   - 期望：有成功/失败反馈。实际：浮动 promise，无 try/catch、无提示；剪贴板权限被拒时静默失败。
   - 修复建议：await + try/catch + message 反馈。

### ipv4-range-expander
- clean（输入校验、反向区间提示与一键交换、大数计算均正确）。

### ipv4-subnet-calculator
- clean（含 /0、/31、/32 边界处理正确，输入校验完整）。

### ipv6-ula-generator
1. **D5 / P2** `apps/web/src/tools/ipv6-ula-generator/Ipv6UlaGenerator.vue:18-20`
   - 触发：点击任意一行的「复制」。
   - 期望：有成功/失败反馈。实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：await + try/catch + message 反馈。

### jpg-to-png
1. **D4 / P2** `apps/web/src/tools/jpg-to-png/JpgToPng.vue:23-45`
   - 触发：上传损坏/伪装的图片文件，点击「下载为 PNG」。
   - 期望：解码失败给出错误提示。实际：仅注册 `img.onload`，`onerror` 缺失，点击后无任何反应；`canvas.toBlob` 回调里 `if (!blob) return;` 同样静默。
   - 修复建议：增加 `img.onerror` / blob 为 null 时的错误提示。
   - 真实缺陷理由：操作失败完全静默，用户无法区分「正在处理」与「已失败」。

### json-diff
1. **D6 / P3** `apps/web/src/tools/json-diff/JsonDiff.vue:48-55`
   - 触发：左侧粘贴字面量 `null`（合法 JSON），右侧留空。
   - 期望：应提示两侧输入不一致或至少不视为相等。实际：空文本框被当作 `null` 解析（`leftJson ? ... : null`），`a === null && b === null` 直接返回「无差异」，用户粘贴的 `null` 与未输入被判定相同。
   - 修复建议：用「文本框是否为空」而非解析结果是否为 null 区分「未输入」。
   - 真实缺陷理由：边界比较逻辑错误，产生错误的「无差异」结论。

### json-escape
1. **D12 / P2** `apps/web/src/tools/json-escape/JsonEscape.vue:12-17,24`
   - 触发：切到 unescape 模式，输入非合法 JSON（如 `abc`）。
   - 期望：错误应在独立区域提示。实际：`catch { return t('tools.jsonEscape.invalidInput') }` 把错误文案直接写进输出 textarea，与正常转换结果不可区分（已知样例 text-replacer 同款 D12/P2）。
   - 修复建议：返回 `{output, error}` 结构，错误用 NAlert 展示。
   - 真实缺陷理由：错误信息被写入结果区，误导用户复制错误文案。
2. **D6 / P3** `apps/web/src/tools/json-escape/JsonEscape.vue:15,24`
   - 触发：unescape 模式输入合法但非字符串的 JSON，如 `123`、`true`、`{"a":1}`。
   - 期望：输出应为可读的文本形式。实际：`JSON.parse` 返回 number/boolean/object，被直接作为 NInput 的 `value` 传入，对象渲染为 `[object Object]`，且类型与 NInput 的 string 要求不符。
   - 修复建议：对非 string 结果 `JSON.stringify` 或 `String()` 处理。
   - 真实缺陷理由：边界输入产生错误的呈现结果。

### json-minify
1. **D5 / P2** `apps/web/src/tools/json-minify/JsonMinify.vue:15-17`
   - 触发：点击「复制」。
   - 期望：有成功/失败反馈。实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：await + try/catch + message 反馈。

### json-prettify
1. **D5 / P2** `apps/web/src/tools/json-prettify/JsonPrettify.vue:35-37`
   - 触发：点击「复制」。
   - 期望：有成功/失败反馈。实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：await + try/catch + message 反馈。

### json-sort
1. **D12 / P2** `apps/web/src/tools/json-sort/JsonSort.vue:16,22`
   - 触发：输入非法 JSON（或空输入）。
   - 期望：错误应独立提示。实际：`catch { return t('common.invalidJson') }` 把「Invalid JSON」文案写进输出 textarea，与正常排序结果不可区分，用户可能直接复制该错误文本。
   - 修复建议：错误用 NAlert 展示，输出区保持空。
   - 真实缺陷理由：错误信息被写入结果区（已知样例 text-replacer 同款）。
2. **D6 / P2** `apps/web/src/tools/json-sort/JsonSort.vue:13`
   - 触发：输入含数字后缀键的 JSON，如 `{"item9":1,"item10":2}`。
   - 期望：键按自然序/数字感知排序，item9 在 item10 前。实际：`Object.keys(obj).sort()` 为纯字典序，结果为 `item10, item9`（已知样例 list-sort 同款「未用 numeric 排序」）。
   - 修复建议：使用 `localeCompare` 带 `numeric: true` 或自然序比较函数。

### json-stringify
1. **D12 / P2** `apps/web/src/tools/json-stringify/JsonStringify.vue:11-14,20`
   - 触发：输入非法 JSON（如 `hello`）。
   - 期望：解析失败应提示。实际：`catch { return input.value }` 把**原始输入原样回显**到输出区，失败输出与成功输出在视觉上完全一致，用户无法得知转换失败，可能把未格式化的原始文本当作「已 stringify 的结果」取走。
   - 修复建议：区分成功/失败状态，失败时以 NAlert 提示且不填充输出。
   - 真实缺陷理由：失败不可见且错误结果被标注为正常输出（与已知样例 dns-resolver「失败与无结果不可区分」同型）。

### json-to-csv
1. **D5 / P2** `apps/web/src/tools/json-to-csv/JsonToCsv.vue:16-18`
   - 触发：点击「复制」。
   - 期望：有成功/失败反馈。实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：await + try/catch + message 反馈。

### json-to-toml
1. **D5 / P2** `apps/web/src/tools/json-to-toml/JsonToToml.vue:16-18`
   - 触发：点击「复制」。
   - 期望：有成功/失败反馈。实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：await + try/catch + message 反馈。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| image-split | D2/P1 选新图不清旧切片；D4/P3 解码失败静默；D11/P3 object URL 泄漏 |
| image-to-text-ocr | D5/P2 复制无反馈；D11/P3 object URL 泄漏 |
| image-watermark | D4/P1 解码失败按钮永久 loading；D11/P3 object URL 泄漏；D6/P3 下载文件名无扩展名 |
| images-to-gif | D2/P3 处理中换文件后旧结果回写 |
| info-masking | D6/P1 preserveLast=0 时 slice(-0) 泄露完整原文；D5/P2 复制无反馈 |
| ip-info | D4/P2 HTTP 错误未检查 r.ok，限流时展示空表 |
| ipv4-address-converter | D5/P2 复制无反馈 |
| ipv4-range-expander | clean |
| ipv4-subnet-calculator | clean |
| ipv6-ula-generator | D5/P2 复制无反馈 |
| jpg-to-png | D4/P2 解码失败/toBlob 失败静默 |
| json-diff | D6/P3 一侧 `null` 与空输入判为无差异 |
| json-escape | D12/P2 错误文案写入输出区；D6/P3 非字符串 JSON unescape 渲染错误 |
| json-minify | D5/P2 复制无反馈 |
| json-prettify | D5/P2 复制无反馈 |
| json-sort | D12/P2 错误文案写入输出区；D6/P2 键排序未用 numeric |
| json-stringify | D12/P2 解析失败原样回显输入，失败不可见 |
| json-to-csv | D5/P2 复制无反馈 |
| json-to-toml | D5/P2 复制无反馈 |
