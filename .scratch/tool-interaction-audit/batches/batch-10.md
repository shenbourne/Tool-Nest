# Batch 10

## 概要
- 审计工具数：19
- 发现：P0 0 条 / P1 4 条 / P2 16 条 / P3 1 条
- clean 工具：text-statistics, text-truncate, time-between-dates, tsv-to-json

## 发现

### text-to-binary
1. **D8 / P2** `apps/web/src/tools/text-to-binary/text-to-binary.service.ts:9-11`
   - 触发：在「binary → text」输入框键入含非 0/1 字符的二进制，如 `0100000102`（多打一个 2）或 `0100 0001xyz`
   - 期望：非法字符应使输入被判定为无效（error 状态）或至少提示被忽略 / 实际：`convertAsciiBinaryToText` 先用 `replace(/[^01]/g, '')` 静默删除所有非法字符，剩余长度若恰好是 8 的倍数即被判定「有效」并解码出错误文本；界面不显示任何警告，用户得到的是与输入不符的结果
   - 修复建议：解析前先校验原始输入只含空白与 0/1，否则抛错并在 UI 显示错误信息
   - 真实缺陷理由：非法输入被静默接受并产出错误结果，违反 D8
2. **D4 / P2** `apps/web/src/tools/text-to-binary/TextToBinary.vue:16-25,47-49`
   - 触发：输入长度不是 8 的倍数的二进制（如 `0101`）
   - 期望：告知用户输入无效 / 实际：`textFromBinary` 的 catch 返回 `''`，输入框仅有红色边框（status=error），`binaryError` ref 声明后从未使用，无任何错误文案；解码失败与「输入为空」在输出区不可区分
   - 修复建议：catch 时设置 errorMsg 并展示，区分空输入与失败
   - 真实缺陷理由：解析失败无提示，失败与无结果不可区分（同类问题见已知样例 DnsResolver）
3. **D5 / P2** `apps/web/src/tools/text-to-binary/TextToBinary.vue:27-32`
   - 触发：点击任一「复制」按钮
   - 期望：复制成功/失败有反馈 / 实际：`navigator.clipboard.writeText` 无 try/catch、无成功提示；剪贴板不可用时静默失败
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：与已知样例 hash-text 同类

### text-to-nato-alphabet
1. **D5 / P2** `apps/web/src/tools/text-to-nato-alphabet/TextToNatoAlphabet.vue:15-17`
   - 触发：点击「复制」
   - 期望：有成功/失败反馈 / 实际：无 try/catch、无提示，剪贴板 API 不可用时静默失败
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：复制操作无任何结果反馈

### text-to-unicode
1. **D5 / P2** `apps/web/src/tools/text-to-unicode/TextToUnicode.vue:18-24`
   - 触发：点击任一「复制」按钮
   - 期望：有成功/失败反馈 / 实际：无 try/catch、无提示，失败静默
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：复制操作无任何结果反馈

### time-to-decimal
1. **D8 / P2** `apps/web/src/tools/time-to-decimal/TimeToDecimal.vue:9-14`
   - 触发：输入越界值如 `0:90`（90 分钟）、`-1:30` 或多余段 `1:2:3:4`
   - 期望：分钟/秒超 59、负数应提示非法 / 实际：无上下界校验，`0:90` 直接输出 `1.5000 hours` 并标注为合法结果；`1:2:3:4` 的第 4 段被静默丢弃
   - 修复建议：校验 0≤m,s≤59、段数≤3、非负，非法时显示提示而非输出数值
   - 真实缺陷理由：非法输入被静默接受并产出标注为正确的结果（D8 边界/约束缺失）

### time-to-seconds
1. **D8 / P2** `apps/web/src/tools/time-to-seconds/TimeToSeconds.vue:9-13`
   - 触发：输入 `0:90`、`-1:30` 或 `1:2:3:4`
   - 期望：越界/负值/多余段应提示非法 / 实际：与 time-to-decimal 同一缺陷——无范围与段数校验，非法输入产出看似正确的秒数结果
   - 修复建议：同上，加范围/段数/符号校验
   - 真实缺陷理由：非法输入被静默接受并产出错误结果

### token-generator
1. **D1 / P1** `apps/web/src/tools/token-generator/TokenGenerator.vue:20,55`
   - 触发：点击「重试」(retry) 按钮
   - 期望：重新生成一个 token / 实际：`refresh()` 仅执行 `length.value = length.value`，赋相同值不触发任何响应式更新，token 不变——按钮是死控件
   - 修复建议：引入 `seed`/`nonce` ref 纳入 computed 依赖，refresh 时自增
   - 真实缺陷理由：控件存在但点击不改变任何状态（D1）
2. **D5 / P2** `apps/web/src/tools/token-generator/TokenGenerator.vue:21`
   - 触发：点击「复制」
   - 期望：成功/失败反馈 / 实际：无 try/catch、无提示
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：复制无反馈
3. **D8 / P3** `apps/web/src/tools/token-generator/TokenGenerator.vue:21,54`
   - 触发：关闭全部四个字符集开关后点击「复制」
   - 期望：禁用复制或提示需至少开启一个字符集 / 实际：`createToken` 返回 `''`，复制按钮未 disabled，点击把空字符串写入剪贴板，无任何提示
   - 修复建议：`:disabled="!token"` 或提示
   - 真实缺陷理由：空结果被静默复制，无任何提示

### toml-to-json
1. **D5 / P2** `apps/web/src/tools/toml-to-json/TomlToJson.vue:16-18`
   - 触发：点击「复制」
   - 期望：成功/失败反馈 / 实际：无 try/catch、无提示
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：复制无反馈（解析错误有 NAlert 展示，其余逻辑正确）

### toml-to-yaml
1. **D5 / P2** `apps/web/src/tools/toml-to-yaml/TomlToYaml.vue:16-18`
   - 触发：点击「复制」
   - 期望：成功/失败反馈 / 实际：无 try/catch、无提示
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：复制无反馈

### truncate-clock-time
1. **D8 / P2** `apps/web/src/tools/truncate-clock-time/TruncateClockTime.vue:9-17`
   - 触发：输入 `12:99:30` 或 `25:00:00`
   - 期望：分钟>59、小时>23 应提示非法 / 实际：无范围校验，输出 `12:99:30 原始值` 等三行，把非法时间标注为合法结果展示
   - 修复建议：加 h≤23、m,s≤59 校验，非法时显示提示
   - 真实缺陷理由：非法输入被静默接受并产出错误结果

### ulid-generator
1. **D1 / P1** `apps/web/src/tools/ulid-generator/UlidGenerator.vue:16,29`
   - 触发：点击「重试」按钮
   - 期望：重新生成 ULID / 实际：`refresh()` 为 `count.value = count.value` 空操作，ULID 列表不变——死控件
   - 修复建议：引入 nonce ref 纳入 computed 依赖
   - 真实缺陷理由：控件存在但不改变状态
2. **D5 / P2** `apps/web/src/tools/ulid-generator/UlidGenerator.vue:15`
   - 触发：点击「复制」
   - 期望：成功/失败反馈 / 实际：无 try/catch、无提示
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：复制无反馈

### url-encoder
1. **D4 / P1** `apps/web/src/tools/url-encoder/UrlEncoder.vue:10,26`
   - 触发：在输入框键入非法百分号编码，如 `100%` 或 `%E0%A4%A`
   - 期望：提示解码失败 / 实际：`decodeURIComponent` 抛错被 `catch` 吞掉返回 `''`，decode 区空白，与「输入为空/无可解码内容」完全不可区分；无错误提示 UI
   - 修复建议：catch 时设置 errorMsg 并以 NAlert 展示，decode 输出区保持占位提示
   - 真实缺陷理由：异常被静默吞掉，失败不可见（与已知样例 DnsResolver 同类，D4/P1）

### url-parser
1. **D6 / P2** `apps/web/src/tools/url-parser/UrlParser.vue:41-45`
   - 触发：解析含重复 query 参数的 URL，如 `?a=1&a=2&b=3`
   - 期望：每个参数行正确渲染 / 实际：`v-for` 的 `:key="p.key"` 使用参数名，重复键导致 Vue key 重复警告，DOM 复用错乱，重复项可能显示错误值或渲染异常
   - 修复建议：key 改用 index 或 `k + index`
   - 真实缺陷理由：key 冲突造成真实渲染错误，有明确触发条件

### user-agent-parser
1. **D5 / P2** `apps/web/src/tools/user-agent-parser/UserAgentParser.vue:15-19,37`
   - 触发：点击「复制」（复制的是输入框 UA 字符串）
   - 期望：成功/失败反馈 / 实际：无 try/catch、无提示
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：复制无反馈

### uuid-generator
1. **D1 / P1** `apps/web/src/tools/uuid-generator/UuidGenerator.vue:16,29`
   - 触发：点击「重试」按钮
   - 期望：重新生成 UUID / 实际：`refresh()` 为 `count.value = count.value` 空操作，UUID 不变——死控件
   - 修复建议：引入 nonce ref 纳入 computed 依赖
   - 真实缺陷理由：控件存在但不改变状态
2. **D5 / P2** `apps/web/src/tools/uuid-generator/UuidGenerator.vue:15`
   - 触发：点击「复制」
   - 期望：成功/失败反馈 / 实际：无 try/catch、无提示
   - 修复建议：try/catch + message 反馈
   - 真实缺陷理由：复制无反馈

### video-add-audio
1. **D7 / P2** `apps/web/src/tools/video-add-audio/VideoAddAudio.vue:98-107`
   - 触发：选择大视频后点击「添加音频」，FFmpeg 执行期间
   - 期望：显示处理进度或提供取消 / 实际：仅有静态「processing」提示，无进度（ffmpeg 的 progress 事件已在 useFFmpeg 中监听但未在处理阶段展示），无取消按钮；长任务期间用户无法估计剩余时间只能等待
   - 修复建议：处理期间复用 loadProgress 展示进度条，并考虑暴露 ffmpeg.terminate/取消能力
   - 真实缺陷理由：长任务无进度/无取消（并发已由 runFFmpegTask 队列与按钮 loading 规避，故不升 P1）

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| text-statistics | clean |
| text-to-binary | D8/P2、D4/P2、D5/P2 |
| text-to-nato-alphabet | D5/P2 |
| text-to-unicode | D5/P2 |
| text-truncate | clean |
| time-between-dates | clean |
| time-to-decimal | D8/P2 |
| time-to-seconds | D8/P2 |
| token-generator | D1/P1、D5/P2、D8/P3 |
| toml-to-json | D5/P2 |
| toml-to-yaml | D5/P2 |
| truncate-clock-time | D8/P2 |
| tsv-to-json | clean |
| ulid-generator | D1/P1、D5/P2 |
| url-encoder | D4/P1 |
| url-parser | D6/P2 |
| user-agent-parser | D5/P2 |
| uuid-generator | D1/P1、D5/P2 |
| video-add-audio | D7/P2 |
