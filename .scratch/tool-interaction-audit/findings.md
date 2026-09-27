# 工具交互逻辑审计 · 问题清单

> 分支 `tool-interaction-audit` ｜ 判定标准与分类见 `spec.md` ｜ 状态：**待确认**
> 范围：`apps/web/src/tools/` 下 209 个工具组件，100% 覆盖。本节所有条目均带 `文件:行号` 与触发条件。

## 一、总览

- 覆盖工具：**209 / 209**（每工具均有 clean 或问题数结论）
- 发现问题：**233** 条 ｜ P0 5 · P1 39 · P2 129 · P3 60
- 干净工具：55 个
- 说明：`hash-text`、`dns-resolver`、`list-sort`、`text-replacer` 被用作分派审计时的校准样例，其缺陷由人工逐条复核确认后计入本清单。

### 按分类

| 分类 | 含义 | 条数 |
| --- | --- | --- |
| D1 | 死控件/无效交互 | 8 |
| D2 | 状态不同步/陈旧状态 | 9 |
| D3 | 数据丢失/破坏性操作 | 12 |
| D4 | 异常未处理/静默失败 | 21 |
| D5 | 反馈缺失 | 61 |
| D6 | 边界/逻辑错误 | 41 |
| D7 | 长任务交互 | 10 |
| D8 | 输入校验缺失 | 19 |
| D9 | 键盘/无障碍交互 | 7 |
| D10 | 模式/选项一致性 | 1 |
| D11 | 资源生命周期 | 29 |
| D12 | 结果呈现错误 | 15 |

### 按严重度

| 严重度 | 含义 | 条数 |
| --- | --- | --- |
| P0 | 结果错误/数据丢失，会误导决策 | 5 |
| P1 | 功能不可用或失败不可见 | 39 |
| P2 | 可用但有明显缺失 | 129 |
| P3 | 一致性/体验细节 | 60 |

## 二、系统性问题（跨工具重复出现，建议统一修复）

这些问题源于同一份代码/同一习惯被复制到多个工具，集中修复收益最高。

- **D5 复制/执行无成功或失败反馈（含 `navigator.clipboard` 无 try/catch）** — 61 条，60 个工具：base64-encoder, case-converter, chmod-calculator, date-time-converter, docker-compose-to-1panel, docker-run-to-compose, email-normalizer, emoji-picker, encryption, git-memo, hash-text, hmac-generator, html-wysiwyg-editor, image-to-text-ocr, info-masking, ipv4-address-converter, ipv6-ula-generator, json-minify, json-prettify, json-to-csv, json-to-toml, json-to-xml, json-to-yaml, json-viewer, keycode-info, list-converter, lorem-ipsum, mac-address-generator, markdown-to-html, meta-tag-generator, mime-types, otp-generator, qr-code-generator, random-port-generator, roman-numeral-converter, rsa-key-pair-generator, safelink-decoder, sql-prettify, svg-placeholder-generator, text-to-binary, text-to-nato-alphabet, text-to-unicode, token-generator, toml-to-json, toml-to-yaml, ulid-generator, user-agent-parser, uuid-generator, xml-formatter, xml-to-json, yaml-to-json, yaml-to-toml, yaml-viewer, base64-file-converter, bip39-generator, check-leap-years, color-converter, crontab-generator, numeronym-generator, screenshot-share
- **D11 `URL.createObjectURL` / interval / 监听 / 媒体流未在卸载或替换时释放** — 29 条，29 个工具：gif-change-speed, pdf-extract-images, webrtc-detection, camera-recorder, compress-pdf, convert-to-jpg, convert-to-pdf, convert-to-webp, image-change-colors, image-change-opacity, image-compress, image-create-transparent, image-crop, image-editor, image-flip, image-remove-background, image-resize, image-rotate, image-split, image-to-text-ocr, image-watermark, pdf-editor, pdf-merge, pdf-protect, video-compress, video-flip, video-resize, video-rotate, video-trim
- **D6 边界与逻辑错误：数字/字符串比较、空值与负数、除零、部分解析截断** — 41 条，40 个工具：date-weekday-calculator, info-masking, list-group, random-number-generator, base-converter, csv-change-separator, csv-insert-columns, csv-rows-to-columns, csv-to-xml, discord-timestamp, docker-run-to-compose, math-evaluator, number-generator, video-change-speed, video-loop, xml-formatter, crontab-generator, csv-find-incomplete, csv-swap-columns, date-time-converter, days-to-hours, eta-calculator, generic-calculator, hidden-char-detector, json-sort, json-to-yaml, list-converter, list-sort, mac-lookup, morse-code, number-sum, pdf-rotate, url-parser, arithmetic-sequence, image-watermark, json-diff, json-escape, percentage-calc, roman-numeral-converter, text-censor
- **D12 错误被当作结果呈现（错误文案写入输出区、类型/单位错标）** — 15 条，15 个工具：pdf-protect, bcrypt, csv-to-yaml, date-weekday-calculator, discord-timestamp, email-extractor, generic-calculator, json-escape, json-sort, json-stringify, math-evaluator, password-generator, service-status, text-replacer, webrtc-detection
- **D4 异常被 `catch {}` 吞掉，失败与「无结果」不可区分** — 21 条，20 个工具：basic-auth-generator, compress-pdf, convert-to-jpg, convert-to-pdf, convert-to-webp, dns-resolver, image-watermark, pdf-protect, pdf-rotate, pdf-split, speed-test, url-encoder, benchmark-builder, ip-info, jpg-to-png, qr-code-generator, text-to-binary, whois-lookup, wifi-qr-code-generator, image-split
- **D3 静默丢弃或覆盖用户数据（空行、多余列、原文被清空）** — 12 条，11 个工具：list-sort, base64-encoder, csv-to-json, csv-to-yaml, list-duplicate, list-shuffle, list-truncate, text-join, camera-recorder, image-editor, list-group
- **D8 非法输入被静默接受并产出错误或损坏产物** — 19 条，18 个工具：number-generator, random-number-generator, base64-file-converter, generic-calculator, hours-to-days, image-crop, number-to-words, pdf-split, seconds-to-time, svg-placeholder-generator, text-to-binary, time-to-decimal, time-to-seconds, truncate-clock-time, check-leap-years, color-converter, morse-code, token-generator
- **D1 死控件：按钮点击不改变任何状态** — 8 条，8 个工具：bip39-generator, html-wysiwyg-editor, mac-address-generator, token-generator, ulid-generator, uuid-generator, image-create-transparent, image-editor
- **D7 主线程长任务无取消/无超时，执行期间未禁用控件** — 10 条，10 个工具：bcrypt, benchmark-builder, compress-pdf, connectivity-check, rsa-key-pair-generator, video-add-audio, gif-change-speed, mtr-test, pdf-extract-images, speed-test
- **D2 选项/模式变更后依赖结果未重算** — 9 条，9 个工具：image-editor, image-split, otp-generator, compress-pdf, encryption, pdf-editor, pdf-merge, qr-code-generator, images-to-gif
- **D9 键盘交互缺失或全局 `preventDefault` 破坏浏览器快捷键** — 7 条，7 个工具：keycode-info, ping-test, rule-test, global-latency-test, mac-lookup, otp-generator, whois-lookup
- **D10 默认值与文案/行为不符** — 1 条，1 个工具：random-port-generator

## 三、P0 明细（5 条）

### `date-weekday-calculator` — D6/P0

- 位置：`apps/web/src/tools/date-weekday-calculator/DateWeekdayCalculator.vue:8,19-21`
- 触发：处于 UTC 负偏移时区的用户输入任意日期，如 `2024-03-10`（用户在当地已是 3 月 10 日时默认值本身就是前一天的 UTC 日期）。
- 期望：显示所输日期的正确星期
- 实际：`new Date("2024-03-10")` 按 UTC 午夜解析，西半球用户当地时间为 3 月 9 日晚，`getDay()` 返回**前一天**的星期；默认初值 `toISOString().slice(0,10)` 也是 UTC 日期，东半球凌晨本地用户打开页面看到的就是错的日期。
- 建议：按 `YYYY-MM-DD` 手动拆分后用 `new Date(y, m-1, d)` 本地构造；默认值用本地日期拼接。
- 判定理由：结果错误（星期差一天），会误导决策，P0。

### `info-masking` — D6/P0

- 位置：`apps/web/src/tools/info-masking/info-masking.service.ts:55-65`
- 触发：将「保留末尾（preserveLast）」设为 0（NInputNumber `:min="0"` 允许），输入任意含敏感信息的文本。
- 期望：不保留末尾字符，中间全部打码。
- 实际：`value.slice(-0)` 等价于 `slice(0)` 返回**整个原始字符串**，输出变为 `前2字符 + 掩码 + 完整原文`，输出比输入更长且**完整泄露了本应脱敏的内容**。
- 建议：`const last = preserveLast > 0 ? value.slice(-preserveLast) : '';`。
- 判定理由：已由人工复核确认：`slice(-0)` 返回整串，脱敏输出完整包含原文，属于结果错误且泄露敏感数据，故升级为 P0。

### `list-group` — D6/P0

- 位置：`apps/web/src/tools/list-group/ListGroup.vue:12-17,23`
- 触发：输入任意列表后，清空「分组大小」NInputNumber（值为 `null`）。
- 期望：空值时回退默认值或禁用计算。
- 实际：`for (let i = 0; i < items.length; i += size.value)` 中 `size.value` 为 `null`，`i += null` 使 `i` 永远不变 → 死循环无限 `groups.push(...)`，computed 不返回，标签页直接卡死。
- 建议：`const s = size.value ?? 3`（或 `:default-value` 并在模板判空），保证步长为正整数。
- 判定理由：一个清空操作即可冻结整个页面，属阻断级边界缺陷。

### `list-sort` — D3/P0

- 位置：`apps/web/src/tools/list-sort/ListSort.vue:11`
- 触发：输入含空行的多行列表（如 `b\n\na`）。
- 期望：保留空行或明确提示将忽略空行。
- 实际：`.split('\n').filter(Boolean)` 静默删除所有空行，排序结果比输入少行，用户无从察觉数据被丢弃。
- 建议：去掉 `filter(Boolean)`，改为对空行原样排序或提供「忽略空行」开关。
- 判定理由：排序工具静默丢行属数据丢失，会误导以行数对齐的后续处理。人工复核确认。

### `random-number-generator` — D6/P0

- 位置：`apps/web/src/tools/random-number-generator/RandomNumberGenerator.vue:14-16`
- 触发：关闭 unique，设置 min=10、max=6（min>max 且可取值个数少于 count，如 count=5），点击生成。
- 期望：拒绝非法区间或安全终止。
- 实际：可取值仅有 {7,8,9,10} 4 个，去重后 Set 大小永远到不了 5；防死循环守卫写的是 `nums.size > 10000`（永远不会成立，Set 大小被可取值个数封顶），`while (nums.size < count)` 变为死循环，页面主线程卡死，只能杀标签页。
- 建议：先校验 `min<=max`；循环改用「迭代次数」上限（如 `tries > 10000`），或按校验直接拒绝。
- 判定理由：特定合法可达的输入组合导致浏览器标签页永久无响应，属于阻断级缺陷。

## 四、P1 明细（39 条）

### `base-converter` — D6/P1

- 位置：`apps/web/src/tools/base-converter/BaseConverter.vue:22-23`
- 触发：输入包含当前进制非法字符或小数，如 base10 输入 `1A3` 或 `255.9`。
- 期望：整体校验失败并提示 invalidInput。
- 实际：`parseInt` 遇到非法字符停止，返回 `1` / `255`，界面静默显示错误换算结果，用户会采信错误数值。
- 建议：用 `BigInt(input, base)` 或正则校验整串合法性后再转换。
- 判定理由：`parseInt` 部分解析是经典静默截断缺陷，直接产出错误结果（P0/P1 边界，取 P1 因需特定输入）。

### `basic-auth-generator` — D4/P1

- 位置：`apps/web/src/tools/basic-auth-generator/BasicAuthGenerator.vue:14-17`
- 触发：用户名或密码含非 Latin-1 字符（如中文、emoji）。
- 期望：正确编码（如先 `encodeURIComponent`）或提示不支持字符。
- 实际：`btoa` 直接抛出 `InvalidCharacterError`，异常发生在 computed 内、无 try/catch，Vue 渲染失败，整个结果卡片崩溃空白。
- 建议：改用 `btoa(unescape(encodeURIComponent(...)))`（同 base64-encoder 的做法）或包 try/catch 并提示。
- 判定理由：常规输入即可触发组件级渲染崩溃，功能不可用。

### `bcrypt` — D7/P1

- 位置：`apps/web/src/tools/bcrypt/BcryptTool.vue:13-15, 33`
- 触发：salt 轮数输入框（允许 0–100）设为 25 以上并失焦提交。
- 期望：限制合理范围或异步计算并禁用输入。
- 实际：`hashSync` 在主线程同步执行且随轮数指数增长，轮数 25 单次哈希约数十分钟，页面完全冻结，无 loading、无进度、无取消，只能杀页面。
- 建议：`:max` 收紧到 ≤20，并将哈希移入 Web Worker 或按钮触发 + loading。
- 判定理由：一个合法的界面输入即可使工具永久卡死。

### `benchmark-builder` — D7/P1

- 位置：`apps/web/src/tools/benchmark-builder/benchmark-builder.service.ts:28-37`
- 触发：某 suite 代码含无限循环（如 `while(true){}`），点击运行。
- 期望：可取消或有超时保护。
- 实际：warmup 与计时代码均在主线程同步 `new Function` 执行，死循环直接永久冻结页面，无取消、无超时。
- 建议：在 Worker 中执行被测代码，或至少加超时保护。
- 判定理由：用户输入任意 JS，死循环是常见情形，触发即页面卡死。

### `bip39-generator` — D1/P1

- 位置：`apps/web/src/tools/bip39-generator/Bip39Generator.vue:27, 39`
- 触发：点击「重新生成（retry）」按钮。
- 期望：生成一组新的助记词。
- 实际：`refresh()` 函数体为 `words.value = words.value`，是无操作，按钮永远不改变输出（mnemonic 为依赖 words 的 computed，无其他触发源）。
- 建议：引入 `nonce` ref 并让 computed 依赖它，refresh 递增 nonce。
- 判定理由：核心控件为死控件，重新生成功能完全不可用。

### `compress-pdf` — D4/P1

- 位置：`apps/web/src/tools/compress-pdf/CompressPdf.vue:16-27`
- 触发：上传一个损坏的/伪装成 .pdf 的文件（NUpload 的 accept 可被「所有文件」或拖放绕过），点击压缩。
- 期望：解析失败应提示并复位
- 实际：`PDFDocument.load` 抛错成为未处理 rejection，`processing` 永远停留在 true，按钮永久 loading，工具在本会话内不可再用。
- 建议：process() 整体 try/catch/finally，失败提示并将 processing 复位。
- 判定理由：异常未处理导致交互死锁，功能不可用。

### `convert-to-jpg` — D4/P1

- 位置：`apps/web/src/tools/convert-to-jpg/ConvertToJpg.vue:17-27`
- 触发：通过拖放或「所有文件」方式传入非图片文件（accept 仅为提示），点击转换。
- 期望：解码失败应提示并复位
- 实际：只注册了 `img.onload`，`onerror` 缺失，`Image` 解码失败时 `processing` 永远为 true，按钮永久 loading，工具死锁。
- 建议：增加 onerror 处理并在 finally 中复位 processing。
- 判定理由：异常路径未处理，功能不可用且失败不可见。

### `convert-to-pdf` — D4/P1

- 位置：`apps/web/src/tools/convert-to-pdf/ConvertToPdf.vue:19-26`
- 触发：传入伪装成图片的损坏文件（accept 可绕过），点击转换。
- 期望：解码失败应提示并复位
- 实际：无 `img.onerror`，`processing` 永久 loading，工具死锁。
- 建议：补 onerror，finally 复位。
- 判定理由：异常未处理导致交互死锁。

### `convert-to-webp` — D4/P1

- 位置：`apps/web/src/tools/convert-to-webp/ConvertToWebp.vue:17-25`
- 触发：传入非图片文件（accept 可绕过），点击转换。
- 期望：解码失败应提示并复位
- 实际：无 `img.onerror`，`processing` 永久 loading，工具死锁。
- 建议：补 onerror，finally 复位。
- 判定理由：异常未处理导致交互死锁。

### `csv-change-separator` — D6/P1

- 位置：`apps/web/src/tools/csv-change-separator/CsvChangeSeparator.vue:18-29`
- 触发：输入含引号包裹的逗号单元格（如 `"foo,bar",baz`），选择新分隔符 `;`。
- 期望：输出应仍是合法的 2 列 CSV
- 实际：解析时引号被吞掉（`inQ` 切换但不保留引号），重发时单元格 `foo,bar` 不含 `;` 故不加引号，输出 `foo,bar;baz`——按任何 CSV 解析器都是 3 列，数据被静默破坏。全空行也被 `.filter(r => r.some(c => c))` 静默删除。
- 建议：解析时保留引号信息（或正确处理转义 `""`），输出按 RFC 4180 重新加引号。
- 判定理由：静默产出结构性错误结果，下游解析列数错乱（结果错误，可误导决策）。

### `csv-insert-columns` — D6/P1

- 位置：`apps/web/src/tools/csv-insert-columns/CsvInsertColumns.vue:28-32`
- 触发：输入含引号单元格（如 `"a,b",c`）执行插入。
- 期望：列结构应保持
- 实际：解析吞掉引号后以 `,` 直接 join，单元格 `a,b` 被拆成两列输出，列错位；插入的 header/defVal 含逗号时同样破坏结构。全空行亦被静默删除。
- 建议：输出时按 RFC 4180 对含分隔符/引号的单元格加引号转义。
- 判定理由：静默产出列数错误的结果。

### `csv-rows-to-columns` — D6/P1

- 位置：`apps/web/src/tools/csv-rows-to-columns/CsvRowsToColumns.vue:26`
- 触发：输入含引号包裹逗号的单元格后转置。
- 期望：转置后每行仍是原列数
- 实际：被引号保护的 `a,b` 以裸 `,` 重新 join，转置结果中该单元格裂成两列，行列错位；全空行被静默删除。
- 建议：输出加引号转义；空行保留或提示。
- 判定理由：静默产出结构错误结果。

### `csv-to-xml` — D6/P1

- 位置：`apps/web/src/tools/csv-to-xml/CsvToXml.vue:26`
- 触发：单元格含 `&`、`<`、`>`（如 `Tom & Jerry`），或表头含空格等特殊字符（如 `first name`）。
- 期望：应转义为合法 XML
- 实际：值原样插入 `<tag>value</tag>`，生成 `Tom & Jerry` 等非法 XML；表头直接作为标签名，`<first name>` 非法，输出无法用任何 XML 解析器解析，且无任何提示。
- 建议：对文本内容做 XML 转义，表头清洗为合法标签名（非法字符替换或加前缀）。
- 判定理由：结果呈现为「XML」但实为非法文档，静默产出不可用结果。

### `discord-timestamp` — D6/P1

- 位置：`apps/web/src/tools/discord-timestamp/DiscordTimestamp.vue:8,19-21`
- 触发：不做任何修改，直接使用默认值生成时间戳（默认值即错）；或任何用户不理解初值是 UTC 的情况。
- 期望：默认值表示"现在"，生成的时间戳与现在一致
- 实际：初值取 `new Date().toISOString().slice(0,16)`（UTC 时间字符串，丢弃了 `Z`），而 `new Date("YYYY-MM-DDTHH:mm")` 无偏移时按**本地**解析——默认状态下生成的时间戳系统性偏移一个时区（如 UTC+8 用户得到 8 小时前的时间）。
- 建议：初值用本地时间格式化（如 dayjs().format('YYYY-MM-DDTHH:mm') 或手动拼本地分量）。
- 判定理由：默认状态即产出错误结果，用户毫无察觉。

### `dns-resolver` — D4/P1

- 位置：`apps/web/src/tools/dns-resolver/DnsResolver.vue:13-21`
- 触发：网络不可用、dns.google 被拦截、或域名为空时点击 Resolve。
- 期望：展示失败原因（网络错误 / 解析失败）。
- 实际：`catch {}` 吞掉异常，`results` 为空且无任何提示；「解析失败」「域名不存在」「尚未查询」三者界面表现完全一致。
- 建议：catch 中写入 error 状态并渲染 NAlert；同时为「查询成功但无记录」增加空状态文案。
- 判定理由：失败不可见使用户无法判断该重试还是改输入。人工复核确认。

### `docker-run-to-compose` — D6/P1

- 位置：`apps/web/src/tools/docker-run-to-compose/docker-run-to-compose.service.ts:102-108`
- 触发：输入包含**不带值的布尔 flag** 的合法命令，如 `docker run --rm nginx`、`docker run -it --name app nginx`。
- 期望：正常生成 compose
- 实际：未知 flag 分支会把后一个"不以 `-` 开头的 token"当作该 flag 的值跳过——`--rm` 后面的 `nginx` 被吞掉，最终报 `errorNoImage`；合法命令无法转换。
- 建议：为 `--rm`、`-it`、`-ti`、`--detach` 等已知布尔 flag 建白名单直接跳过；未知 flag 的取值跳过只对确认带值的 flag 生效，或在吞掉 token 前校验其是否为镜像名。
- 判定理由：常见合法输入直接报错，功能不可用。

### `html-wysiwyg-editor` — D1/P1

- 位置：`apps/web/src/tools/html-wysiwyg-editor/HtmlWysiwygEditor.vue:14-17, 57-68`
- 触发：在编辑器中选中一段文字，然后点击 B/I/U 等格式按钮。
- 期望：选中文字应用加粗等格式。
- 实际：按钮的 click 使 contenteditable 失焦、选区被折叠，随后 `document.execCommand` 作用于空选区，格式未应用到目标文字；工具栏对「先选中文本再点按钮」的常规操作无效。
- 建议：按钮加 `@mousedown.prevent` 保持选区与焦点，或在 execCommand 前恢复保存的 Range。
- 判定理由：核心编辑路径（选中后格式化）失效，控件存在但不改变预期状态。

### `image-editor` — D2/P1

- 位置：`apps/web/src/tools/image-editor/ImageEditor.vue:200-212, 145-158`
- 触发：添加文字标注后，在舞台上拖动该文字到新位置，然后点击下载。
- 期望：下载图中文字位于拖动后的位置。
- 实际：`v-text` 设了 `draggable: true`，但没有任何 dragend 处理把新坐标写回 `ann.x/ann.y`；`downloadImage` 仍按旧坐标渲染，下载结果与所见不一致（屏幕上拖走了，导出又回原位）。
- 建议：为 v-text 添加 dragend 更新 ann.x/ann.y（按 stage 缩放换算）。
- 判定理由：状态不同步：交互改变了显示状态但导出使用陈旧数据，产出错误结果。

### `image-split` — D2/P1

- 位置：`apps/web/src/tools/image-split/ImageSplit.vue:17-24,50-52,93`
- 触发：先上传图片 A 并点击 Split 生成切片 → 再选择另一张图片 B。
- 期望：新图片选中后旧切片应清除（或自动重切）。
- 实际：`onFileChange` 只更新 `file`/`imageUrl`，`tiles` 保留图片 A 的切片并继续展示在「Tiles」卡片中；`watch` 仅在 rows/cols 变化时才重切。用户会把 A 的切片误认为 B 的并下载错误切片。
- 建议：`onFileChange` 中清空 `tiles.value`（或Revoke后触发 `splitImage()`）。
- 判定理由：输入变化后输出未重算，陈旧结果被展示且可下载，直接误导用户。

### `image-watermark` — D4/P1

- 位置：`apps/web/src/tools/image-watermark/ImageWatermark.vue:15-34`
- 触发：上传伪装成图片的非图片文件（accept="image/*" 可被拖拽/改后缀绕过），点击「加水印」。
- 期望：解码失败应提示并恢复按钮状态。
- 实际：只注册了 `img.onload`；`img.onerror` 缺失导致回调永不执行，`processing` 永远保持 `true`，「加水印」按钮永久卡在 loading 态，功能死锁，只能刷新页面。
- 建议：增加 `img.onerror` 重置 `processing` 并提示错误。
- 判定理由：一次失败输入即可使核心控件永久不可用。

### `keycode-info` — D9/P1

- 位置：`apps/web/src/tools/keycode-info/KeycodeInfo.vue:13-20`
- 触发：进入工具页后按 F5 / Ctrl+R / F12 / Tab 等任意键盘快捷键。
- 期望：仅捕获按键信息，不拦截浏览器默认行为。
- 实际：`handleKeyDown` 对 document 上所有 keydown 一律 `e.preventDefault()`，导致刷新、开发者工具、Tab 焦点导航等全部失效；页面上也没有任何可输入控件需要防干扰。
- 建议：移除无差别的 `e.preventDefault()`，或仅对会改变页面状态的按键（如 Space 滚动、/ 唤起快速搜索）选择性拦截。
- 判定理由：全局拦截键盘默认行为，阻断基本键盘交互。

### `mac-address-generator` — D1/P1

- 位置：`apps/web/src/tools/mac-address-generator/MacAddressGenerator.vue:35-38,78`
- 触发：点击「刷新」按钮。
- 期望：重新生成一批随机 MAC 地址
- 实际：`refresh()` 只做 `count.value = count.value`（同值赋值不触发任何更新），`macAddresses` 是 computed，缓存未失效，列表完全不变。按钮为死控件。
- 建议：引入 `seed = ref(0)` 并让 `macAddresses` 依赖它，`refresh()` 中 `seed.value++`；或改为点击时调用 `generateMacAddresses` 写入普通 ref。
- 判定理由：控件存在但不改变状态，直接可复现。

### `math-evaluator` — D6/P1

- 位置：`apps/web/src/tools/math-evaluator/MathEvaluator.vue:60-63`
- 触发：输入含多个小数点的「数字」，如 `1.2.3` 或 `2..5`。
- 期望：报语法错误
- 实际：词法扫描把 `1.2.3` 整个当数字 token，`parseFloat("1.2.3")` 静默截断为 `1.2`，继续解析剩余 `.3` 部分，最终给出错误但貌似合法的结果（如 `1.2.3` → `1.2`）。结果被错误接受。
- 建议：数字 token 用正则 `/^\d*\.?\d+/` 校验，匹配失败抛错；或拒绝 token 中出现第二个 `.`。
- 判定理由：非法输入产出错误数值结果，用户会得到错误答案且无任何提示。

### `number-generator` — D6/P1

- 位置：`apps/web/src/tools/number-generator/NumberGenerator.vue:12,15-16`
- 触发：输入 `even` 或 `odd` 且第二行为负数，如 `even\n-5`。
- 期望：给出输入错误提示
- 实际：`Array.from({length: -5})` 抛出 RangeError，computed 中异常向上传播导致组件渲染崩溃（页面白屏/报错）。
- 建议：对 `n` 做下界校验（`Math.max(0, n)` 或报错提示）。
- 判定理由：合法可达的输入直接使工具崩溃。

### `number-generator` — D8/P1

- 位置：`apps/web/src/tools/number-generator/NumberGenerator.vue:12-14`
- 触发：输入 `primes` 并将 n 设为很大值（如 10000000），或在无上下界约束下输入巨大 n。
- 期望：有上下界约束（如 ≤ 10000）
- 实际：`parseInt(lines[1]) || 10` 无任何上限，素数循环在主线程同步执行，页面长时间卡死，无 loading、无取消。
- 建议：限制 n 的最大值并对超限输入提示。
- 判定理由：普通输入即可造成页面假死。

### `otp-generator` — D2/P1

- 位置：`apps/web/src/tools/otp-generator/OtpGenerator.vue:78-82,124-133`
- 触发：修改 QR 卡片区中的 Issuer 或 Account 输入框。
- 期望：二维码按新参数重新生成
- 实际：`updateQr()` 仅在 onMounted 和 secret 的 watch 中调用，issuer/account 变化无任何监听，二维码停留在旧值——用户改完参数导出的仍是默认 `ToolNest:user` 的码。
- 建议：`watch([issuer, account], updateQr)`。
- 判定理由：输入变化后输出未重算，功能呈现为「坏了」。

### `pdf-protect` — D12/P1

- 位置：`apps/web/src/tools/pdf-protect/PdfProtect.vue:19-22`
- 触发：正常使用工具保护任意 PDF 并下载结果。
- 期望：名为 "protect"、关键词含 password/encrypt 的工具产出的文件应真正受密码保护。
- 实际：只调用 `doc.setTitle()` 写入元数据，输出的是完全未加密的 PDF，却以 `protected.pdf` 文件名交付；用户误以为文件已加密。
- 建议：用 `doc.encrypt({ userPassword, ownerPassword })`（pdf-lib 支持）并补充密码输入框（组件已 import NInput 却未使用，说明该交互被遗漏）。
- 判定理由：结果类型与工具承诺不符，会误导用户做出「文件已受保护」的错误决策（如直接外发）。

### `pdf-protect` — D4/P1

- 位置：`apps/web/src/tools/pdf-protect/PdfProtect.vue:14-24`
- 触发：上传一个损坏的或非 PDF 文件（accept 仅过滤对话框，仍可拖入/选入非法文件），点击处理按钮。
- 期望：解析失败时提示错误、按钮恢复可用。
- 实际：`process()` 无 try/catch，`PDFDocument.load` 抛出后成为未处理 rejection，`processing` 永远保持 true，按钮永久卡在 loading，且无任何错误提示。
- 建议：try/catch 包裹解析过程，catch 中设置 error 并置 `processing=false`（用 finally）。
- 判定理由：一次失败即导致工具永久不可用且失败不可见。

### `pdf-rotate` — D4/P1

- 位置：`apps/web/src/tools/pdf-rotate/PdfRotate.vue:15-25`
- 触发：上传损坏/非 PDF 文件后点击旋转。
- 期望：报错并恢复按钮。
- 实际：无 try/catch，`processing` 卡死为 true，按钮永久 loading，无错误提示。
- 建议：try/catch/finally 处理。
- 判定理由：同 pdf-protect，失败一次即工具不可用。

### `pdf-split` — D4/P1

- 位置：`apps/web/src/tools/pdf-split/PdfSplit.vue:15-28`
- 触发：上传损坏/非 PDF 文件后点击提取。
- 期望：报错并恢复按钮。
- 实际：无 try/catch，`processing` 永久 true，无提示。
- 建议：try/catch/finally。
- 判定理由：失败一次即工具不可用且不可见。

### `random-number-generator` — D8/P1

- 位置：`apps/web/src/tools/random-number-generator/RandomNumberGenerator.vue:11-18`
- 触发：设置 min=100、max=1（min > max）后点击生成。
- 期望：拒绝非法区间并提示。
- 实际：无任何校验，`range = 1-100+1 = -98`，`Math.random()*(-98)+100` 产出小于 min 乃至负数的「随机数」，结果被当作合法结果展示。
- 建议：生成前校验 `min<=max`，非法时显示提示；min/max 输入框也加上相互约束。
- 判定理由：非法输入静默产出错误结果，会误导依赖结果的用户。

### `speed-test` — D4/P1

- 位置：`apps/web/src/tools/speed-test/SpeedTest.vue:16,24`
- 触发：延迟或下载请求失败（如网络断开、cloudflare 端点被拦截、CORS/网络错误）。
- 期望：失败时告知用户测试未完成。
- 实际：两处 `catch {}` 吞掉异常；延迟失败则 `latency` 保持 0、下载失败则 `downloadSpeed` 保持 0，成功样式的 NAlert 仍显示「0 Mbps / 0ms」，失败与真实测得 0 不可区分；两者都失败时界面无任何输出、无任何提示。
- 建议：catch 中设置错误状态并用 error 提示展示失败原因。
- 判定理由：与已校准样例 dns-resolver 同型（catch 吞异常，失败不可见），且把失败渲染成成功样式的结果，直接误导用户。

### `token-generator` — D1/P1

- 位置：`apps/web/src/tools/token-generator/TokenGenerator.vue:20,55`
- 触发：点击「重试」(retry) 按钮
- 期望：重新生成一个 token
- 实际：`refresh()` 仅执行 `length.value = length.value`，赋相同值不触发任何响应式更新，token 不变——按钮是死控件
- 建议：引入 `seed`/`nonce` ref 纳入 computed 依赖，refresh 时自增
- 判定理由：控件存在但点击不改变任何状态（D1）

### `ulid-generator` — D1/P1

- 位置：`apps/web/src/tools/ulid-generator/UlidGenerator.vue:16,29`
- 触发：点击「重试」按钮
- 期望：重新生成 ULID
- 实际：`refresh()` 为 `count.value = count.value` 空操作，ULID 列表不变——死控件
- 建议：引入 nonce ref 纳入 computed 依赖
- 判定理由：控件存在但不改变状态

### `url-encoder` — D4/P1

- 位置：`apps/web/src/tools/url-encoder/UrlEncoder.vue:10,26`
- 触发：在输入框键入非法百分号编码，如 `100%` 或 `%E0%A4%A`
- 期望：提示解码失败
- 实际：`decodeURIComponent` 抛错被 `catch` 吞掉返回 `''`，decode 区空白，与「输入为空/无可解码内容」完全不可区分；无错误提示 UI
- 建议：catch 时设置 errorMsg 并以 NAlert 展示，decode 输出区保持占位提示
- 判定理由：异常被静默吞掉，失败不可见（与已知样例 DnsResolver 同类，D4/P1）

### `uuid-generator` — D1/P1

- 位置：`apps/web/src/tools/uuid-generator/UuidGenerator.vue:16,29`
- 触发：点击「重试」按钮
- 期望：重新生成 UUID
- 实际：`refresh()` 为 `count.value = count.value` 空操作，UUID 不变——死控件
- 建议：引入 nonce ref 纳入 computed 依赖
- 判定理由：控件存在但不改变状态

### `video-change-speed` — D6/P1

- 位置：`apps/web/src/tools/video-change-speed/VideoChangeSpeed.vue:51-63`
- 触发：选择速度选项「4x」(value='4')，点击变速。
- 期望：正常输出 4 倍速视频
- 实际：`atempo=1/4=0.25`，ffmpeg atempo 滤镜参数合法范围为 [0.5, 100]，0.25 越界，exec 报错、无输出文件，处理必然失败（用户只看到错误信息，该选项完全不可用）。
- 建议：atempo>2 时用链式 `atempo=2,atempo=2`（如 4x → 1/4 = 0.5*0.5），或对 >2 倍速做分拆解。
- 判定理由：界面提供的选项 100% 失败，属边界逻辑错误而非设计选择。

### `video-loop` — D6/P1

- 位置：`apps/web/src/tools/video-loop/VideoLoop.vue:49`
- 触发：任意视频，loopCount=3，点击 loop。
- 期望：整个视频重复播放 3 次
- 实际：ffmpeg `loop` 滤镜的语义是「从 start 起缓存 size 帧并重复」，`size=1` 只缓存第 0 帧，输出仅为首帧重复数次的一小段冻结画面，原视频其余内容全部丢失，且无任何报错。
- 建议：改用输入选项 `-stream_loop <N>`，或 concat 整文件；若用 loop 滤镜须 size 覆盖全片帧数（不可行）。
- 判定理由：结果完全错误（内容丢失）且静默，用户会下载到损坏产物。

### `xml-formatter` — D6/P1

- 位置：`apps/web/src/tools/xml-formatter/xml-formatter.service.ts:46-48,58-59`
- 触发：输入含转义实体的文本节点，如 `<a>x &amp; y</a>`，format 模式。
- 期望：输出仍为合法 XML（`x &amp; y`）
- 实际：`textContent` 返回已解码文本 `x & y`，被原样拼进输出（第 48/59 行未做转义），产出非法 XML `<a>x & y</a>`；属性值有 `escapeAttrValue` 而文本节点没有，不一致。用户复制到下游解析直接报错。
- 建议：对写入的文本节点按 `& < >` 重新转义（CDATA 分支除外）。
- 判定理由：静默产出错误结果（已知样例 TextReplacer 同类严重度）。

## 五、P2 / P3 明细（189 条）

### P2（129 条）

| 工具 | 分类 | 位置 | 触发 | 实际 |
| --- | --- | --- | --- | --- |
| base64-encoder | D3 | `base64-encoder/Base64Encoder.vue:33-37` | decode 模式下输入非法 base64（output 为 `''`），点击 ⇄ swap。 | `input.value = prev`（`''`）直接把用户原文覆盖为空，输入内容静默丢失。 |
| base64-encoder | D5 | `base64-encoder/Base64Encoder.vue:29-31` | 点击「复制」。 | `navigator.clipboard.writeText` 无 try/catch、无成功反馈，剪贴板 API 在非安全上下文拒绝时静默失败。 |
| base64-file-converter | D8 | `base64-file-converter/Base64FileConverter.vue:25-30` | 粘贴长度非 4 的倍数 / 填充错误的 base64（如 `QUJD` 缺字符、含空格），点击预览或下载。 | 正则 `/^[A-Za-z0-9+/=]+$/` 只查字符集，不校验长度与填充，按钮可用；预览渲染出裂图、下载得到损坏文件，仅 `downloadError` 在下载分支前置校验外无覆盖，预览失败无任何提示。 |
| bcrypt | D12 | `bcrypt/BcryptTool.vue:19-21, 45-47` | compare 区 hash 输入框填入非 bcrypt 格式的任意字符串。 | `compareSync` 抛错被 `catch { return false }` 吞掉，界面显示红色「no match」，把「输入错误」伪装成「密码不匹配」，会误导决策。 |
| benchmark-builder | D4 | `benchmark-builder/benchmark-builder.service.ts:38-41` | 多个 suite 中某一个代码运行时报错（如 `undefinedVar()`），点击运行。 | `catch { continue }` 静默跳过失败 suite，结果表只显示成功项；只有当全部失败时才显示笼统的 noResults，用户无法区分「代码有 bug」和「确实慢」。 |
| case-converter | D5 | `case-converter/CaseConverter.vue:36, 46` | 点击任一结果输入框执行复制。 | 复制通过 readonly 输入框的 `@click` 隐式触发，无任何成功/失败提示；剪贴板 API 失败（非安全上下文）时用户无从知晓。同类工具均有显式复制按钮 + 反馈。 |
| chmod-calculator | D5 | `chmod-calculator/ChmodCalculator.vue:28-30` | 点击 Copy 复制 chmod 命令，或剪贴板 API 不可用（非安全上下文）时。 | `navigator.clipboard.writeText` 无 try/catch、无成功/失败提示，失败时用户完全无感知（与已知样例 hash-text 同类）。 |
| compress-pdf | D2 | `compress-pdf/CompressPdf.vue:14,34` | 完成一次压缩后（sizeResult 提示已显示），再选择新文件。 | `onFile` 只清了 `resultUrl`，`origSize/newSize` 保留，界面继续显示上一份文件的大小对比提示，属于陈旧状态。 |
| compress-pdf | D7 | `compress-pdf/CompressPdf.vue:33` | 压缩执行中（按钮处于 loading）再次点击按钮。 | naive-ui 的 `loading` 不会自动禁用点击，两次 process() 并发跑共享状态，结果互相覆盖、object URL 泄漏。 |
| connectivity-check | D7 | `connectivity-check/ConnectivityCheck.vue:34` | 检测进行中（loading）再次点击「测试连通性」。 | `loading` 不自动禁用按钮，并发运行多个 test() 循环，互相清空并交错 push 结果，`testing` 被先完成者置 false。 |
| convert-to-pdf | D4 | `convert-to-pdf/ConvertToPdf.vue:27` | 传入非 image/* 类型文件（同样可绕过 accept），点击转换。 | 走 else 分支静默什么都不做，也无结果无提示，用户无法区分「正在处理」与「不支持」。 |
| crontab-generator | D6 | `crontab-generator/crontab-generator.service.ts:212` | 设置 Day of month 与 Day of week 均受限的表达式（如 `0 0 13 * 5`，每月 13 号且周五）。 | `!doms.includes(...) \|\| !dows.includes(...)` 用的是 AND，用户照真实 crontab 语义配置时，「下次执行时间」表给出偏少的错误结果，会误导排程决策。 |
| csv-find-incomplete | D6 | `csv-find-incomplete/CsvFindIncomplete.vue:20,26` | 输入 `a,b\n,,\nc,d`（中间一行全为空单元格的不完整行）。 | parseCSV 的 `filter(r => r.some(c => c))` 先把全空行整条删掉，缺失行从未进入检测，输出「all rows valid」，漏报真实的数据缺失。 |
| csv-swap-columns | D6 | `csv-swap-columns/CsvSwapColumns.vue:24-28` | ①输入含引号包裹逗号的单元格；②某些行缺少目标列（`a >= r.length`）。 | ①join 时引号丢失导致列裂变；②短行原样输出、交换未生效也无任何提示，用户难以察觉部分行未处理。 |
| csv-to-json | D3 | `csv-to-json/CsvToJson.vue:26` | ①数据行列数多于表头（`h1,h2\n1,2,3`）；②表头重名（`id,name,id`）。 | 多余列被 `headers.map((h,i)=>... r[i])` 静默截断丢弃；重复表头经 `Object.fromEntries` 后值互相覆盖，数据静默丢失，JSON 看似正常。 |
| csv-to-yaml | D12 | `csv-to-yaml/CsvToYaml.vue:26` | 单元格值包含 YAML 特殊字符（`:`、`#`、前导 `-`、引号、换行）或单元格本身为空，如 `a,b\n"x: y",2`。 | 值被原样拼进 `key: value`，`a: x: y` 是无效 YAML；输出区无校验，用户可能把坏 YAML 直接拿去用。 |
| csv-to-yaml | D3 | `csv-to-yaml/CsvToYaml.vue:26` | 输入表头列数少于数据行列数的 CSV，如 `a,b\n1,2,3`。 | `h.map((k,i) => ...)` 只按表头列数迭代，第 3 列的值 `3` 被静默丢弃，用户拿到的 YAML 缺数据且无任何提示。 |
| date-time-converter | D5 | `date-time-converter/DateTimeConverter.vue:34-36` | 点击任意复制按钮（或点击结果输入框）。 | `navigator.clipboard.writeText(text)` 无 try/catch（浮动 promise），无成功提示，失败完全不可见。 |
| date-time-converter | D6 | `date-time-converter/date-time-converter.service.ts:72-78` | auto 模式下输入 11~12 位的毫秒时间戳，如 `999999999999`（2001-11 的合法毫秒时间戳）。 | `asNumber > 1e12` 才按毫秒解析，1e11~1e12 之间的值落入 `> 1e8` 分支被当作秒，输出年份 33658 之类的荒谬结果且无提示。 |
| date-weekday-calculator | D12 | `date-weekday-calculator/DateWeekdayCalculator.vue:20-21` | 输入非日期文本（如 `abc`）。 | `common.invalidDate` 文案被写进结果输入框，复制结果会把错误文案一并带走。 |
| days-to-hours | D6 | `days-to-hours/DaysToHours.vue:10-11` | 输入 `3abc`、`1,5` 或多行文本（textarea 支持多行）如 `1\n2`。 | `parseFloat` 只消费前缀数字，`3abc`→按 3 天计算、`1,5`→按 1 天计算、多行只取首行，均无任何提示，输出错误结果。 |
| discord-timestamp | D12 | `discord-timestamp/DiscordTimestamp.vue:20` | 输入非法日期文本。 | `common.invalidDate` 文案写入结果 textarea，复制输出会带走错误文案。 |
| docker-compose-to-1panel | D5 | `docker-compose-to-1panel/DockerComposeTo1panel.vue:52-56` | 点击输出卡片上的复制按钮。 | `navigator.clipboard.writeText` 无 try/catch、无提示，浮动 promise。 |
| docker-run-to-compose | D5 | `docker-run-to-compose/DockerRunToCompose.vue:16-20` | 点击复制按钮。 | 无 try/catch、无提示。 |
| email-extractor | D12 | `email-extractor/EmailExtractor.vue:11` | 输入不包含任何邮箱的文本。 | `noEmailsFound` 提示文案被写进结果 textarea，用户全选复制输出会把这句提示当作"提取结果"粘贴走。 |
| email-normalizer | D5 | `email-normalizer/EmailNormalizer.vue:20-24` | 点击复制按钮。 | 无 try/catch、无提示，浮动 promise。 |
| emoji-picker | D5 | `emoji-picker/EmojiPicker.vue:20` | 点击任意 emoji 按钮。 | `navigator.clipboard.writeText` 无 try/catch、无提示，用户无法确认点击是否生效。 |
| encryption | D2 | `encryption/EncryptionTool.vue:22,25-33,51-58` | 解密成功后，修改密文、算法或密钥输入框（不点解密按钮）。 | 旧明文一直显示在输出区，与当前输入完全无关，用户可能复制走与当前密钥不匹配的陈旧结果。 |
| encryption | D5 | `encryption/EncryptionTool.vue:35` | 点击加密区复制按钮。 | 无 try/catch、无提示。 |
| eta-calculator | D6 | `eta-calculator/eta-calculator.service.ts:22-23` | （配合 `EtaCalculator.vue:37`） 清空"已完成任务"输入框（NInputNumber 清空后为 `null`，`:min="0"` 不阻止 null）。 | `null < 0` 与 `null > totalTasks` 均为 false，校验被绕过，`remainingTasks = total - null = NaN`，界面显示 `NaN%`、`NaN 任务`、结束时间为 NaN。 |
| generic-calculator | D12 | `generic-calculator/GenericCalculator.vue:51` | 输入非法表达式（如 `2+*3`）点计算。 | `errorPrefix + message` 被写进结果输入框，复制结果会带走错误文案。 |
| generic-calculator | D6 | `generic-calculator/GenericCalculator.vue:25` | 输入含除零的表达式，如 `5/0`、`1/(3-3)`。 | JS 语义产生 `Infinity`/`NaN`，结果区直接显示 `Infinity` 或 `NaN`，无任何错误提示。 |
| generic-calculator | D8 | `generic-calculator/GenericCalculator.vue:38-43` | 输入语法残缺/畸形的表达式，如 `2*(3`（右括号缺失）或 `1.2.3`。 | `2*(3` 静默算出 6（右括号缺失被忽略）；`1.2.3` 被 `parseFloat` 消费为 1.2 且不报尾部错误（num 一次性吞掉全部合法字符后 pos 已到末尾）。非法输入静默产出"看起来正确"的结果。 |
| gif-change-speed | D11 | `gif-change-speed/GifChangeSpeed.vue:9` | （配合 `src/composables/useFFmpeg.ts:88-95`） 加载 FFmpeg 后离开该工具页面（dispose 在项目中无任何调用方）。 | `sharedInstance` 为模块级共享，worker 常驻，多次进出工具页后残留的 FFmpeg worker 持续占用内存与 CPU 配额，且无重新加载途径（isLoaded 恒 true）。 |
| git-memo | D5 | `git-memo/GitMemo.vue:92-94,111` | 点击任意命令行（整行点击即复制）。 | 无 try/catch、无提示，用户点击后完全无法确认是否已复制。 |
| hash-text | D5 | `hash-text/HashText.vue:16` | （已知样例，记录备查） 点击「复制」。 | `navigator.clipboard.writeText` 无 try/catch 且为浮动 promise，失败静默，成功也无提示。 |
| hidden-char-detector | D6 | `hidden-char-detector/HiddenCharDetector.vue:13` | 粘贴包含换行符（`\n`/`\r`）的普通多行文本。 | `code < 32` 把每个换行符都列为 `[pos n] U+000A`，正常文本被误报为一串「隐藏字符」，结果具有误导性。 |
| hmac-generator | D5 | `hmac-generator/HmacGenerator.vue:32` | 点击「复制」。 | `navigator.clipboard.writeText(hmac.value)` 无 try/catch、无成功提示，浮动 promise。 |
| hours-to-days | D8 | `hours-to-days/HoursToDays.vue:9-14` | 输入负数（如 `-25`）或部分非法数字（如 `12abc`）。 | `-25` 产出 `-25 hours = -2 days -1 hours`（负数余数、负数天数）；`parseFloat('12abc')` 静默截断为 12。 |
| html-wysiwyg-editor | D5 | `html-wysiwyg-editor/HtmlWysiwygEditor.vue:38-42` | 点击「复制 HTML」。 | `navigator.clipboard.writeText` 无 try/catch、无提示。 |
| image-create-transparent | D1 | `image-create-transparent/ImageCreateTransparent.vue:65-77, 104-105` | 上传图片后不点「应用」、也不改动颜色/容差，直接点「下载」。 | 下载按钮仅按 `!file` 禁用；此时 canvas 仍是空白默认画布，静默下载一张空白 PNG。 |
| image-crop | D8 | `image-crop/ImageCrop.vue:199-212, 125-146` | 在 X/Y/宽/高输入框输入超出图片范围的值（X/Y 无上限约束），然后点击裁剪下载。 | X/Y 只有 `:min="0"` 无 max，用户可设 X 大于图片宽度；`drawImage` 源矩形越界被静默裁剪，下载到含透明/黑边的图而不告知。 |
| image-editor | D1 | `image-editor/ImageEditor.vue:114-124, 200-212` | 双击已有文字标注。 | `onTextDblClick` 置 `editing = true`，模板却从未使用 `editing` 渲染任何输入控件；`onTextType` 监听 Enter 也无对应输入框。双击是无效交互，文字内容永远无法修改。 |
| image-to-text-ocr | D5 | `image-to-text-ocr/ImageToTextOcr.vue:68-72` | 点击「复制」。 | `navigator.clipboard.writeText` 为浮动 promise：无 try/catch、无 .catch、无成功提示，失败完全不可见。 |
| info-masking | D5 | `info-masking/InfoMasking.vue:35-37` | 点击「复制」。 | 浮动 promise，无 try/catch、无提示。 |
| ip-info | D4 | `ip-info/IpInfo.vue:14-31` | ipapi.co 返回 HTTP 错误（如 429 限流），响应体为 JSON 错误对象（无 `ip` 字段）。 | `r.json()` 解析成功不抛异常，表格渲染 11 行全部为空字符串，失败与「查询成功但无数据」不可区分。 |
| ipv4-address-converter | D5 | `ipv4-address-converter/Ipv4AddressConverter.vue:32-34` | 点击任意一行的「复制」。 | 浮动 promise，无 try/catch、无提示；剪贴板权限被拒时静默失败。 |
| ipv6-ula-generator | D5 | `ipv6-ula-generator/Ipv6UlaGenerator.vue:18-20` | 点击任意一行的「复制」。 | 浮动 promise，无 try/catch、无提示。 |
| jpg-to-png | D4 | `jpg-to-png/JpgToPng.vue:23-45` | 上传损坏/伪装的图片文件，点击「下载为 PNG」。 | 仅注册 `img.onload`，`onerror` 缺失，点击后无任何反应；`canvas.toBlob` 回调里 `if (!blob) return;` 同样静默。 |
| json-escape | D12 | `json-escape/JsonEscape.vue:12-17,24` | 切到 unescape 模式，输入非合法 JSON（如 `abc`）。 | `catch { return t('tools.jsonEscape.invalidInput') }` 把错误文案直接写进输出 textarea，与正常转换结果不可区分（已知样例 text-replacer 同款 D12/P2）。 |
| json-minify | D5 | `json-minify/JsonMinify.vue:15-17` | 点击「复制」。 | 浮动 promise，无 try/catch、无提示。 |
| json-prettify | D5 | `json-prettify/JsonPrettify.vue:35-37` | 点击「复制」。 | 浮动 promise，无 try/catch、无提示。 |
| json-sort | D12 | `json-sort/JsonSort.vue:16,22` | 输入非法 JSON（或空输入）。 | `catch { return t('common.invalidJson') }` 把「Invalid JSON」文案写进输出 textarea，与正常排序结果不可区分，用户可能直接复制该错误文本。 |
| json-sort | D6 | `json-sort/JsonSort.vue:13` | 输入含数字后缀键的 JSON，如 `{"item9":1,"item10":2}`。 | `Object.keys(obj).sort()` 为纯字典序，结果为 `item10, item9`（已知样例 list-sort 同款「未用 numeric 排序」）。 |
| json-stringify | D12 | `json-stringify/JsonStringify.vue:11-14,20` | 输入非法 JSON（如 `hello`）。 | `catch { return input.value }` 把**原始输入原样回显**到输出区，失败输出与成功输出在视觉上完全一致，用户无法得知转换失败，可能把未格式化的原始文本当作「已 stringify 的结果」取走。 |
| json-to-csv | D5 | `json-to-csv/JsonToCsv.vue:16-18` | 点击「复制」。 | 浮动 promise，无 try/catch、无提示。 |
| json-to-toml | D5 | `json-to-toml/JsonToToml.vue:16-18` | 点击「复制」。 | 浮动 promise，无 try/catch、无提示。 |
| json-to-xml | D5 | `json-to-xml/JsonToXml.vue:16-18` | 点击「复制」按钮（输出非空时）。 | `navigator.clipboard.writeText` 为浮动 promise，无 try/catch、无成功/失败提示；在非 HTTPS 或权限被拒时静默失败，用户误以为已复制。 |
| json-to-yaml | D5 | `json-to-yaml/JsonToYaml.vue:16-18` | 点击「复制」按钮。 | 浮动 promise，无 try/catch、无提示，失败静默。 |
| json-to-yaml | D6 | `json-to-yaml/json-to-yaml.service.ts:5-12` | 打开工具或清空输入框（input 为 `''`）。 | `jsonToXml` 有 `!input.trim()` 守卫，本 service 没有；`JSON.parse('')` 抛异常 → 页面一打开就弹出 `Unexpected end of JSON input` 错误 Alert，误导用户。 |
| json-viewer | D5 | `json-viewer/JsonViewer.vue:17-21` | 点击「复制」按钮（格式化结果存在时）。 | 浮动 promise，无 try/catch、无提示。 |
| keycode-info | D5 | `keycode-info/KeycodeInfo.vue:45-47,79` | 点击任一字段的只读输入框（click-to-copy）。 | `navigator.clipboard.writeText` 无 try/catch、无提示，且输入框外观无任何“已复制”变化，用户无法确认点击是否生效。 |
| list-converter | D5 | `list-converter/ListConverter.vue:49-51` | 点击「复制」按钮。 | 浮动 promise，无 try/catch、无提示。 |
| list-converter | D6 | `list-converter/list-converter.service.ts:41-45` | 输入含数字编号项（如 `item1, item2, ... item10`），排序选「升序」。 | `localeCompare` 默认非数字排序，`item10` 排在 `item9` 前面（`1 < 9` 字符比较）。 |
| list-duplicate | D3 | `list-duplicate/ListDuplicate.vue:12-13` | 输入含空行的列表（如 `a\n\nb`），执行复制每行。 | `.filter(Boolean)` 静默丢弃所有空行，输出 `a\na\nb\nb`，空行结构丢失且无任何提示。 |
| list-shuffle | D3 | `list-shuffle/ListShuffle.vue:12-13` | 输入含空行的列表并查看洗牌结果。 | `.filter(Boolean)` 静默删除空行，输出列表项数少于输入，无提示。 |
| list-sort | D6 | `list-sort/ListSort.vue:11` | 输入 `item9\nitem10`。 | `localeCompare` 未启用 numeric，纯字典序输出 `item10, item9`，与用户预期相反。 |
| list-truncate | D3 | `list-truncate/ListTruncate.vue:12` | 输入含空行的列表（如 `a\n\nb`）并截断。 | `.filter(Boolean)` 先静默删除所有空行再 `slice(0, count)`，空行被吞且占用截断名额的行数语义变化，无提示。 |
| list-truncate | D3 | `list-wrap/ListWrap.vue:13` | 输入含空行的列表并加前后缀。 | `.filter(Boolean)` 静默删除空行后再包裹，输出丢失空行，无提示。 |
| lorem-ipsum | D5 | `lorem-ipsum/LoremIpsum.vue:19` | 点击「复制」按钮。 | 浮动 promise，无 try/catch、无提示。 |
| mac-address-generator | D5 | `mac-address-generator/MacAddressGenerator.vue:40-42` | 点击「复制」时剪贴板权限被拒或不在安全上下文。 | `navigator.clipboard.writeText` 无 try/catch、无 then/反馈，失败静默，成功用户也无感知。 |
| mac-lookup | D6 | `mac-lookup/MacLookup.vue:15` | 输入点分隔格式的合法 MAC（Cisco 写法），如 `6416.7F00.0001`。 | `replace(/[:-]/g, '')` 不剥 `.`，`slice(0,6)` 得到 `6416.7`（含非法字符）发给 API，必然查不到；同样纯非十六进制垃圾（如 `ZZ:ZZ:ZZ`）也不校验直接发出。 |
| markdown-to-html | D5 | `markdown-to-html/MarkdownToHtml.vue:17-19` | 点击「复制 HTML」，剪贴板失败。 | 无 try/catch、无任何提示。 |
| math-evaluator | D12 | `math-evaluator/MathEvaluator.vue:72-77` | 输入非法表达式（如 `2+`）。 | `Error: ...` 文案直接写进居中的大号结果区，与正常结果同样式展示。 |
| meta-tag-generator | D5 | `meta-tag-generator/MetaTagGenerator.vue:91-93` | 点击「复制」，剪贴板失败。 | 无 try/catch、无提示。 |
| mime-types | D5 | `mime-types/MimeTypes.vue:28-44,62-64,82-112` | (a) 输入不存在的扩展名（如 `xyzq`）或不存在的 MIME 类型；(b) 点击结果 NTag 复制。 | (a) 查找 miss 与输入为空同样什么都不显示，用户无法区分是「没有结果」还是「没触发」；(b) `copyText` 无 try/catch、无提示，且点击可复制是隐藏交互（无复制图标/文案）。 |
| morse-code | D6 | `morse-code/MorseCode.vue:16` | 输入任何包含 `.` 的普通文本，如 `Hello.` 或 `a.b`。 | `t.includes('.')` 即判定为摩斯输入进行解码，`Hello.` 被按摩斯解析，所有字符查不到映射被静默置空，输出区空白，用户原文被「吞掉」。 |
| number-sum | D6 | `number-sum/NumberSum.vue:12` | 粘贴单行逗号分隔数据，如 `1, 2, 3`。 | `parseFloat("1, 2, 3")` 只取前缀得 `1`，count=1、sum=1，其余数字被静默丢弃，结果错误。同理非数字行被 `filter(!isNaN)` 静默丢弃且无提示。 |
| number-to-words | D8 | `number-to-words/NumberToWords.vue:23` | 输入 `3.9` 或 `12abc`。 | `parseInt` 静默截断，`3.9` 显示为 `three`，`12abc` 显示为 `twelve`，非法输入被静默接受并产出貌似权威的结果。 |
| otp-generator | D5 | `otp-generator/OtpGenerator.vue:44-50` | 点击复制 secret 或复制 token，剪贴板失败。 | 无 try/catch、无提示。 |
| password-generator | D12 | `password-generator/PasswordGenerator.vue:22,42` | 关掉全部字符集开关（或 exclude 框填掉所有剩余字符）后点击生成。 | 错误文案 `selectOneOption` 被直接写进密码输出框，与真实密码同样式展示，且下次成功生成前一直残留。 |
| pdf-editor | D2 | `pdf-editor/PdfEditor.vue:28,98-104,120` | 成功生成 edited.pdf 后，修改文字/位置/字号/颜色，再点「下载编辑后的 PDF」。 | 输入变化不会清除 `resultUrl`，下载的是旧参数生成的 PDF，界面无任何「结果已过期」提示。 |
| pdf-extract-images | D11 | `pdf-extract-images/PdfExtractImages.vue:20-24,54,71-79` | 对一个 PDF 执行提取后，换一个文件再提取（或重复提取）。 | `images.value = []` 直接丢弃旧数组，此前每个页面创建的 `URL.createObjectURL` 永不 revoke；大 PDF 多次操作会累积大量 blob 内存。 |
| pdf-merge | D2 | `pdf-merge/PdfMerge.vue:13,28,36-40` | 合并成功后，在上传列表中删除或替换某个 PDF。 | `onFiles` 不清理 `resultUrl`，「下载合并结果」仍提供基于旧文件列表的 PDF，与新选择不符且无提示。 |
| pdf-rotate | D6 | `pdf-rotate/PdfRotate.vue:21` | 对页面本身已带旋转角（如扫描件 rotation=90）的 PDF 选择「90°」。 | `p.setRotation(degrees(angle))` 是**赋值**而非累加，页面原本已是 90° 时结果与输入完全相同，用户操作无效且无从察觉。 |
| pdf-split | D8 | `pdf-split/PdfSplit.vue:22` | 输入越界页码（3 页 PDF 填 `1,5,99`）或留空/只输入分隔符。 | 非法页码被静默丢弃；输入为空时 `indices=[]`，仍生成 0 页 PDF 并显示下载按钮，用户下载到一个空文档且全程无提示。 |
| ping-test | D9 | `ping-test/PingTest.vue:40-41` | 在目标输入框输入域名/IP 后按回车。 | 无 `@keyup.enter`，无任何反应，必须鼠标点击按钮。 |
| qr-code-generator | D2 | `qr-code-generator/qr-code-generator.service.ts:7-33` | 快速连续输入使 `QRCode.toDataURL` 多次并发（如先粘入长文本再立刻继续键入），先发出的较慢请求后返回。 | watch 回调内无序号/取消保护，后返回的旧请求会覆盖新请求的结果，界面短暂或持续显示旧输入对应的二维码。 |
| qr-code-generator | D4 | `qr-code-generator/qr-code-generator.service.ts:28-30` | 输入超长文本（超出 QR 容量，如数千字符）或导致 `QRCode.toDataURL` 抛错的其他输入。 | `catch {}` 吞掉异常并把 dataUrl 置空，界面退化为「空输入提示」，失败与「未输入」完全不可区分。 |
| qr-code-generator | D5 | `qr-code-generator/QrCodeGenerator.vue:36-48` | 点击「复制」按钮（非安全上下文/权限被拒时必现）。 | `navigator.clipboard.write(...)` 无 try/catch、为浮动 promise，失败静默，成功也无反馈，用户无法确认二维码是否已进剪贴板。 |
| random-port-generator | D5 | `random-port-generator/RandomPortGenerator.vue:32-34` | 点击「复制」。 | `navigator.clipboard.writeText` 无 try/catch、无提示，浮动 promise。 |
| roman-numeral-converter | D5 | `roman-numeral-converter/RomanNumeralConverter.vue:21-26` | 点击任一「复制」按钮。 | `navigator.clipboard.writeText` 无 try/catch、无成功提示。 |
| rsa-key-pair-generator | D5 | `rsa-key-pair-generator/RsaKeyPair.vue:31-32` | 点击复制公钥/私钥。 | 无 try/catch、无提示，浮动 promise；私钥这类长文本复制失败时用户无从察觉。 |
| rsa-key-pair-generator | D7 | `rsa-key-pair-generator/RsaKeyPair.vue:17-29` | 选择 4096 bit 点击生成。 | `forge.pki.rsa.generateKeyPair` 未传回调、为同步执行（`workers:-1` 在不提供 callback 时不生效），主线程被阻塞数秒，`:loading` 状态在同一 tick 内无法渲染（spinner 根本不出现），界面完全卡死且无取消手段。 |
| rule-test | D9 | `rule-test/RuleTest.vue:43-45` | 在域名输入框输入后按回车。 | 无 `@keyup.enter`，必须点击按钮。 |
| safelink-decoder | D5 | `safelink-decoder/SafelinkDecoder.vue:37-41` | 点击「复制」按钮，或剪贴板 API 因权限/非安全上下文拒绝时。 | `navigator.clipboard.writeText` 是浮动 promise，无 try/catch、无任何成功/失败反馈；权限被拒时静默失败。 |
| seconds-to-time | D8 | `seconds-to-time/SecondsToTime.vue:9-13` | 输入负数（如 `-5`）、带垃圾后缀（`12abc`）、小数（`1.5`）或非数字。 | `parseInt` 静默截断后缀与小数；`-5` 产出 `-1:-1:-5` 这种非法时间串且无任何提示，被静默接受为「结果」。 |
| service-status | D12 | `service-status/ServiceStatus.vue:16-22` | 检测一个返回 HTTP 404/500 的 URL（网络可达但服务报错）。 | `mode: 'no-cors'` 产生 opaque 响应，任何 HTTP 错误状态也 resolve，`fetch` 成功分支无条件写入 `reachable` 并附响应时间，用户把挂掉的服务误判为正常。 |
| sql-prettify | D5 | `sql-prettify/SqlPrettify.vue:45-47` | 点击输出区的「复制」按钮。 | `navigator.clipboard.writeText` 无 try/catch（浮动 promise）、无成功反馈；剪贴板权限被拒时静默失败。 |
| svg-placeholder-generator | D5 | `svg-placeholder-generator/SvgPlaceholderGenerator.vue:32-34` | 点击「复制 SVG 代码」按钮。 | `navigator.clipboard.writeText` 无 try/catch、无反馈，权限被拒时静默失败。 |
| svg-placeholder-generator | D8 | `svg-placeholder-generator/svg-placeholder-generator.service.ts:11-14` | 在自定义文本中输入含 `<`、`&`、`"` 等 XML 特殊字符（如 `A < B & C`）。 | `displayText` 未经任何转义直接拼进 `<text>` 节点，生成的 SVG 为非法 XML，预览图文字截断/消失，下载/复制的 SVG 文件无法正确解析。 |
| text-join | D3 | `text-join/TextJoin.vue:10` | 输入行中包含空行，如 `a\n\nb`，执行合并。 | `.filter(Boolean)` 静默删除空行，`a\n\nb` 变成 `a, b`，输入行数与输出项数不一致且无任何提示，用户对照原文时丢失条目。 |
| text-replacer | D12 | `text-replacer/TextReplacer.vue:12-18` | 开启正则开关并输入非法正则（如 `[`）。 | `catch { return t('tools.textReplacer.invalidRegex') }` 把错误文案写进输出 textarea，与正常替换结果无法区分，用户可能直接复制走。 |
| text-to-binary | D4 | `text-to-binary/TextToBinary.vue:16-25,47-49` | 输入长度不是 8 的倍数的二进制（如 `0101`） | `textFromBinary` 的 catch 返回 `''`，输入框仅有红色边框（status=error），`binaryError` ref 声明后从未使用，无任何错误文案；解码失败与「输入为空」在输出区不可区分 |
| text-to-binary | D5 | `text-to-binary/TextToBinary.vue:27-32` | 点击任一「复制」按钮 | `navigator.clipboard.writeText` 无 try/catch、无成功提示；剪贴板不可用时静默失败 |
| text-to-binary | D8 | `text-to-binary/text-to-binary.service.ts:9-11` | 在「binary → text」输入框键入含非 0/1 字符的二进制，如 `0100000102`（多打一个 2）或 `0100 0001xyz` | `convertAsciiBinaryToText` 先用 `replace(/[^01]/g, '')` 静默删除所有非法字符，剩余长度若恰好是 8 的倍数即被判定「有效」并解码出错误文本；界面不显示任何警告，用户得到的是与输入不符的结果 |
| text-to-nato-alphabet | D5 | `text-to-nato-alphabet/TextToNatoAlphabet.vue:15-17` | 点击「复制」 | 无 try/catch、无提示，剪贴板 API 不可用时静默失败 |
| text-to-unicode | D5 | `text-to-unicode/TextToUnicode.vue:18-24` | 点击任一「复制」按钮 | 无 try/catch、无提示，失败静默 |
| time-to-decimal | D8 | `time-to-decimal/TimeToDecimal.vue:9-14` | 输入越界值如 `0:90`（90 分钟）、`-1:30` 或多余段 `1:2:3:4` | 无上下界校验，`0:90` 直接输出 `1.5000 hours` 并标注为合法结果；`1:2:3:4` 的第 4 段被静默丢弃 |
| time-to-seconds | D8 | `time-to-seconds/TimeToSeconds.vue:9-13` | 输入 `0:90`、`-1:30` 或 `1:2:3:4` | 与 time-to-decimal 同一缺陷——无范围与段数校验，非法输入产出看似正确的秒数结果 |
| token-generator | D5 | `token-generator/TokenGenerator.vue:21` | 点击「复制」 | 无 try/catch、无提示 |
| toml-to-json | D5 | `toml-to-json/TomlToJson.vue:16-18` | 点击「复制」 | 无 try/catch、无提示 |
| toml-to-yaml | D5 | `toml-to-yaml/TomlToYaml.vue:16-18` | 点击「复制」 | 无 try/catch、无提示 |
| truncate-clock-time | D8 | `truncate-clock-time/TruncateClockTime.vue:9-17` | 输入 `12:99:30` 或 `25:00:00` | 无范围校验，输出 `12:99:30 原始值` 等三行，把非法时间标注为合法结果展示 |
| ulid-generator | D5 | `ulid-generator/UlidGenerator.vue:15` | 点击「复制」 | 无 try/catch、无提示 |
| url-parser | D6 | `url-parser/UrlParser.vue:41-45` | 解析含重复 query 参数的 URL，如 `?a=1&a=2&b=3` | `v-for` 的 `:key="p.key"` 使用参数名，重复键导致 Vue key 重复警告，DOM 复用错乱，重复项可能显示错误值或渲染异常 |
| user-agent-parser | D5 | `user-agent-parser/UserAgentParser.vue:15-19,37` | 点击「复制」（复制的是输入框 UA 字符串） | 无 try/catch、无提示 |
| uuid-generator | D5 | `uuid-generator/UuidGenerator.vue:15` | 点击「复制」 | 无 try/catch、无提示 |
| video-add-audio | D7 | `video-add-audio/VideoAddAudio.vue:98-107` | 选择大视频后点击「添加音频」，FFmpeg 执行期间 | 仅有静态「processing」提示，无进度（ffmpeg 的 progress 事件已在 useFFmpeg 中监听但未在处理阶段展示），无取消按钮；长任务期间用户无法估计剩余时间只能等待 |
| video-change-speed | D6 | `video-change-speed/VideoChangeSpeed.vue:61` | 上传无音轨的视频（如无声录屏），任意速度处理。 | `-filter:a atempo=...` 匹配不到音频流，ffmpeg 报错，所有速度下均失败。 |
| webrtc-detection | D11 | `webrtc-detection/WebrtcDetection.vue:14-22` | 反复点击 detect。 | `RTCPeerConnection` 从不调用 `pc.close()`，每次检测泄漏一个连接及其 candidate 监听；组件卸载时亦无清理。 |
| webrtc-detection | D12 | `webrtc-detection/WebrtcDetection.vue:23` | 浏览器不支持/拒绝 WebRTC，`new RTCPeerConnection` 抛错。 | 错误文案被 push 进 `ips` 数组，渲染在「detected」结果列表中，与真实 IP 条目外观一致（等宽字体一行），用户无法区分这是错误还是检测结果。 |
| whois-lookup | D4 | `whois-lookup/WhoisLookup.vue:15-22` | 查询不存在的域名（rdap.org 返回 404 JSON `{error:"Not Found"}`）或网络错误返回非预期结构。 | 未检查 `r.ok`，404 响应被当作正常数据解析，输出 name=所查域名、registrar=unknown、status 空的「结果」，用户误以为域名存在但信息未知。 |
| wifi-qr-code-generator | D4 | `wifi-qr-code-generator/WifiQrCodeGenerator.vue:41-53` | 点击「复制」按钮，浏览器拒绝 ClipboardItem 写权限（非安全上下文/未授权），或 dataUrl 解析失败提前 return。 | `navigator.clipboard.write(...)` 为浮动 Promise，无 await、无 catch，失败静默；也无任何成功/失败反馈。 |
| xml-formatter | D5 | `xml-formatter/XmlFormatter.vue:23-27` | 点击复制。 | `navigator.clipboard.writeText` 无 try/catch、无提示（与已知样例 hash-text 同模式）。 |
| xml-to-json | D5 | `xml-to-json/XmlToJson.vue:16-18` | 点击复制。 | 无 try/catch、无提示。 |
| yaml-to-json | D5 | `yaml-to-json/YamlToJson.vue:16-18` | 点击复制。 | 无 try/catch、无提示。 |
| yaml-to-toml | D5 | `yaml-to-toml/YamlToToml.vue:16-18` | 点击复制。 | 无 try/catch、无提示。 |
| yaml-viewer | D5 | `yaml-viewer/YamlViewer.vue:29-31` | 点击复制。 | 无 try/catch、无提示。 |

### P3（60 条）

| 工具 | 分类 | 位置 | 触发 | 实际 |
| --- | --- | --- | --- | --- |
| arithmetic-sequence | D6 | `arithmetic-sequence/ArithmeticSequence.vue:10-15` | 清空 start / diff / count 任意一个 NInputNumber（`:min` 不阻止清空，清空后值为 `null`）。 | `seq` 变为空数组，nth/sum 基于 `null` 算出 `0`/错误值并静默显示，用户看到陈旧或错误的数列结果而无任何提示。 |
| base64-file-converter | D5 | `base64-file-converter/Base64FileConverter.vue:74-76` | 点击「复制」base64 结果。实际：无 try/catch、无成功反馈，同已知样例模式。 |  |
| bip39-generator | D5 | `bip39-generator/Bip39Generator.vue:26` | 点击「复制」。实际：无 try/catch、无成功反馈，同已知样例模式。 |  |
| camera-recorder | D11 | `camera-recorder/CameraRecorder.vue:96-101, 141-146` | 录制若干视频后直接离开工具页（或录制中离开，`onBeforeUnmount` 调 `stopRecording` 触发 `onstop` 再创建 blob URL）。 | `onBeforeUnmount` 只停轨道和录制，`recordings` 中的 object URL 全部泄漏。 |
| camera-recorder | D3 | `camera-recorder/CameraRecorder.vue:135-139, 223` | 点击某条录制的「清除」按钮。 | 立即 `splice` 删除录制项（仅 revoke 了 URL），录制的视频不可恢复，无确认。 |
| check-leap-years | D5 | `check-leap-years/CheckLeapYears.vue:18-20` | 多行年份判定结果生成后想取走结果。 | 输出区无任何复制入口，只能手动框选。 |
| check-leap-years | D8 | `check-leap-years/CheckLeapYears.vue:11` | 输入 `2023abc` 或 `3.7` 等畸形数字。 | `parseInt` 静默截断（`2023abc`→2023 并给出闰年判定，`3.7`→3），纯非法 token 被静默丢弃，用户无从知道哪些输入被处理。 |
| color-converter | D5 | `color-converter/ColorConverter.vue:54-55` | 用户想取走 hsl()/rgb() 或 hex 值。 | 三个结果均为 readonly 输入框，无复制按钮。 |
| color-converter | D8 | `color-converter/ColorConverter.vue:19` | 在 hex 输入框键入 `#fff`（合法 3 位简写）或 `#gggggg` 等非法值。 | watch 的正则只认 6 位，输入被静默忽略，R/G/B 与预览保持旧值且不给出任何提示，用户误以为已生效。 |
| compress-pdf | D11 | `compress-pdf/CompressPdf.vue:25` | 多次压缩 / 切换文件 / 离开页面。 | `URL.createObjectURL` 的结果从未 `revokeObjectURL`。 |
| convert-to-jpg | D11 | `convert-to-jpg/ConvertToJpg.vue:27` | 反复选择文件转换。 | 从未 revoke。 |
| convert-to-pdf | D11 | `convert-to-pdf/ConvertToPdf.vue:23,26` | 多次转换或离开页面。 | 从未 revoke。 |
| convert-to-webp | D11 | `convert-to-webp/ConvertToWebp.vue:25` | 多次转换或离开页面。 | 从未 revoke。 |
| crontab-generator | D5 | `crontab-generator/CrontabGenerator.vue:71-79` | 生成表达式后想复制使用。 | 仅以 NTag 展示，无复制按钮。 |
| emoji-picker | D5 | `emoji-picker/EmojiPicker.vue:19,26-28` | 搜索一个不存在的名称（如 `xyz`）。 | emoji 网格静默清空，用户无法区分"无结果"和"组件坏了"。 |
| gif-change-speed | D7 | `gif-change-speed/GifChangeSpeed.vue:43-72,102` | 对大 GIF 执行变速。 | 仅有一个静态"处理中"提示，无进度百分比、无取消按钮，用户只能等或刷新。 |
| global-latency-test | D9 | `global-latency-test/GlobalLatencyTest.vue:40-41` | 在域名输入框中输入目标后按回车键。 | 无任何反应，必须鼠标点击按钮。 |
| image-change-colors | D11 | `image-change-colors/ImageChangeColors.vue:27` | 反复上传不同图片，或离开该工具页面。 | `URL.createObjectURL` 的结果从不 `revokeObjectURL`，每次换图泄漏一个，组件卸载也不清理。 |
| image-change-opacity | D11 | `image-change-opacity/ImageChangeOpacity.vue:28` | 多次点击「应用」。 | 每次 process 都 `URL.createObjectURL(file.value)` 赋给 `img.src` 且从不 revoke。 |
| image-compress | D11 | `image-compress/ImageCompress.vue:31` | 多次点击「压缩」。 | `URL.createObjectURL(file.value)` 从不 revoke；`toBlob` 返回 null 时也无任何失败反馈（newSize 保持 0，界面显示 next: 0.0 KB）。 |
| image-create-transparent | D11 | `image-create-transparent/ImageCreateTransparent.vue:22` | 反复换图/离开页面。/ 实际：`URL.createObjectURL` 从不 revoke。 |  |
| image-crop | D11 | `image-crop/ImageCrop.vue:54` | 反复换图/离开页面。/ 实际：`URL.createObjectURL` 从不 revoke。 |  |
| image-editor | D11 | `image-editor/ImageEditor.vue:41` | 反复换图/离开页面。/ 实际：`URL.createObjectURL` 从不 revoke。 |  |
| image-editor | D3 | `image-editor/ImageEditor.vue:59-62, 245` | 画多条线/文字后误点「清空全部」。 | 一键清空全部标注，无确认、无撤销。 |
| image-flip | D11 | `image-flip/ImageFlip.vue:29` | 多次点击「翻转」。/ 实际：每次 `URL.createObjectURL(file.value)` 从不 revoke。 |  |
| image-remove-background | D11 | `image-remove-background/ImageRemoveBackground.vue:26` | 反复换图/离开页面。/ 实际：`URL.createObjectURL` 从不 revoke。 |  |
| image-resize | D11 | `image-resize/ImageResize.vue:27` | 多次点击「调整大小」。/ 实际：每次 `URL.createObjectURL(file.value)` 从不 revoke。 |  |
| image-rotate | D11 | `image-rotate/ImageRotate.vue:32` | 多次点击「旋转」。/ 实际：每次 `URL.createObjectURL(file.value)` 从不 revoke。 |  |
| image-split | D11 | `image-split/ImageSplit.vue:22` | 连续选择多张图片或离开页面。 | 从未释放，内存泄漏。 |
| image-split | D4 | `image-split/ImageSplit.vue:28-47` | 上传损坏/伪装成图片的文件（`accept` 可被绕过），点击 Split。 | 只注册了 `img.onload`，`onerror` 缺失，点击后无任何反应，用户不知道发生了什么。 |
| image-to-text-ocr | D11 | `image-to-text-ocr/ImageToTextOcr.vue:42` | 连续选择多张图片或离开页面。 | 从未释放。 |
| image-watermark | D11 | `image-watermark/ImageWatermark.vue:33` | 多次点击「加水印」或离开页面。 | 从未释放。 |
| image-watermark | D6 | `image-watermark/ImageWatermark.vue:14` | 点击下载加水印结果。 | `a.download = 'watermarked'`，保存的文件无扩展名，部分系统下无法双击打开。 |
| images-to-gif | D2 | `images-to-gif/ImagesToGif.vue:17-22,34-78` | 点击「创建 GIF」后在 ffmpeg 执行期间（长任务）重新选择文件列表。 | `onFileChange` 清空了 `resultData`/`error`，但进行中的任务结束后仍会把**旧文件列表**的 GIF 写入 `resultData`，覆盖用户的新选择，陈旧结果重新出现。 |
| json-diff | D6 | `json-diff/JsonDiff.vue:48-55` | 左侧粘贴字面量 `null`（合法 JSON），右侧留空。 | 空文本框被当作 `null` 解析（`leftJson ? ... : null`），`a === null && b === null` 直接返回「无差异」，用户粘贴的 `null` 与未输入被判定相同。 |
| json-escape | D6 | `json-escape/JsonEscape.vue:15,24` | unescape 模式输入合法但非字符串的 JSON，如 `123`、`true`、`{"a":1}`。 | `JSON.parse` 返回 number/boolean/object，被直接作为 NInput 的 `value` 传入，对象渲染为 `[object Object]`，且类型与 NInput 的 string 要求不符。 |
| list-group | D3 | `list-group/ListGroup.vue:13` | 输入含空行的列表并分组。 | `.filter(Boolean)` 静默删除空行后再分组，分组结果与输入行数不对应，无提示。 |
| mac-lookup | D9 | `mac-lookup/MacLookup.vue:29-30` | 在输入框按回车。 | 无 `@keyup.enter`，只能点按钮。 |
| morse-code | D8 | `morse-code/MorseCode.vue:17` | 输入含不可映射字符的文本，如 `héllo!` 或中文。 | `MORSE[c] \|\| ''` + `filter(Boolean)` 静默丢弃这些字符，用户拿到的摩斯码缺字无感知。 |
| mtr-test | D7 | `mtr-test/MtrTest.vue:15-33,40-41` | 对远程主机发起 MTR 测试（后端耗时可达数十秒），执行期间修改 target 输入框。 | 仅按钮有 loading（naive-ui loading 态阻止重复点击），target 输入框仍可编辑，运行期间改输入会使返回结果与当前输入不符；全程无进度、无取消。 |
| numeronym-generator | D5 | `numeronym-generator/NumeronymGenerator.vue:15-17` | 生成 numeronym 后想复制结果。 | 模板中没有接任何复制按钮，`copyOutput` 为未引用的死代码，用户只能手动选中复制。 |
| otp-generator | D9 | `otp-generator/OtpGenerator.vue:116-117` | 在验证输入框按回车。 | 只能点按钮。 |
| pdf-editor | D11 | `pdf-editor/PdfEditor.vue:99` | 多次应用/更换文件。 | 从不 revoke，重复操作累积泄漏 blob URL。 |
| pdf-extract-images | D7 | `pdf-extract-images/PdfExtractImages.vue:45-55` | 提取页数很多的 PDF。 | 仅按钮 loading，用户无法感知进度，也无法取消。 |
| pdf-merge | D11 | `pdf-merge/PdfMerge.vue:28` | 多次合并。 | 从不释放，重复合并累积泄漏。 |
| pdf-protect | D11 | `pdf-protect/PdfProtect.vue:22` | （同模式见 pdf-rotate、pdf-split、pdf-to-epub、pdf-to-png） 反复处理文件或离开页面。 | 从不 revoke；`onFile` 切换文件时旧 URL 仅被置空未释放，内存泄漏。 |
| percentage-calc | D6 | `percentage-calc/PercentageCalc.vue:13` | 清空第一个「What is a% of b?」的任一输入框（NInputNumber 值变为 null）。 | `null/100*b` 得 0，结果区显示 `0.0000`，与真实输入 0 无法区分，误导用户。 |
| random-number-generator | D8 | `random-number-generator/RandomNumberGenerator.vue:14-15` | 清空 min 或 max 输入框（值为 null）后点击生成。 | `Math.floor(Math.random()*NaN)+null` 产出 NaN，结果区显示 "NaN"。 |
| random-port-generator | D10 | `random-port-generator/RandomPortGenerator.vue:46-48` | 当当前显示端口恰为常用端口（如 8080）时，打开「Exclude common ports」开关。 | 开关只影响下次 `refresh()` 的生成逻辑，已显示的端口保持不变，界面出现「已排除常用端口却仍显示 8080」的自相矛盾状态，直到用户手动点 reset。 |
| roman-numeral-converter | D6 | `roman-numeral-converter/roman-numeral-converter.service.ts:10,22` | + `RomanNumeralConverter.vue:16,46` 清空罗马数字输入框。 | `ROMAN_NUMBER_REGEX` 匹配空字符串，`isValidRomanNumber('')` 为 true，`romanToArabic('')` 返回 0，界面显示「0」且复制按钮可用（复制出 "0"）。 |
| screenshot-share | D5 | `screenshot-share/ScreenshotShare.vue:45-55` | 截图成功后点击「复制到剪贴板」，复制成功时。 | 仅失败路径写 `errorMsg`，成功路径无任何反馈，用户需自行粘贴验证。 |
| speed-test | D7 | `speed-test/SpeedTest.vue:18-24` | 慢网络下开始测速（需下载 10MB），用户想中止或查看进度。 | 无进度显示、无取消按钮，只能等 10MB 下完或离开页面。 |
| text-censor | D6 | `text-censor/TextCensor.vue:11-13` | 输入包含敏感词子串的正常单词，如 `hello`（含 `hell`）、`shell`、`hacker`（部分匹配 `hack` 的情形之外）等。 | 纯子串替换无词边界判断，`hello` → `h***o`、`shell` → `s***l`，正常文本被静默改写成错误输出。 |
| token-generator | D8 | `token-generator/TokenGenerator.vue:21,54` | 关闭全部四个字符集开关后点击「复制」 | `createToken` 返回 `''`，复制按钮未 disabled，点击把空字符串写入剪贴板，无任何提示 |
| video-compress | D11 | `video-compress/VideoCompress.vue:16,69-70` | 每次处理成功都会 `URL.createObjectURL` 生成 `resultUrl`。 | `resultUrl` 模板中从未使用，也从不 revoke，每次处理泄漏一个 blob URL 直到页面卸载。 |
| video-flip | D11 | `video-flip/VideoFlip.vue:16,68-69` | 同 video-compress，每次处理成功创建 `resultUrl`。 | 从未使用、从不 revoke，逐次泄漏 blob URL。 |
| video-resize | D11 | `video-resize/VideoResize.vue:18,68-69` | 每次处理成功创建 `resultUrl`。 | 模板未使用、从不 revoke，逐次泄漏。 |
| video-rotate | D11 | `video-rotate/VideoRotate.vue:16,74-75` | 每次处理成功创建 `resultUrl`。 | 模板未使用、从不 revoke，逐次泄漏。 |
| video-trim | D11 | `video-trim/VideoTrim.vue:17,62-63` | 每次处理成功创建 `resultUrl`。 | 模板未使用、从不 revoke，逐次泄漏。 |
| whois-lookup | D9 | `whois-lookup/WhoisLookup.vue:30-31` | 在域名输入框按回车。 | 无 `@keyup.enter`，必须鼠标点击按钮。 |

## 六、干净工具（未发现交互逻辑问题）

audio-change-speed, audio-converter, audio-extract, audio-loop, audio-merge, audio-trim, browser-fingerprint, byte-converter, censorship-check, chronometer, create-palindrome, csv-to-tsv, csv-transpose, dns-leak-test, extract-substring, hello-world, html-entities, http-status, ipv4-range-expander, ipv4-subnet-calculator, json-validate, jwt-parser, list-find-popular, list-find-unique, list-reverse, list-rotate, list-unwrap, list-wrap, palindrome-checker, password-strength-analyser, pdf-signature-checker, pdf-to-epub, pdf-to-png, quote-generator, regex-memo, regex-tester, remove-duplicate-lines, rot13, security-checklist, slugify, string-obfuscator, temperature, text-diff, text-repeat, text-reverse, text-rotate, text-split, text-statistics, text-truncate, time-between-dates, tsv-to-json, video-crop, video-merge, video-to-gif, xml-validator

## 七、覆盖清单

| 工具 | 结论 |
| --- | --- |
| arithmetic-sequence | D6/P3 ×1 |
| audio-change-speed | clean |
| audio-converter | clean |
| audio-extract | clean |
| audio-loop | clean |
| audio-merge | clean |
| audio-trim | clean |
| base-converter | D6/P1 ×1 |
| base64-encoder | D3/P2、D5/P2 ×2 |
| base64-file-converter | D8/P2、D5/P3 ×2 |
| basic-auth-generator | D4/P1 ×1 |
| bcrypt | D7/P1、D12/P2 ×2 |
| benchmark-builder | D7/P1、D4/P2 ×2 |
| bip39-generator | D1/P1、D5/P3 ×2 |
| browser-fingerprint | clean |
| byte-converter | clean |
| camera-recorder | D11/P3、D3/P3 ×2 |
| case-converter | D5/P2 ×1 |
| censorship-check | clean |
| check-leap-years | D5/P3、D8/P3 ×2 |
| chmod-calculator | D5/P2 ×1 |
| chronometer | clean |
| color-converter | D5/P3、D8/P3 ×2 |
| compress-pdf | D4/P1、D2/P2、D7/P2、D11/P3 ×4 |
| connectivity-check | D7/P2 ×1 |
| convert-to-jpg | D4/P1、D11/P3 ×2 |
| convert-to-pdf | D4/P1、D4/P2、D11/P3 ×3 |
| convert-to-webp | D4/P1、D11/P3 ×2 |
| create-palindrome | clean |
| crontab-generator | D6/P2、D5/P3 ×2 |
| csv-change-separator | D6/P1 ×1 |
| csv-find-incomplete | D6/P2 ×1 |
| csv-insert-columns | D6/P1 ×1 |
| csv-rows-to-columns | D6/P1 ×1 |
| csv-swap-columns | D6/P2 ×1 |
| csv-to-json | D3/P2 ×1 |
| csv-to-tsv | clean |
| csv-to-xml | D6/P1 ×1 |
| csv-to-yaml | D12/P2、D3/P2 ×2 |
| csv-transpose | clean |
| date-time-converter | D5/P2、D6/P2 ×2 |
| date-weekday-calculator | D6/P0、D12/P2 ×2 |
| days-to-hours | D6/P2 ×1 |
| discord-timestamp | D6/P1、D12/P2 ×2 |
| dns-leak-test | clean |
| dns-resolver | D4/P1 ×1 |
| docker-compose-to-1panel | D5/P2 ×1 |
| docker-run-to-compose | D6/P1、D5/P2 ×2 |
| email-extractor | D12/P2 ×1 |
| email-normalizer | D5/P2 ×1 |
| emoji-picker | D5/P2、D5/P3 ×2 |
| encryption | D2/P2、D5/P2 ×2 |
| eta-calculator | D6/P2 ×1 |
| extract-substring | clean |
| generic-calculator | D12/P2、D6/P2、D8/P2 ×3 |
| gif-change-speed | D11/P2、D7/P3 ×2 |
| git-memo | D5/P2 ×1 |
| global-latency-test | D9/P3 ×1 |
| hash-text | D5/P2 ×1 |
| hello-world | clean |
| hidden-char-detector | D6/P2 ×1 |
| hmac-generator | D5/P2 ×1 |
| hours-to-days | D8/P2 ×1 |
| html-entities | clean |
| html-wysiwyg-editor | D1/P1、D5/P2 ×2 |
| http-status | clean |
| image-change-colors | D11/P3 ×1 |
| image-change-opacity | D11/P3 ×1 |
| image-compress | D11/P3 ×1 |
| image-create-transparent | D1/P2、D11/P3 ×2 |
| image-crop | D8/P2、D11/P3 ×2 |
| image-editor | D2/P1、D1/P2、D11/P3、D3/P3 ×4 |
| image-flip | D11/P3 ×1 |
| image-remove-background | D11/P3 ×1 |
| image-resize | D11/P3 ×1 |
| image-rotate | D11/P3 ×1 |
| image-split | D2/P1、D11/P3、D4/P3 ×3 |
| image-to-text-ocr | D5/P2、D11/P3 ×2 |
| image-watermark | D4/P1、D11/P3、D6/P3 ×3 |
| images-to-gif | D2/P3 ×1 |
| info-masking | D6/P0、D5/P2 ×2 |
| ip-info | D4/P2 ×1 |
| ipv4-address-converter | D5/P2 ×1 |
| ipv4-range-expander | clean |
| ipv4-subnet-calculator | clean |
| ipv6-ula-generator | D5/P2 ×1 |
| jpg-to-png | D4/P2 ×1 |
| json-diff | D6/P3 ×1 |
| json-escape | D12/P2、D6/P3 ×2 |
| json-minify | D5/P2 ×1 |
| json-prettify | D5/P2 ×1 |
| json-sort | D12/P2、D6/P2 ×2 |
| json-stringify | D12/P2 ×1 |
| json-to-csv | D5/P2 ×1 |
| json-to-toml | D5/P2 ×1 |
| json-to-xml | D5/P2 ×1 |
| json-to-yaml | D5/P2、D6/P2 ×2 |
| json-validate | clean |
| json-viewer | D5/P2 ×1 |
| jwt-parser | clean |
| keycode-info | D9/P1、D5/P2 ×2 |
| list-converter | D5/P2、D6/P2 ×2 |
| list-duplicate | D3/P2 ×1 |
| list-find-popular | clean |
| list-find-unique | clean |
| list-group | D6/P0、D3/P3 ×2 |
| list-reverse | clean |
| list-rotate | clean |
| list-shuffle | D3/P2 ×1 |
| list-sort | D3/P0、D6/P2 ×2 |
| list-truncate | D3/P2 ×2 |
| list-unwrap | clean |
| list-wrap | D3/P2 ×1 |
| lorem-ipsum | D5/P2 ×1 |
| mac-address-generator | D1/P1、D5/P2 ×2 |
| mac-lookup | D6/P2、D9/P3 ×2 |
| markdown-to-html | D5/P2 ×1 |
| math-evaluator | D6/P1、D12/P2 ×2 |
| meta-tag-generator | D5/P2 ×1 |
| mime-types | D5/P2 ×1 |
| morse-code | D6/P2、D8/P3 ×2 |
| mtr-test | D7/P3 ×1 |
| number-generator | D6/P1、D8/P1 ×2 |
| number-sum | D6/P2 ×1 |
| number-to-words | D8/P2 ×1 |
| numeronym-generator | D5/P3 ×1 |
| otp-generator | D2/P1、D5/P2、D9/P3 ×3 |
| palindrome-checker | clean |
| password-generator | D12/P2 ×1 |
| password-strength-analyser | clean |
| pdf-editor | D2/P2、D11/P3 ×2 |
| pdf-extract-images | D11/P2、D7/P3 ×2 |
| pdf-merge | D2/P2、D11/P3 ×2 |
| pdf-protect | D12/P1、D4/P1、D11/P3 ×3 |
| pdf-rotate | D4/P1、D6/P2 ×2 |
| pdf-signature-checker | clean（有 try/catch + 错误 alert + 状态重置） |
| pdf-split | D4/P1、D8/P2 ×2 |
| pdf-to-epub | clean（有 try/catch + 错误 alert；产物为 txt 但下载按钮如实标注为文本） |
| pdf-to-png | clean（有 try/catch + 错误 alert + scale 上下界；D11/P3 见 pdf-protect 记录） |
| percentage-calc | D6/P3 ×1 |
| ping-test | D9/P2 ×1 |
| qr-code-generator | D2/P2、D4/P2、D5/P2 ×3 |
| quote-generator | clean（按钮状态联动正常） |
| random-number-generator | D6/P0、D8/P1、D8/P3 ×3 |
| random-port-generator | D5/P2、D10/P3 ×2 |
| regex-memo | clean（纯静态参考表，无交互逻辑） |
| regex-tester | clean（非法正则有错误提示，高亮转义正确） |
| remove-duplicate-lines | clean（实时 computed，保序去重，无静默丢失） |
| roman-numeral-converter | D5/P2、D6/P3 ×2 |
| rot13 | clean（实时 computed，大小写处理正确） |
| rsa-key-pair-generator | D5/P2、D7/P2 ×2 |
| rule-test | D9/P2 ×1 |
| safelink-decoder | D5/P2 ×1 |
| screenshot-share | D5/P3 ×1 |
| seconds-to-time | D8/P2 ×1 |
| security-checklist | clean |
| service-status | D12/P2 ×1 |
| slugify | clean |
| speed-test | D4/P1、D7/P3 ×2 |
| sql-prettify | D5/P2 ×1 |
| string-obfuscator | clean |
| svg-placeholder-generator | D5/P2、D8/P2 ×2 |
| temperature | clean |
| text-censor | D6/P3 ×1 |
| text-diff | clean（逐行位置 diff 为既定简单算法，按设计选择处理） |
| text-join | D3/P2 ×1 |
| text-repeat | clean |
| text-replacer | D12/P2 ×1 |
| text-reverse | clean |
| text-rotate | clean（负数 positions 已由取模归一化处理） |
| text-split | clean |
| text-statistics | clean |
| text-to-binary | D4/P2、D5/P2、D8/P2 ×3 |
| text-to-nato-alphabet | D5/P2 ×1 |
| text-to-unicode | D5/P2 ×1 |
| text-truncate | clean |
| time-between-dates | clean |
| time-to-decimal | D8/P2 ×1 |
| time-to-seconds | D8/P2 ×1 |
| token-generator | D1/P1、D5/P2、D8/P3 ×3 |
| toml-to-json | D5/P2 ×1 |
| toml-to-yaml | D5/P2 ×1 |
| truncate-clock-time | D8/P2 ×1 |
| tsv-to-json | clean |
| ulid-generator | D1/P1、D5/P2 ×2 |
| url-encoder | D4/P1 ×1 |
| url-parser | D6/P2 ×1 |
| user-agent-parser | D5/P2 ×1 |
| uuid-generator | D1/P1、D5/P2 ×2 |
| video-add-audio | D7/P2 ×1 |
| video-change-speed | D6/P1、D6/P2 ×2 |
| video-compress | D11/P3 ×1 |
| video-crop | clean |
| video-flip | D11/P3 ×1 |
| video-loop | D6/P1 ×1 |
| video-merge | clean |
| video-resize | D11/P3 ×1 |
| video-rotate | D11/P3 ×1 |
| video-to-gif | clean |
| video-trim | D11/P3 ×1 |
| webrtc-detection | D11/P2、D12/P2 ×2 |
| whois-lookup | D4/P2、D9/P3 ×2 |
| wifi-qr-code-generator | D4/P2 ×1 |
| xml-formatter | D6/P1、D5/P2 ×2 |
| xml-to-json | D5/P2 ×1 |
| xml-validator | clean |
| yaml-to-json | D5/P2 ×1 |
| yaml-to-toml | D5/P2 ×1 |
| yaml-viewer | D5/P2 ×1 |
