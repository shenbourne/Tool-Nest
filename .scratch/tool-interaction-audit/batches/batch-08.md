# Batch 08

## 概要
- 审计工具数：19
- 发现：P0 1 条 / P1 5 条 / P2 11 条 / P3 5 条
- clean 工具：pdf-signature-checker, pdf-to-epub, pdf-to-png, quote-generator, regex-memo, regex-tester, remove-duplicate-lines, rot13

## 发现

### pdf-protect
1. **D4 / P1** `apps/web/src/tools/pdf-protect/PdfProtect.vue:14-24`
   - 触发：上传一个损坏的或非 PDF 文件（accept 仅过滤对话框，仍可拖入/选入非法文件），点击处理按钮。
   - 期望：解析失败时提示错误、按钮恢复可用。/ 实际：`process()` 无 try/catch，`PDFDocument.load` 抛出后成为未处理 rejection，`processing` 永远保持 true，按钮永久卡在 loading，且无任何错误提示。
   - 修复建议：try/catch 包裹解析过程，catch 中设置 error 并置 `processing=false`（用 finally）。
   - 真实缺陷理由：一次失败即导致工具永久不可用且失败不可见。
2. **D12 / P1** `apps/web/src/tools/pdf-protect/PdfProtect.vue:19-22`
   - 触发：正常使用工具保护任意 PDF 并下载结果。
   - 期望：名为 "protect"、关键词含 password/encrypt 的工具产出的文件应真正受密码保护。/ 实际：只调用 `doc.setTitle()` 写入元数据，输出的是完全未加密的 PDF，却以 `protected.pdf` 文件名交付；用户误以为文件已加密。
   - 修复建议：用 `doc.encrypt({ userPassword, ownerPassword })`（pdf-lib 支持）并补充密码输入框（组件已 import NInput 却未使用，说明该交互被遗漏）。
   - 真实缺陷理由：结果类型与工具承诺不符，会误导用户做出「文件已受保护」的错误决策（如直接外发）。
3. **D11 / P3** `apps/web/src/tools/pdf-protect/PdfProtect.vue:22`（同模式见 pdf-rotate、pdf-split、pdf-to-epub、pdf-to-png）
   - 触发：反复处理文件或离开页面。
   - 期望：`URL.createObjectURL` 创建的 blob URL 在使用完毕/组件卸载时 revoke。/ 实际：从不 revoke；`onFile` 切换文件时旧 URL 仅被置空未释放，内存泄漏。
   - 修复建议：保存旧 URL 并在替换/ `onBeforeUnmount` 时 `URL.revokeObjectURL`。
   - 真实缺陷理由：资源生命周期未清理，多次使用累积内存占用。

### pdf-rotate
1. **D4 / P1** `apps/web/src/tools/pdf-rotate/PdfRotate.vue:15-25`
   - 触发：上传损坏/非 PDF 文件后点击旋转。
   - 期望：报错并恢复按钮。/ 实际：无 try/catch，`processing` 卡死为 true，按钮永久 loading，无错误提示。
   - 修复建议：try/catch/finally 处理。
   - 真实缺陷理由：同 pdf-protect，失败一次即工具不可用。
2. **D6 / P2** `apps/web/src/tools/pdf-rotate/PdfRotate.vue:21`
   - 触发：对页面本身已带旋转角（如扫描件 rotation=90）的 PDF 选择「90°」。
   - 期望：在现有角度基础上再旋转 90°。/ 实际：`p.setRotation(degrees(angle))` 是**赋值**而非累加，页面原本已是 90° 时结果与输入完全相同，用户操作无效且无从察觉。
   - 修复建议：`p.setRotation(degrees(p.getRotation().angle + angle.value))` 并对 360 取模。
   - 真实缺陷理由：常见输入（带旋转的扫描件）下产出错误结果，操作看似成功实际无变化。

### pdf-split
1. **D4 / P1** `apps/web/src/tools/pdf-split/PdfSplit.vue:15-28`
   - 触发：上传损坏/非 PDF 文件后点击提取。
   - 期望：报错并恢复按钮。/ 实际：无 try/catch，`processing` 永久 true，无提示。
   - 修复建议：try/catch/finally。
   - 真实缺陷理由：失败一次即工具不可用且不可见。
2. **D8 / P2** `apps/web/src/tools/pdf-split/PdfSplit.vue:22`
   - 触发：输入越界页码（3 页 PDF 填 `1,5,99`）或留空/只输入分隔符。
   - 期望：提示哪些页码无效，或阻止空结果。/ 实际：非法页码被静默丢弃；输入为空时 `indices=[]`，仍生成 0 页 PDF 并显示下载按钮，用户下载到一个空文档且全程无提示。
   - 修复建议：解析后校验每个 token，非法项给出错误提示；`indices` 为空时禁止执行/提示。
   - 真实缺陷理由：非法输入被静默接受并产出无意义结果，无校验无反馈。

### percentage-calc
1. **D6 / P3** `apps/web/src/tools/percentage-calc/PercentageCalc.vue:13`
   - 触发：清空第一个「What is a% of b?」的任一输入框（NInputNumber 值变为 null）。
   - 期望：输入为空时结果区显示空白。/ 实际：`null/100*b` 得 0，结果区显示 `0.0000`，与真实输入 0 无法区分，误导用户。
   - 修复建议：computed 中对 null 返回空串（另两个 computed 已对除数做了 null 守卫，此处遗漏）。
   - 真实缺陷理由：空输入被当作 0 参与运算，结果呈现失真。

### ping-test
1. **D9 / P2** `apps/web/src/tools/ping-test/PingTest.vue:40-41`
   - 触发：在目标输入框输入域名/IP 后按回车。
   - 期望：回车触发 ping（单输入 + 单按钮表单的标准行为）。/ 实际：无 `@keyup.enter`，无任何反应，必须鼠标点击按钮。
   - 修复建议：NInput 加 `@keyup.enter="run"`。
   - 真实缺陷理由：键盘用户无法完成核心操作路径（同 batch-04 global-latency-test 已记录模式）。

### qr-code-generator
1. **D5 / P2** `apps/web/src/tools/qr-code-generator/QrCodeGenerator.vue:36-48`
   - 触发：点击「复制」按钮（非安全上下文/权限被拒时必现）。
   - 期望：复制成功或失败有提示。/ 实际：`navigator.clipboard.write(...)` 无 try/catch、为浮动 promise，失败静默，成功也无反馈，用户无法确认二维码是否已进剪贴板。
   - 修复建议：await + try/catch + message 反馈。
   - 真实缺陷理由：复制操作无成功/失败提示，失败不可见。
2. **D4 / P2** `apps/web/src/tools/qr-code-generator/qr-code-generator.service.ts:28-30`
   - 触发：输入超长文本（超出 QR 容量，如数千字符）或导致 `QRCode.toDataURL` 抛错的其他输入。
   - 期望：生成失败时告知用户原因。/ 实际：`catch {}` 吞掉异常并把 dataUrl 置空，界面退化为「空输入提示」，失败与「未输入」完全不可区分。
   - 修复建议：catch 中向外暴露错误状态，界面显示错误提示。
   - 真实缺陷理由：异常被静默吞掉，用户无法得知生成失败及原因。
3. **D2 / P2** `apps/web/src/tools/qr-code-generator/qr-code-generator.service.ts:7-33`
   - 触发：快速连续输入使 `QRCode.toDataURL` 多次并发（如先粘入长文本再立刻继续键入），先发出的较慢请求后返回。
   - 期望：展示与当前输入一致的二维码。/ 实际：watch 回调内无序号/取消保护，后返回的旧请求会覆盖新请求的结果，界面短暂或持续显示旧输入对应的二维码。
   - 修复建议：为每次生成递增序号，回调返回时仅当序号是最新才写 `dataUrl`（或改用 debounce + 最新值比较）。
   - 真实缺陷理由：输入变化后输出可能与当前输入不一致，属于陈旧状态竞态。

### random-number-generator
1. **D8 / P1** `apps/web/src/tools/random-number-generator/RandomNumberGenerator.vue:11-18`
   - 触发：设置 min=100、max=1（min > max）后点击生成。
   - 期望：拒绝非法区间并提示。/ 实际：无任何校验，`range = 1-100+1 = -98`，`Math.random()*(-98)+100` 产出小于 min 乃至负数的「随机数」，结果被当作合法结果展示。
   - 修复建议：生成前校验 `min<=max`，非法时显示提示；min/max 输入框也加上相互约束。
   - 真实缺陷理由：非法输入静默产出错误结果，会误导依赖结果的用户。
2. **D8 / P3** `apps/web/src/tools/random-number-generator/RandomNumberGenerator.vue:14-15`
   - 触发：清空 min 或 max 输入框（值为 null）后点击生成。
   - 期望：提示输入不完整。/ 实际：`Math.floor(Math.random()*NaN)+null` 产出 NaN，结果区显示 "NaN"。
   - 修复建议：null 校验，缺失时提示。
   - 真实缺陷理由：空输入未被校验，直接以 NaN 形式呈现给用户。
3. **D6 / P0** `apps/web/src/tools/random-number-generator/RandomNumberGenerator.vue:14-16`
   - 触发：关闭 unique，设置 min=10、max=6（min>max 且可取值个数少于 count，如 count=5），点击生成。
   - 期望：拒绝非法区间或安全终止。/ 实际：可取值仅有 {7,8,9,10} 4 个，去重后 Set 大小永远到不了 5；防死循环守卫写的是 `nums.size > 10000`（永远不会成立，Set 大小被可取值个数封顶），`while (nums.size < count)` 变为死循环，页面主线程卡死，只能杀标签页。
   - 修复建议：先校验 `min<=max`；循环改用「迭代次数」上限（如 `tries > 10000`），或按校验直接拒绝。
   - 真实缺陷理由：特定合法可达的输入组合导致浏览器标签页永久无响应，属于阻断级缺陷。

### random-port-generator
1. **D5 / P2** `apps/web/src/tools/random-port-generator/RandomPortGenerator.vue:32-34`
   - 触发：点击「复制」。
   - 期望：复制有成功/失败反馈。/ 实际：`navigator.clipboard.writeText` 无 try/catch、无提示，浮动 promise。
   - 修复建议：await + try/catch + message 反馈。
   - 真实缺陷理由：复制结果无反馈，用户无法确认端口号已复制。
2. **D10 / P3** `apps/web/src/tools/random-port-generator/RandomPortGenerator.vue:46-48`
   - 触发：当当前显示端口恰为常用端口（如 8080）时，打开「Exclude common ports」开关。
   - 期望：选项生效后展示的端口应满足该约束。/ 实际：开关只影响下次 `refresh()` 的生成逻辑，已显示的端口保持不变，界面出现「已排除常用端口却仍显示 8080」的自相矛盾状态，直到用户手动点 reset。
   - 修复建议：`watch(excludeCommon)` 变化时自动重新生成，或改为 Computed 派生。
   - 真实缺陷理由：选项变更未刷新依赖结果，呈现状态与选项语义不一致。

### roman-numeral-converter
1. **D5 / P2** `apps/web/src/tools/roman-numeral-converter/RomanNumeralConverter.vue:21-26`
   - 触发：点击任一「复制」按钮。
   - 期望：复制有反馈。/ 实际：`navigator.clipboard.writeText` 无 try/catch、无成功提示。
   - 修复建议：await + try/catch + message 反馈。
   - 真实缺陷理由：复制操作无反馈。
2. **D6 / P3** `apps/web/src/tools/roman-numeral-converter/roman-numeral-converter.service.ts:10,22` + `RomanNumeralConverter.vue:16,46`
   - 触发：清空罗马数字输入框。
   - 期望：输入为空时结果区留空。/ 实际：`ROMAN_NUMBER_REGEX` 匹配空字符串，`isValidRomanNumber('')` 为 true，`romanToArabic('')` 返回 0，界面显示「0」且复制按钮可用（复制出 "0"）。
   - 修复建议：`isValidRomanNumber` 增加非空判断（`s.length > 0 && regex.test`）。
   - 真实缺陷理由：空输入被当作合法罗马数字 0 呈现，结果失真。

### rsa-key-pair-generator
1. **D7 / P2** `apps/web/src/tools/rsa-key-pair-generator/RsaKeyPair.vue:17-29`
   - 触发：选择 4096 bit 点击生成。
   - 期望：长任务期间有 loading 反馈且界面不冻结。/ 实际：`forge.pki.rsa.generateKeyPair` 未传回调、为同步执行（`workers:-1` 在不提供 callback 时不生效），主线程被阻塞数秒，`:loading` 状态在同一 tick 内无法渲染（spinner 根本不出现），界面完全卡死且无取消手段。
   - 修复建议：改用 `generateKeyPair({bits, workers:-1}, callback)` 异步形式，配合真正的 loading 状态。
   - 真实缺陷理由：长任务无有效进度反馈、UI 冻结，用户可能重复点击或认为页面崩溃。
2. **D5 / P2** `apps/web/src/tools/rsa-key-pair-generator/RsaKeyPair.vue:31-32`
   - 触发：点击复制公钥/私钥。
   - 期望：复制有反馈。/ 实际：无 try/catch、无提示，浮动 promise；私钥这类长文本复制失败时用户无从察觉。
   - 修复建议：await + try/catch + message 反馈。
   - 真实缺陷理由：复制操作无成功/失败提示。

### rule-test
1. **D9 / P2** `apps/web/src/tools/rule-test/RuleTest.vue:43-45`
   - 触发：在域名输入框输入后按回车。
   - 期望：回车触发测试。/ 实际：无 `@keyup.enter`，必须点击按钮。
   - 修复建议：NInput 加 `@keyup.enter="run"`。
   - 真实缺陷理由：键盘无法完成核心操作路径（同 ping-test）。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| pdf-protect | D4/P1、D12/P1、D11/P3 |
| pdf-rotate | D4/P1、D6/P2（D11/P3 见 pdf-protect 记录） |
| pdf-signature-checker | clean（有 try/catch + 错误 alert + 状态重置） |
| pdf-split | D4/P1、D8/P2（D11/P3 见 pdf-protect 记录） |
| pdf-to-epub | clean（有 try/catch + 错误 alert；产物为 txt 但下载按钮如实标注为文本） |
| pdf-to-png | clean（有 try/catch + 错误 alert + scale 上下界；D11/P3 见 pdf-protect 记录） |
| percentage-calc | D6/P3 |
| ping-test | D9/P2 |
| qr-code-generator | D5/P2、D4/P2、D2/P2 |
| quote-generator | clean（按钮状态联动正常） |
| random-number-generator | D8/P1、D8/P3、D6/P0 |
| random-port-generator | D5/P2、D10/P3 |
| regex-memo | clean（纯静态参考表，无交互逻辑） |
| regex-tester | clean（非法正则有错误提示，高亮转义正确） |
| remove-duplicate-lines | clean（实时 computed，保序去重，无静默丢失） |
| roman-numeral-converter | D5/P2、D6/P3 |
| rot13 | clean（实时 computed，大小写处理正确） |
| rsa-key-pair-generator | D7/P2、D5/P2 |
| rule-test | D9/P2 |
