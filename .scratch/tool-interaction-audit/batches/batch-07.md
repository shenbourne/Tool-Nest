# Batch 07

## 概要
- 审计工具数：19
- 发现：P0 0 条 / P1 5 条 / P2 13 条 / P3 8 条
- clean 工具：palindrome-checker, password-strength-analyser

## 发现

### mac-address-generator
1. **D1 / P1** `apps/web/src/tools/mac-address-generator/MacAddressGenerator.vue:35-38,78`
   - 触发：点击「刷新」按钮。
   - 期望：重新生成一批随机 MAC 地址 / 实际：`refresh()` 只做 `count.value = count.value`（同值赋值不触发任何更新），`macAddresses` 是 computed，缓存未失效，列表完全不变。按钮为死控件。
   - 修复建议：引入 `seed = ref(0)` 并让 `macAddresses` 依赖它，`refresh()` 中 `seed.value++`；或改为点击时调用 `generateMacAddresses` 写入普通 ref。
   - 真实缺陷理由：控件存在但不改变状态，直接可复现。

2. **D5 / P2** `apps/web/src/tools/mac-address-generator/MacAddressGenerator.vue:40-42`
   - 触发：点击「复制」时剪贴板权限被拒或不在安全上下文。
   - 期望：复制成功/失败均有提示 / 实际：`navigator.clipboard.writeText` 无 try/catch、无 then/反馈，失败静默，成功用户也无感知。
   - 修复建议：包 try/catch 并用 message 反馈成功/失败。
   - 真实缺陷理由：与已知样例 HashText 同型缺陷，不同文件独立存在。

### mac-lookup
1. **D6 / P2** `apps/web/src/tools/mac-lookup/MacLookup.vue:15`
   - 触发：输入点分隔格式的合法 MAC（Cisco 写法），如 `6416.7F00.0001`。
   - 期望：能正确提取前 6 位十六进制 / 实际：`replace(/[:-]/g, '')` 不剥 `.`，`slice(0,6)` 得到 `6416.7`（含非法字符）发给 API，必然查不到；同样纯非十六进制垃圾（如 `ZZ:ZZ:ZZ`）也不校验直接发出。
   - 修复建议：改为 `replace(/[^0-9a-f]/gi, '')` 并校验前缀必须是 6 位 hex。
   - 真实缺陷理由：一种常见合法 MAC 写法在此工具必然查询失败。

2. **D9 / P3** `apps/web/src/tools/mac-lookup/MacLookup.vue:29-30`
   - 触发：在输入框按回车。
   - 期望：触发查询 / 实际：无 `@keyup.enter`，只能点按钮。
   - 修复建议：`NInput` 上加 `@keyup.enter="lookup"`。

### markdown-to-html
1. **D5 / P2** `apps/web/src/tools/markdown-to-html/MarkdownToHtml.vue:17-19`
   - 触发：点击「复制 HTML」，剪贴板失败。
   - 期望：有成功/失败反馈 / 实际：无 try/catch、无任何提示。
   - 修复建议：try/catch + message 反馈。

### math-evaluator
1. **D6 / P1** `apps/web/src/tools/math-evaluator/MathEvaluator.vue:60-63`
   - 触发：输入含多个小数点的「数字」，如 `1.2.3` 或 `2..5`。
   - 期望：报语法错误 / 实际：词法扫描把 `1.2.3` 整个当数字 token，`parseFloat("1.2.3")` 静默截断为 `1.2`，继续解析剩余 `.3` 部分，最终给出错误但貌似合法的结果（如 `1.2.3` → `1.2`）。结果被错误接受。
   - 修复建议：数字 token 用正则 `/^\d*\.?\d+/` 校验，匹配失败抛错；或拒绝 token 中出现第二个 `.`。
   - 真实缺陷理由：非法输入产出错误数值结果，用户会得到错误答案且无任何提示。

2. **D12 / P2** `apps/web/src/tools/math-evaluator/MathEvaluator.vue:72-77`
   - 触发：输入非法表达式（如 `2+`）。
   - 期望：错误以错误样式呈现 / 实际：`Error: ...` 文案直接写进居中的大号结果区，与正常结果同样式展示。
   - 修复建议：结果与错误分开展示（错误用 NAlert）。
   - 真实缺陷理由：与已知样例 TextReplacer 同型（错误文案写入输出区），此处为不同文件。

### meta-tag-generator
1. **D5 / P2** `apps/web/src/tools/meta-tag-generator/MetaTagGenerator.vue:91-93`
   - 触发：点击「复制」，剪贴板失败。
   - 期望：成功/失败反馈 / 实际：无 try/catch、无提示。
   - 修复建议：try/catch + message。

### mime-types
1. **D5 / P2** `apps/web/src/tools/mime-types/MimeTypes.vue:28-44,62-64,82-112`
   - 触发：(a) 输入不存在的扩展名（如 `xyzq`）或不存在的 MIME 类型；(b) 点击结果 NTag 复制。
   - 期望：(a) 明确提示「未找到」；(b) 复制有反馈 / 实际：(a) 查找 miss 与输入为空同样什么都不显示，用户无法区分是「没有结果」还是「没触发」；(b) `copyText` 无 try/catch、无提示，且点击可复制是隐藏交互（无复制图标/文案）。
   - 修复建议：miss 时显示「not found」提示；复制用 message 反馈并给 tag 加复制 affordance。
   - 真实缺陷理由：失败态不可见 + 复制无反馈，均为真实交互缺失。

### morse-code
1. **D6 / P2** `apps/web/src/tools/morse-code/MorseCode.vue:16`
   - 触发：输入任何包含 `.` 的普通文本，如 `Hello.` 或 `a.b`。
   - 期望：识别为文本方向进行编码 / 实际：`t.includes('.')` 即判定为摩斯输入进行解码，`Hello.` 被按摩斯解析，所有字符查不到映射被静默置空，输出区空白，用户原文被「吞掉」。
   - 修复建议：方向判定改为「字符集是否只含 `.-/ 空格`」，否则按文本编码；或提供显式方向切换。
   - 真实缺陷理由：常见的含句号文本 100% 走错方向且无提示。

2. **D8 / P3** `apps/web/src/tools/morse-code/MorseCode.vue:17`
   - 触发：输入含不可映射字符的文本，如 `héllo!` 或中文。
   - 期望：提示哪些字符无法编码 / 实际：`MORSE[c] || ''` + `filter(Boolean)` 静默丢弃这些字符，用户拿到的摩斯码缺字无感知。
   - 修复建议：收集未映射字符并以提示展示。

### mtr-test
1. **D7 / P3** `apps/web/src/tools/mtr-test/MtrTest.vue:15-33,40-41`
   - 触发：对远程主机发起 MTR 测试（后端耗时可达数十秒），执行期间修改 target 输入框。
   - 期望：长任务有进度/可取消，执行期间相关控件禁用 / 实际：仅按钮有 loading（naive-ui loading 态阻止重复点击），target 输入框仍可编辑，运行期间改输入会使返回结果与当前输入不符；全程无进度、无取消。
   - 修复建议：执行中禁用输入框，或记录发起时的 target 并随结果展示。
   - 真实缺陷理由：长任务期间状态可漂移，结果可能对不上用户当前输入。

### number-generator
1. **D6 / P1** `apps/web/src/tools/number-generator/NumberGenerator.vue:12,15-16`
   - 触发：输入 `even` 或 `odd` 且第二行为负数，如 `even\n-5`。
   - 期望：给出输入错误提示 / 实际：`Array.from({length: -5})` 抛出 RangeError，computed 中异常向上传播导致组件渲染崩溃（页面白屏/报错）。
   - 修复建议：对 `n` 做下界校验（`Math.max(0, n)` 或报错提示）。
   - 真实缺陷理由：合法可达的输入直接使工具崩溃。

2. **D8 / P1** `apps/web/src/tools/number-generator/NumberGenerator.vue:12-14`
   - 触发：输入 `primes` 并将 n 设为很大值（如 10000000），或在无上下界约束下输入巨大 n。
   - 期望：有上下界约束（如 ≤ 10000）/ 实际：`parseInt(lines[1]) || 10` 无任何上限，素数循环在主线程同步执行，页面长时间卡死，无 loading、无取消。
   - 修复建议：限制 n 的最大值并对超限输入提示。
   - 真实缺陷理由：普通输入即可造成页面假死。

### number-sum
1. **D6 / P2** `apps/web/src/tools/number-sum/NumberSum.vue:12`
   - 触发：粘贴单行逗号分隔数据，如 `1, 2, 3`。
   - 期望：每行一个数的格式被说明，或逗号分隔被正确拆分 / 实际：`parseFloat("1, 2, 3")` 只取前缀得 `1`，count=1、sum=1，其余数字被静默丢弃，结果错误。同理非数字行被 `filter(!isNaN)` 静默丢弃且无提示。
   - 修复建议：对无法整行解析的内容给出警告，或支持逗号/空白分隔。
   - 真实缺陷理由：常见粘贴格式产出错误统计结果且无感知。

### number-to-words
1. **D8 / P2** `apps/web/src/tools/number-to-words/NumberToWords.vue:23`
   - 触发：输入 `3.9` 或 `12abc`。
   - 期望：提示仅支持整数（或拒绝非法输入）/ 实际：`parseInt` 静默截断，`3.9` 显示为 `three`，`12abc` 显示为 `twelve`，非法输入被静默接受并产出貌似权威的结果。
   - 修复建议：用 `/^-?\d+$/` 严格校验，非法时给出提示。
   - 真实缺陷理由：输入校验缺失导致错误结果被当作正确结果展示。

### numeronym-generator
1. **D5 / P3** `apps/web/src/tools/numeronym-generator/NumeronymGenerator.vue:15-17`
   - 触发：生成 numeronym 后想复制结果。
   - 期望：有复制入口（组件里已写好 `copyOutput`）/ 实际：模板中没有接任何复制按钮，`copyOutput` 为未引用的死代码，用户只能手动选中复制。
   - 修复建议：在结果卡片中加复制按钮接 `copyOutput`，并加复制反馈。
   - 真实缺陷理由：功能代码存在但交互入口缺失，属一致性缺失（同类生成器工具均有复制）。

### otp-generator
1. **D2 / P1** `apps/web/src/tools/otp-generator/OtpGenerator.vue:78-82,124-133`
   - 触发：修改 QR 卡片区中的 Issuer 或 Account 输入框。
   - 期望：二维码按新参数重新生成 / 实际：`updateQr()` 仅在 onMounted 和 secret 的 watch 中调用，issuer/account 变化无任何监听，二维码停留在旧值——用户改完参数导出的仍是默认 `ToolNest:user` 的码。
   - 修复建议：`watch([issuer, account], updateQr)`。
   - 真实缺陷理由：输入变化后输出未重算，功能呈现为「坏了」。

2. **D5 / P2** `apps/web/src/tools/otp-generator/OtpGenerator.vue:44-50`
   - 触发：点击复制 secret 或复制 token，剪贴板失败。
   - 期望：有反馈 / 实际：无 try/catch、无提示。
   - 修复建议：try/catch + message。

3. **D9 / P3** `apps/web/src/tools/otp-generator/OtpGenerator.vue:116-117`
   - 触发：在验证输入框按回车。
   - 期望：触发验证 / 实际：只能点按钮。
   - 修复建议：`@keyup.enter="verify"`。

### password-generator
1. **D12 / P2** `apps/web/src/tools/password-generator/PasswordGenerator.vue:22,42`
   - 触发：关掉全部字符集开关（或 exclude 框填掉所有剩余字符）后点击生成。
   - 期望：以错误提示样式告知 / 实际：错误文案 `selectOneOption` 被直接写进密码输出框，与真实密码同样式展示，且下次成功生成前一直残留。
   - 修复建议：错误用 NAlert 展示，输出框保持为空。
   - 真实缺陷理由：错误信息写入结果区，可能被当作密码复制。

### pdf-editor
1. **D2 / P2** `apps/web/src/tools/pdf-editor/PdfEditor.vue:28,98-104,120`
   - 触发：成功生成 edited.pdf 后，修改文字/位置/字号/颜色，再点「下载编辑后的 PDF」。
   - 期望：下载与当前输入一致 / 实际：输入变化不会清除 `resultUrl`，下载的是旧参数生成的 PDF，界面无任何「结果已过期」提示。
   - 修复建议：监听参数变化清空 `resultUrl`，或下载前重新生成。
   - 真实缺陷理由：陈旧状态被当作当前结果交付。

2. **D11 / P3** `apps/web/src/tools/pdf-editor/PdfEditor.vue:99`
   - 触发：多次应用/更换文件。
   - 期望：`URL.createObjectURL` 创建的 URL 在替换/卸载时 revoke / 实际：从不 revoke，重复操作累积泄漏 blob URL。
   - 修复建议：保存旧 URL，替换前 `URL.revokeObjectURL(old)`；onUnmounted 清理。

### pdf-extract-images
1. **D11 / P2** `apps/web/src/tools/pdf-extract-images/PdfExtractImages.vue:20-24,54,71-79`
   - 触发：对一个 PDF 执行提取后，换一个文件再提取（或重复提取）。
   - 期望：旧的 object URL 被释放 / 实际：`images.value = []` 直接丢弃旧数组，此前每个页面创建的 `URL.createObjectURL` 永不 revoke；大 PDF 多次操作会累积大量 blob 内存。
   - 修复建议：清空前遍历 revoke；onUnmounted 统一 revoke。
   - 真实缺陷理由：资源生命周期缺陷，可复现累积。

2. **D7 / P3** `apps/web/src/tools/pdf-extract-images/PdfExtractImages.vue:45-55`
   - 触发：提取页数很多的 PDF。
   - 期望：有进度提示（当前页/总页数）/ 实际：仅按钮 loading，用户无法感知进度，也无法取消。
   - 修复建议：渲染循环中更新进度；考虑 AbortController 取消（pdf.js 支持）。
   - 真实缺陷理由：长任务交互缺失（轻度）。

### pdf-merge
1. **D2 / P2** `apps/web/src/tools/pdf-merge/PdfMerge.vue:13,28,36-40`
   - 触发：合并成功后，在上传列表中删除或替换某个 PDF。
   - 期望：结果失效或随之更新 / 实际：`onFiles` 不清理 `resultUrl`，「下载合并结果」仍提供基于旧文件列表的 PDF，与新选择不符且无提示。
   - 修复建议：`onFiles` 中清空 `resultUrl`。
   - 真实缺陷理由：文件列表与可下载结果不一致，陈旧结果可下载。

2. **D11 / P3** `apps/web/src/tools/pdf-merge/PdfMerge.vue:28`
   - 触发：多次合并。
   - 期望：旧 blob URL 被 revoke / 实际：从不释放，重复合并累积泄漏。
   - 修复建议：覆盖前 revoke 旧 URL。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| mac-address-generator | 2 条（D1/P1 刷新死控件；D5/P2 复制无反馈） |
| mac-lookup | 2 条（D6/P2 点分 MAC 必失败；D9/P3 无回车提交） |
| markdown-to-html | 1 条（D5/P2 复制无反馈） |
| math-evaluator | 2 条（D6/P1 多小数点被静默截断；D12/P2 错误写入结果区） |
| meta-tag-generator | 1 条（D5/P2 复制无反馈） |
| mime-types | 1 条（D5/P2 查找 miss 无反馈、tag 复制无反馈） |
| morse-code | 2 条（D6/P2 含 `.` 文本走错方向；D8/P3 不可映射字符静默丢弃） |
| mtr-test | 1 条（D7/P3 长任务无取消、运行中输入可漂移） |
| number-generator | 2 条（D6/P1 负数致组件崩溃；D8/P1 数量无上限可致页面卡死） |
| number-sum | 1 条（D6/P2 逗号分隔/非数字行静默丢弃致结果错误） |
| number-to-words | 1 条（D8/P2 小数/混排输入静默截断） |
| numeronym-generator | 1 条（D5/P3 copyOutput 未接按钮，结果无复制入口） |
| otp-generator | 3 条（D2/P1 改 issuer/account 二维码不重算；D5/P2 复制无反馈；D9/P3 无回车验证） |
| palindrome-checker | clean |
| password-generator | 1 条（D12/P2 错误文案写入密码输出框） |
| password-strength-analyser | clean |
| pdf-editor | 2 条（D2/P2 改参数后仍可下载旧结果；D11/P3 blob URL 不释放） |
| pdf-extract-images | 2 条（D11/P2 object URL 泄漏；D7/P3 长任务无进度/取消） |
| pdf-merge | 2 条（D2/P2 改文件列表后仍可下载旧合并结果；D11/P3 blob URL 不释放） |
