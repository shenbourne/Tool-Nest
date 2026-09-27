# Batch 03

## 概要
- 审计工具数：19
- 发现：P0 1 条 / P1 2 条 / P2 18 条 / P3 2 条
- clean 工具：csv-transpose, dns-leak-test, extract-substring（dns-resolver 的 `catch{}` 缺陷已在已知样例中报告，本批不重复计数）

## 发现

### csv-to-yaml
1. **D3 / P2** `apps/web/src/tools/csv-to-yaml/CsvToYaml.vue:26`
   - 触发：输入表头列数少于数据行列数的 CSV，如 `a,b\n1,2,3`。
   - 期望：超出表头的数据单元格被保留或以某种方式提示 / 实际：`h.map((k,i) => ...)` 只按表头列数迭代，第 3 列的值 `3` 被静默丢弃，用户拿到的 YAML 缺数据且无任何提示。
   - 修复建议：遍历时取 `Math.max(h.length, ...rows.map(r=>r.length))`，多余的值以 `column_N` 之类键输出，或在列数不齐时给出警告。
   - 真实缺陷理由：转换结果静默丢数据，与已知样例 list-sort 静默删除空行同属一类。

2. **D12 / P2** `apps/web/src/tools/csv-to-yaml/CsvToYaml.vue:26`
   - 触发：单元格值包含 YAML 特殊字符（`:`、`#`、前导 `-`、引号、换行）或单元格本身为空，如 `a,b\n"x: y",2`。
   - 期望：输出合法 YAML / 实际：值被原样拼进 `key: value`，`a: x: y` 是无效 YAML；输出区无校验，用户可能把坏 YAML 直接拿去用。
   - 修复建议：用 js-yaml 的 `dump` 生成（参照 docker-compose-to-1panel.service.ts），不要手工拼字符串。
   - 真实缺陷理由：结果呈现错误——输出物是无效 YAML 且不告知用户。

### csv-transpose
clean。

### date-time-converter
1. **D5 / P2** `apps/web/src/tools/date-time-converter/DateTimeConverter.vue:34-36`
   - 触发：点击任意复制按钮（或点击结果输入框）。
   - 期望：复制成功/失败有反馈，剪贴板不可用（非安全上下文）时不静默 / 实际：`navigator.clipboard.writeText(text)` 无 try/catch（浮动 promise），无成功提示，失败完全不可见。
   - 修复建议：包 try/catch 并弹 `message.success/error`（与 hash-text 已知样例同型）。
   - 真实缺陷理由：复制失败不可见，用户可能贴了旧内容而不自知。

2. **D6 / P2** `apps/web/src/tools/date-time-converter/date-time-converter.service.ts:72-78`
   - 触发：auto 模式下输入 11~12 位的毫秒时间戳，如 `999999999999`（2001-11 的合法毫秒时间戳）。
   - 期望：识别为毫秒 / 实际：`asNumber > 1e12` 才按毫秒解析，1e11~1e12 之间的值落入 `> 1e8` 分支被当作秒，输出年份 33658 之类的荒谬结果且无提示。
   - 修复建议：按位数/量级综合判断（如 ≥1e11 一律按毫秒），或解析后校验结果是否在合理时间范围内，不合理时换另一种解释并提示。
   - 真实缺陷理由：合法输入产出明显错误结果，auto 是默认模式。

### date-weekday-calculator
1. **D6 / P0** `apps/web/src/tools/date-weekday-calculator/DateWeekdayCalculator.vue:8,19-21`
   - 触发：处于 UTC 负偏移时区的用户输入任意日期，如 `2024-03-10`（用户在当地已是 3 月 10 日时默认值本身就是前一天的 UTC 日期）。
   - 期望：显示所输日期的正确星期 / 实际：`new Date("2024-03-10")` 按 UTC 午夜解析，西半球用户当地时间为 3 月 9 日晚，`getDay()` 返回**前一天**的星期；默认初值 `toISOString().slice(0,10)` 也是 UTC 日期，东半球凌晨本地用户打开页面看到的就是错的日期。
   - 修复建议：按 `YYYY-MM-DD` 手动拆分后用 `new Date(y, m-1, d)` 本地构造；默认值用本地日期拼接。
   - 真实缺陷理由：结果错误（星期差一天），会误导决策，P0。

2. **D12 / P2** `apps/web/src/tools/date-weekday-calculator/DateWeekdayCalculator.vue:20-21`
   - 触发：输入非日期文本（如 `abc`）。
   - 期望：错误提示与结果区分离 / 实际：`common.invalidDate` 文案被写进结果输入框，复制结果会把错误文案一并带走。
   - 修复建议：用 NAlert 展示错误，结果区保持为空。
   - 真实缺陷理由：与已知样例 text-replacer 同型（错误文案写入输出区）。

### days-to-hours
1. **D6 / P2** `apps/web/src/tools/days-to-hours/DaysToHours.vue:10-11`
   - 触发：输入 `3abc`、`1,5` 或多行文本（textarea 支持多行）如 `1\n2`。
   - 期望：校验整串输入合法 / 实际：`parseFloat` 只消费前缀数字，`3abc`→按 3 天计算、`1,5`→按 1 天计算、多行只取首行，均无任何提示，输出错误结果。
   - 修复建议：用 `Number()` 整串校验，非纯数字（或逐行处理多行）时给出提示。
   - 真实缺陷理由：非法/意外输入被静默接受并产出错误结果。

### discord-timestamp
1. **D6 / P1** `apps/web/src/tools/discord-timestamp/DiscordTimestamp.vue:8,19-21`
   - 触发：不做任何修改，直接使用默认值生成时间戳（默认值即错）；或任何用户不理解初值是 UTC 的情况。
   - 期望：默认值表示"现在"，生成的时间戳与现在一致 / 实际：初值取 `new Date().toISOString().slice(0,16)`（UTC 时间字符串，丢弃了 `Z`），而 `new Date("YYYY-MM-DDTHH:mm")` 无偏移时按**本地**解析——默认状态下生成的时间戳系统性偏移一个时区（如 UTC+8 用户得到 8 小时前的时间）。
   - 修复建议：初值用本地时间格式化（如 dayjs().format('YYYY-MM-DDTHH:mm') 或手动拼本地分量）。
   - 真实缺陷理由：默认状态即产出错误结果，用户毫无察觉。

2. **D12 / P2** `apps/web/src/tools/discord-timestamp/DiscordTimestamp.vue:20`
   - 触发：输入非法日期文本。
   - 期望：错误提示独立于结果 / 实际：`common.invalidDate` 文案写入结果 textarea，复制输出会带走错误文案。
   - 修复建议：改用 NAlert 展示错误。
   - 真实缺陷理由：与 text-replacer 已知样例同型。

### dns-leak-test
clean（错误有 NAlert、按钮有 loading、失败有区分提示）。

### dns-resolver
已在已知样例中报告（`DnsResolver.vue:19` `catch {}` 吞异常，D4/P1），本批不重复。

### docker-compose-to-1panel
1. **D5 / P2** `apps/web/src/tools/docker-compose-to-1panel/DockerComposeTo1panel.vue:52-56`
   - 触发：点击输出卡片上的复制按钮。
   - 期望：复制有成功/失败反馈 / 实际：`navigator.clipboard.writeText` 无 try/catch、无提示，浮动 promise。
   - 修复建议：加 try/catch + message 反馈。
   - 真实缺陷理由：与 hash-text 已知样例同型。

### docker-run-to-compose
1. **D6 / P1** `apps/web/src/tools/docker-run-to-compose/docker-run-to-compose.service.ts:102-108`
   - 触发：输入包含**不带值的布尔 flag** 的合法命令，如 `docker run --rm nginx`、`docker run -it --name app nginx`。
   - 期望：正常生成 compose / 实际：未知 flag 分支会把后一个"不以 `-` 开头的 token"当作该 flag 的值跳过——`--rm` 后面的 `nginx` 被吞掉，最终报 `errorNoImage`；合法命令无法转换。
   - 修复建议：为 `--rm`、`-it`、`-ti`、`--detach` 等已知布尔 flag 建白名单直接跳过；未知 flag 的取值跳过只对确认带值的 flag 生效，或在吞掉 token 前校验其是否为镜像名。
   - 真实缺陷理由：常见合法输入直接报错，功能不可用。

2. **D5 / P2** `apps/web/src/tools/docker-run-to-compose/DockerRunToCompose.vue:16-20`
   - 触发：点击复制按钮。
   - 期望：有成功/失败反馈 / 实际：无 try/catch、无提示。
   - 修复建议：加 try/catch + message 反馈。

### email-extractor
1. **D12 / P2** `apps/web/src/tools/email-extractor/EmailExtractor.vue:11`
   - 触发：输入不包含任何邮箱的文本。
   - 期望：结果区为空 + 单独提示"未找到邮箱" / 实际：`noEmailsFound` 提示文案被写进结果 textarea，用户全选复制输出会把这句提示当作"提取结果"粘贴走。
   - 修复建议：结果区仅在有匹配时显示，提示用 NAlert/空态文案。
   - 真实缺陷理由：与 text-replacer 已知样例同型（错误/提示文案写入输出区）。

### email-normalizer
1. **D5 / P2** `apps/web/src/tools/email-normalizer/EmailNormalizer.vue:20-24`
   - 触发：点击复制按钮。
   - 期望：复制有反馈 / 实际：无 try/catch、无提示，浮动 promise。
   - 修复建议：加 try/catch + message 反馈。

### emoji-picker
1. **D5 / P2** `apps/web/src/tools/emoji-picker/EmojiPicker.vue:20`
   - 触发：点击任意 emoji 按钮。
   - 期望：复制成功有反馈 / 实际：`navigator.clipboard.writeText` 无 try/catch、无提示，用户无法确认点击是否生效。
   - 修复建议：加 try/catch + message 反馈（或临时改变按钮态）。

2. **D5 / P3** `apps/web/src/tools/emoji-picker/EmojiPicker.vue:19,26-28`
   - 触发：搜索一个不存在的名称（如 `xyz`）。
   - 期望：显示"无结果"空态 / 实际：emoji 网格静默清空，用户无法区分"无结果"和"组件坏了"。
   - 修复建议：`filtered` 为空时渲染空态文案。
   - 真实缺陷理由：反馈缺失，轻微。

### encryption
1. **D2 / P2** `apps/web/src/tools/encryption/EncryptionTool.vue:22,25-33,51-58`
   - 触发：解密成功后，修改密文、算法或密钥输入框（不点解密按钮）。
   - 期望：输出随输入失效或被清空 / 实际：旧明文一直显示在输出区，与当前输入完全无关，用户可能复制走与当前密钥不匹配的陈旧结果。
   - 修复建议：解密输出改为 computed（catch 时返回空+错误态），或在任一输入 watch 时清空 `decryptOutput`。
   - 真实缺陷理由：状态不同步/陈旧状态。

2. **D5 / P2** `apps/web/src/tools/encryption/EncryptionTool.vue:35`
   - 触发：点击加密区复制按钮。
   - 期望：复制反馈 / 实际：无 try/catch、无提示。
   - 修复建议：加 try/catch + message 反馈。

### eta-calculator
1. **D6 / P2** `apps/web/src/tools/eta-calculator/eta-calculator.service.ts:22-23`（配合 `EtaCalculator.vue:37`）
   - 触发：清空"已完成任务"输入框（NInputNumber 清空后为 `null`，`:min="0"` 不阻止 null）。
   - 期望：结果区隐藏或提示输入 / 实际：`null < 0` 与 `null > totalTasks` 均为 false，校验被绕过，`remainingTasks = total - null = NaN`，界面显示 `NaN%`、`NaN 任务`、结束时间为 NaN。
   - 修复建议：service 的守卫改用 `!Number.isFinite(totalTasks) || !Number.isFinite(completedTasks)` 判断。
   - 真实缺陷理由：常规操作（清空输入）导致界面输出 NaN。

### extract-substring
clean。

### generic-calculator
1. **D12 / P2** `apps/web/src/tools/generic-calculator/GenericCalculator.vue:51`
   - 触发：输入非法表达式（如 `2+*3`）点计算。
   - 期望：错误提示与结果区分离 / 实际：`errorPrefix + message` 被写进结果输入框，复制结果会带走错误文案。
   - 修复建议：错误用 NAlert 展示。
   - 真实缺陷理由：与 text-replacer 已知样例同型。

2. **D6 / P2** `apps/web/src/tools/generic-calculator/GenericCalculator.vue:25`
   - 触发：输入含除零的表达式，如 `5/0`、`1/(3-3)`。
   - 期望：提示除数为零 / 实际：JS 语义产生 `Infinity`/`NaN`，结果区直接显示 `Infinity` 或 `NaN`，无任何错误提示。
   - 修复建议：检测非有限结果并给出错误提示。
   - 真实缺陷理由：除零是 D6 明确列举项，静默输出 Infinity 属结果错误呈现。

3. **D8 / P2** `apps/web/src/tools/generic-calculator/GenericCalculator.vue:38-43`
   - 触发：输入语法残缺/畸形的表达式，如 `2*(3`（右括号缺失）或 `1.2.3`。
   - 期望：报语法错误 / 实际：`2*(3` 静默算出 6（右括号缺失被忽略）；`1.2.3` 被 `parseFloat` 消费为 1.2 且不报尾部错误（num 一次性吞掉全部合法字符后 pos 已到末尾）。非法输入静默产出"看起来正确"的结果。
   - 修复建议：`parsePrimary` 在 `(` 分支强制要求 `)`（缺失即 throw）；数字解析限定最多一个小数点。
   - 真实缺陷理由：输入校验缺失，残缺输入被静默接受。

### gif-change-speed
1. **D11 / P2** `apps/web/src/tools/gif-change-speed/GifChangeSpeed.vue:9`（配合 `src/composables/useFFmpeg.ts:88-95`）
   - 触发：加载 FFmpeg 后离开该工具页面（dispose 在项目中无任何调用方）。
   - 期望：组件卸载时终止 wasm worker / 实际：`sharedInstance` 为模块级共享，worker 常驻，多次进出工具页后残留的 FFmpeg worker 持续占用内存与 CPU 配额，且无重新加载途径（isLoaded 恒 true）。
   - 修复建议：在 `onUnmounted` 调用 `dispose()`，或由路由层统一释放。
   - 真实缺陷理由：worker 未在卸载时释放，D11 明确列举项。

2. **D7 / P3** `apps/web/src/tools/gif-change-speed/GifChangeSpeed.vue:43-72,102`
   - 触发：对大 GIF 执行变速。
   - 期望：长任务有进度或可取消 / 实际：仅有一个静态"处理中"提示，无进度百分比、无取消按钮，用户只能等或刷新。
   - 修复建议：`runFFmpegTask` 已透传 ffmpeg 实例，可订阅 `progress` 事件并加取消（`ffmpeg.terminate()` + 重新 load）。
   - 真实缺陷理由：长任务交互缺失，轻微（有 loading 禁用按钮，无并发问题）。

### git-memo
1. **D5 / P2** `apps/web/src/tools/git-memo/GitMemo.vue:92-94,111`
   - 触发：点击任意命令行（整行点击即复制）。
   - 期望：复制有反馈 / 实际：无 try/catch、无提示，用户点击后完全无法确认是否已复制。
   - 修复建议：加 try/catch + message 反馈。
   - 真实缺陷理由：整行可点击是隐藏交互，无反馈时点击行为如同死控件。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| csv-to-yaml | 2 条（D3/P2、D12/P2） |
| csv-transpose | clean |
| date-time-converter | 2 条（D5/P2、D6/P2） |
| date-weekday-calculator | 2 条（D6/P0、D12/P2） |
| days-to-hours | 1 条（D6/P2） |
| discord-timestamp | 2 条（D6/P1、D12/P2） |
| dns-leak-test | clean |
| dns-resolver | 已知样例（D4/P1），不重复 |
| docker-compose-to-1panel | 1 条（D5/P2） |
| docker-run-to-compose | 2 条（D6/P1、D5/P2） |
| email-extractor | 1 条（D12/P2） |
| email-normalizer | 1 条（D5/P2） |
| emoji-picker | 2 条（D5/P2、D5/P3） |
| encryption | 2 条（D2/P2、D5/P2） |
| eta-calculator | 1 条（D6/P2） |
| extract-substring | clean |
| generic-calculator | 3 条（D12/P2、D6/P2、D8/P2） |
| gif-change-speed | 2 条（D11/P2、D7/P3） |
| git-memo | 1 条（D5/P2） |
