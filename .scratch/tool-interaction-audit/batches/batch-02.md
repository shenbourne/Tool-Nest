# Batch 02

## 概要
- 审计工具数：19
- 发现：P0 0 条 / P1 8 条 / P2 9 条 / P3 9 条
- clean 工具：chronometer, create-palindrome, csv-to-tsv

## 发现

### check-leap-years
1. **D8 / P3** `apps/web/src/tools/check-leap-years/CheckLeapYears.vue:11`
   - 触发：输入 `2023abc` 或 `3.7` 等畸形数字。
   - 期望：非法 token 应提示或忽略并告知 / 实际：`parseInt` 静默截断（`2023abc`→2023 并给出闰年判定，`3.7`→3），纯非法 token 被静默丢弃，用户无从知道哪些输入被处理。
   - 修复建议：用严格正则 `/^\d+$/` 过滤，并在输出中标注被忽略的 token 数量。
   - 真实缺陷理由：非法输入被静默接受并产出貌似正确的结果，属于输入校验缺失。

2. **D5 / P3** `apps/web/src/tools/check-leap-years/CheckLeapYears.vue:18-20`
   - 触发：多行年份判定结果生成后想取走结果。
   - 期望：项目内同类工具（如 hash-text）均有复制按钮 / 实际：输出区无任何复制入口，只能手动框选。
   - 修复建议：增加带成功反馈的复制按钮。
   - 真实缺陷理由：同类工具均有复制按钮而本工具缺失，用户取走结果不便（D5 一致性）。

### chmod-calculator
1. **D5 / P2** `apps/web/src/tools/chmod-calculator/ChmodCalculator.vue:28-30`
   - 触发：点击 Copy 复制 chmod 命令，或剪贴板 API 不可用（非安全上下文）时。
   - 期望：复制成功有反馈、失败有提示 / 实际：`navigator.clipboard.writeText` 无 try/catch、无成功/失败提示，失败时用户完全无感知（与已知样例 hash-text 同类）。
   - 修复建议：加 try/catch + message 反馈。
   - 真实缺陷理由：执行操作无任何反馈，失败静默。

### chronometer
clean。start/stop/reset 状态机正确，interval 在 stop 与 onUnmounted 均清理，lap 在未运行时正确禁用。

### color-converter
1. **D8 / P3** `apps/web/src/tools/color-converter/ColorConverter.vue:19`
   - 触发：在 hex 输入框键入 `#fff`（合法 3 位简写）或 `#gggggg` 等非法值。
   - 期望：要么支持 3 位 hex，要么提示输入非法 / 实际：watch 的正则只认 6 位，输入被静默忽略，R/G/B 与预览保持旧值且不给出任何提示，用户误以为已生效。
   - 修复建议：支持 3 位展开，非法时给出校验状态。
   - 真实缺陷理由：非法输入被静默接受（忽略），无任何校验反馈。

2. **D5 / P3** `apps/web/src/tools/color-converter/ColorConverter.vue:54-55`
   - 触发：用户想取走 hsl()/rgb() 或 hex 值。
   - 期望：同类工具惯例提供复制 / 实际：三个结果均为 readonly 输入框，无复制按钮。
   - 修复建议：为 hex/hsl/rgb 输出加复制按钮并反馈。
   - 真实缺陷理由：主要产物无取走入口（D5 一致性）。

### compress-pdf
1. **D4 / P1** `apps/web/src/tools/compress-pdf/CompressPdf.vue:16-27`
   - 触发：上传一个损坏的/伪装成 .pdf 的文件（NUpload 的 accept 可被「所有文件」或拖放绕过），点击压缩。
   - 期望：解析失败应提示并复位 / 实际：`PDFDocument.load` 抛错成为未处理 rejection，`processing` 永远停留在 true，按钮永久 loading，工具在本会话内不可再用。
   - 修复建议：process() 整体 try/catch/finally，失败提示并将 processing 复位。
   - 真实缺陷理由：异常未处理导致交互死锁，功能不可用。

2. **D2 / P2** `apps/web/src/tools/compress-pdf/CompressPdf.vue:14,34`
   - 触发：完成一次压缩后（sizeResult 提示已显示），再选择新文件。
   - 期望：新文件就绪后旧结果应全部清除 / 实际：`onFile` 只清了 `resultUrl`，`origSize/newSize` 保留，界面继续显示上一份文件的大小对比提示，属于陈旧状态。
   - 修复建议：onFile 中同时重置 origSize/newSize。
   - 真实缺陷理由：输入变化后旧输出未清理，状态不同步。

3. **D7 / P2** `apps/web/src/tools/compress-pdf/CompressPdf.vue:33`
   - 触发：压缩执行中（按钮处于 loading）再次点击按钮。
   - 期望：执行期间应禁止重复触发 / 实际：naive-ui 的 `loading` 不会自动禁用点击，两次 process() 并发跑共享状态，结果互相覆盖、object URL 泄漏。
   - 修复建议：`:disabled="!file || processing"`。
   - 真实缺陷理由：长任务执行期间控件未禁用，可并发重复执行。

4. **D11 / P3** `apps/web/src/tools/compress-pdf/CompressPdf.vue:25`
   - 触发：多次压缩 / 切换文件 / 离开页面。
   - 期望：object URL 应被释放 / 实际：`URL.createObjectURL` 的结果从未 `revokeObjectURL`。
   - 修复建议：在替换与 onUnmounted 时 revoke。
   - 真实缺陷理由：资源生命周期未管理。

### connectivity-check
1. **D7 / P2** `apps/web/src/tools/connectivity-check/ConnectivityCheck.vue:34`
   - 触发：检测进行中（loading）再次点击「测试连通性」。
   - 期望：执行期间禁止重复执行 / 实际：`loading` 不自动禁用按钮，并发运行多个 test() 循环，互相清空并交错 push 结果，`testing` 被先完成者置 false。
   - 修复建议：`:disabled="testing"`。
   - 真实缺陷理由：执行期间可并发重复执行，结果交错污染。另：无超时/取消，某目标挂起时整个检测长时间无响应（D7 附加说明）。

### convert-to-jpg
1. **D4 / P1** `apps/web/src/tools/convert-to-jpg/ConvertToJpg.vue:17-27`
   - 触发：通过拖放或「所有文件」方式传入非图片文件（accept 仅为提示），点击转换。
   - 期望：解码失败应提示并复位 / 实际：只注册了 `img.onload`，`onerror` 缺失，`Image` 解码失败时 `processing` 永远为 true，按钮永久 loading，工具死锁。
   - 修复建议：增加 onerror 处理并在 finally 中复位 processing。
   - 真实缺陷理由：异常路径未处理，功能不可用且失败不可见。

2. **D11 / P3** `apps/web/src/tools/convert-to-jpg/ConvertToJpg.vue:27`
   - 触发：反复选择文件转换。
   - 期望：img 的 object URL 用后释放 / 实际：从未 revoke。
   - 修复建议：onload/onerror 中 revoke。
   - 真实缺陷理由：资源未释放。

### convert-to-pdf
1. **D4 / P1** `apps/web/src/tools/convert-to-pdf/ConvertToPdf.vue:19-26`
   - 触发：传入伪装成图片的损坏文件（accept 可绕过），点击转换。
   - 期望：解码失败应提示并复位 / 实际：无 `img.onerror`，`processing` 永久 loading，工具死锁。
   - 修复建议：补 onerror，finally 复位。
   - 真实缺陷理由：异常未处理导致交互死锁。

2. **D4 / P2** `apps/web/src/tools/convert-to-pdf/ConvertToPdf.vue:27`
   - 触发：传入非 image/* 类型文件（同样可绕过 accept），点击转换。
   - 期望：应提示「仅支持图片」 / 实际：走 else 分支静默什么都不做，也无结果无提示，用户无法区分「正在处理」与「不支持」。
   - 修复建议：else 分支给出错误提示。
   - 真实缺陷理由：失败静默，用户无感知。

3. **D11 / P3** `apps/web/src/tools/convert-to-pdf/ConvertToPdf.vue:23,26`
   - 触发：多次转换或离开页面。
   - 期望：object URL 用后释放 / 实际：从未 revoke。
   - 修复建议：替换与卸载时 revoke。
   - 真实缺陷理由：资源未释放。

### convert-to-webp
1. **D4 / P1** `apps/web/src/tools/convert-to-webp/ConvertToWebp.vue:17-25`
   - 触发：传入非图片文件（accept 可绕过），点击转换。
   - 期望：解码失败应提示并复位 / 实际：无 `img.onerror`，`processing` 永久 loading，工具死锁。
   - 修复建议：补 onerror，finally 复位。
   - 真实缺陷理由：异常未处理导致交互死锁。

2. **D11 / P3** `apps/web/src/tools/convert-to-webp/ConvertToWebp.vue:25`
   - 触发：多次转换或离开页面。
   - 期望：object URL 用后释放 / 实际：从未 revoke。
   - 修复建议：onload/onerror 中 revoke。
   - 真实缺陷理由：资源未释放。

### create-palindrome
clean。输出为输入+反转的实时计算，无状态残留；结果可直接框选复制。

### crontab-generator
1. **D6 / P2** `apps/web/src/tools/crontab-generator/crontab-generator.service.ts:212`
   - 触发：设置 Day of month 与 Day of week 均受限的表达式（如 `0 0 13 * 5`，每月 13 号且周五）。
   - 期望：标准 crontab 语义为 dom 与 dow 取「或」，下次执行时间应按 or 计算 / 实际：`!doms.includes(...) || !dows.includes(...)` 用的是 AND，用户照真实 crontab 语义配置时，「下次执行时间」表给出偏少的错误结果，会误导排程决策。
   - 修复建议：当 dom 与 dow 均非 `*` 时按 OR 语义跳过判断。
   - 真实缺陷理由：边界/逻辑错误，结果与真实 crontab 行为不符。

2. **D5 / P3** `apps/web/src/tools/crontab-generator/CrontabGenerator.vue:71-79`
   - 触发：生成表达式后想复制使用。
   - 期望：表达式是主要产物，惯例提供复制 / 实际：仅以 NTag 展示，无复制按钮。
   - 修复建议：加复制按钮并反馈。
   - 真实缺陷理由：主要产物取走不便（D5 一致性）。

### csv-change-separator
1. **D6 / P1** `apps/web/src/tools/csv-change-separator/CsvChangeSeparator.vue:18-29`
   - 触发：输入含引号包裹的逗号单元格（如 `"foo,bar",baz`），选择新分隔符 `;`。
   - 期望：输出应仍是合法的 2 列 CSV / 实际：解析时引号被吞掉（`inQ` 切换但不保留引号），重发时单元格 `foo,bar` 不含 `;` 故不加引号，输出 `foo,bar;baz`——按任何 CSV 解析器都是 3 列，数据被静默破坏。全空行也被 `.filter(r => r.some(c => c))` 静默删除。
   - 修复建议：解析时保留引号信息（或正确处理转义 `""`），输出按 RFC 4180 重新加引号。
   - 真实缺陷理由：静默产出结构性错误结果，下游解析列数错乱（结果错误，可误导决策）。

### csv-find-incomplete
1. **D6 / P2** `apps/web/src/tools/csv-find-incomplete/CsvFindIncomplete.vue:20,26`
   - 触发：输入 `a,b\n,,\nc,d`（中间一行全为空单元格的不完整行）。
   - 期望：该行应被报告为列数不足 / 实际：parseCSV 的 `filter(r => r.some(c => c))` 先把全空行整条删掉，缺失行从未进入检测，输出「all rows valid」，漏报真实的数据缺失。
   - 修复建议：分析用途的解析不应丢弃空行，或按原始行号逐行统计列数。
   - 真实缺陷理由：静默丢弃输入内容导致检查结果错误（漏报）。

### csv-insert-columns
1. **D6 / P1** `apps/web/src/tools/csv-insert-columns/CsvInsertColumns.vue:28-32`
   - 触发：输入含引号单元格（如 `"a,b",c`）执行插入。
   - 期望：列结构应保持 / 实际：解析吞掉引号后以 `,` 直接 join，单元格 `a,b` 被拆成两列输出，列错位；插入的 header/defVal 含逗号时同样破坏结构。全空行亦被静默删除。
   - 修复建议：输出时按 RFC 4180 对含分隔符/引号的单元格加引号转义。
   - 真实缺陷理由：静默产出列数错误的结果。

### csv-rows-to-columns
1. **D6 / P1** `apps/web/src/tools/csv-rows-to-columns/CsvRowsToColumns.vue:26`
   - 触发：输入含引号包裹逗号的单元格后转置。
   - 期望：转置后每行仍是原列数 / 实际：被引号保护的 `a,b` 以裸 `,` 重新 join，转置结果中该单元格裂成两列，行列错位；全空行被静默删除。
   - 修复建议：输出加引号转义；空行保留或提示。
   - 真实缺陷理由：静默产出结构错误结果。

### csv-swap-columns
1. **D6 / P2** `apps/web/src/tools/csv-swap-columns/CsvSwapColumns.vue:24-28`
   - 触发：①输入含引号包裹逗号的单元格；②某些行缺少目标列（`a >= r.length`）。
   - 期望：①转义保持列结构；②行未交换应提示 / 实际：①join 时引号丢失导致列裂变；②短行原样输出、交换未生效也无任何提示，用户难以察觉部分行未处理。
   - 修复建议：输出转义；对未应用的行给出计数/提示。
   - 真实缺陷理由：静默产出部分错误/未处理的结果。

### csv-to-json
1. **D3 / P2** `apps/web/src/tools/csv-to-json/CsvToJson.vue:26`
   - 触发：①数据行列数多于表头（`h1,h2\n1,2,3`）；②表头重名（`id,name,id`）。
   - 期望：多余数据/重名应提示 / 实际：多余列被 `headers.map((h,i)=>... r[i])` 静默截断丢弃；重复表头经 `Object.fromEntries` 后值互相覆盖，数据静默丢失，JSON 看似正常。
   - 修复建议：检测列数不一致与重复表头并提示。
   - 真实缺陷理由：静默丢弃用户数据。

### csv-to-tsv
clean。以制表符 join，引号内逗号不会在 TSV 中造成列裂变；空行过滤对 TSV 场景影响轻微，不构成可报告缺陷。

### csv-to-xml
1. **D6 / P1** `apps/web/src/tools/csv-to-xml/CsvToXml.vue:26`
   - 触发：单元格含 `&`、`<`、`>`（如 `Tom & Jerry`），或表头含空格等特殊字符（如 `first name`）。
   - 期望：应转义为合法 XML / 实际：值原样插入 `<tag>value</tag>`，生成 `Tom & Jerry` 等非法 XML；表头直接作为标签名，`<first name>` 非法，输出无法用任何 XML 解析器解析，且无任何提示。
   - 修复建议：对文本内容做 XML 转义，表头清洗为合法标签名（非法字符替换或加前缀）。
   - 真实缺陷理由：结果呈现为「XML」但实为非法文档，静默产出不可用结果。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| check-leap-years | 2 条（D8/P3、D5/P3） |
| chmod-calculator | 1 条（D5/P2） |
| chronometer | clean |
| color-converter | 2 条（D8/P3、D5/P3） |
| compress-pdf | 4 条（D4/P1、D2/P2、D7/P2、D11/P3） |
| connectivity-check | 1 条（D7/P2） |
| convert-to-jpg | 2 条（D4/P1、D11/P3） |
| convert-to-pdf | 3 条（D4/P1、D4/P2、D11/P3） |
| convert-to-webp | 2 条（D4/P1、D11/P3） |
| create-palindrome | clean |
| crontab-generator | 2 条（D6/P2、D5/P3） |
| csv-change-separator | 1 条（D6/P1） |
| csv-find-incomplete | 1 条（D6/P2） |
| csv-insert-columns | 1 条（D6/P1） |
| csv-rows-to-columns | 1 条（D6/P1） |
| csv-swap-columns | 1 条（D6/P2） |
| csv-to-json | 1 条（D3/P2） |
| csv-to-tsv | clean |
| csv-to-xml | 1 条（D6/P1） |
