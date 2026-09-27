# Batch 01

## 概要
- 审计工具数：19
- 发现：P0 0 条 / P1 5 条 / P2 6 条 / P3 6 条
- clean 工具：audio-change-speed, audio-converter, audio-extract, audio-loop, audio-merge, audio-trim, browser-fingerprint, byte-converter, censorship-check

## 发现

### arithmetic-sequence
1. **D6 / P3** `apps/web/src/tools/arithmetic-sequence/ArithmeticSequence.vue:10-15`
   - 触发：清空 start / diff / count 任意一个 NInputNumber（`:min` 不阻止清空，清空后值为 `null`）。
   - 期望：提示输入无效或禁用清空。实际：`seq` 变为空数组，nth/sum 基于 `null` 算出 `0`/错误值并静默显示，用户看到陈旧或错误的数列结果而无任何提示。
   - 修复建议：对 `null`/非有限值返回错误提示文案（与 base-converter 的 invalidInput 一致）。
   - 真实缺陷理由：清空输入是常规操作，产生错误结果且无反馈。

### base-converter
1. **D6 / P1** `apps/web/src/tools/base-converter/BaseConverter.vue:22-23`
   - 触发：输入包含当前进制非法字符或小数，如 base10 输入 `1A3` 或 `255.9`。
   - 期望：整体校验失败并提示 invalidInput。实际：`parseInt` 遇到非法字符停止，返回 `1` / `255`，界面静默显示错误换算结果，用户会采信错误数值。
   - 修复建议：用 `BigInt(input, base)` 或正则校验整串合法性后再转换。
   - 真实缺陷理由：`parseInt` 部分解析是经典静默截断缺陷，直接产出错误结果（P0/P1 边界，取 P1 因需特定输入）。

### base64-encoder
1. **D3 / P2** `apps/web/src/tools/base64-encoder/Base64Encoder.vue:33-37`
   - 触发：decode 模式下输入非法 base64（output 为 `''`），点击 ⇄ swap。
   - 期望：保留原输入或给出提示。实际：`input.value = prev`（`''`）直接把用户原文覆盖为空，输入内容静默丢失。
   - 修复建议：swap 前判断 `prev` 非空，为空时不覆盖并提示。
   - 真实缺陷理由：一键覆盖且不可撤销，触发条件简单。
2. **D5 / P2** `apps/web/src/tools/base64-encoder/Base64Encoder.vue:29-31`
   - 触发：点击「复制」。
   - 期望：复制成功/失败有提示。实际：`navigator.clipboard.writeText` 无 try/catch、无成功反馈，剪贴板 API 在非安全上下文拒绝时静默失败。
   - 修复建议：与 hash-text 已知样例同法修复（try/catch + message 反馈）。

### base64-file-converter
1. **D8 / P2** `apps/web/src/tools/base64-file-converter/Base64FileConverter.vue:25-30`
   - 触发：粘贴长度非 4 的倍数 / 填充错误的 base64（如 `QUJD` 缺字符、含空格），点击预览或下载。
   - 期望：校验失败并提示。实际：正则 `/^[A-Za-z0-9+/=]+$/` 只查字符集，不校验长度与填充，按钮可用；预览渲染出裂图、下载得到损坏文件，仅 `downloadError` 在下载分支前置校验外无覆盖，预览失败无任何提示。
   - 修复建议：`atob` 试解码校验，或校验 `len % 4 === 0` 及填充位置。
   - 真实缺陷理由：非法输入被静默接受并产出损坏产物。
2. **D5 / P3** `apps/web/src/tools/base64-file-converter/Base64FileConverter.vue:74-76`
   - 触发：点击「复制」base64 结果。实际：无 try/catch、无成功反馈，同已知样例模式。

### basic-auth-generator
1. **D4 / P1** `apps/web/src/tools/basic-auth-generator/BasicAuthGenerator.vue:14-17`
   - 触发：用户名或密码含非 Latin-1 字符（如中文、emoji）。
   - 期望：正确编码（如先 `encodeURIComponent`）或提示不支持字符。实际：`btoa` 直接抛出 `InvalidCharacterError`，异常发生在 computed 内、无 try/catch，Vue 渲染失败，整个结果卡片崩溃空白。
   - 修复建议：改用 `btoa(unescape(encodeURIComponent(...)))`（同 base64-encoder 的做法）或包 try/catch 并提示。
   - 真实缺陷理由：常规输入即可触发组件级渲染崩溃，功能不可用。

### bcrypt
1. **D7 / P1** `apps/web/src/tools/bcrypt/BcryptTool.vue:13-15, 33`
   - 触发：salt 轮数输入框（允许 0–100）设为 25 以上并失焦提交。
   - 期望：限制合理范围或异步计算并禁用输入。实际：`hashSync` 在主线程同步执行且随轮数指数增长，轮数 25 单次哈希约数十分钟，页面完全冻结，无 loading、无进度、无取消，只能杀页面。
   - 修复建议：`:max` 收紧到 ≤20，并将哈希移入 Web Worker 或按钮触发 + loading。
   - 真实缺陷理由：一个合法的界面输入即可使工具永久卡死。
2. **D12 / P2** `apps/web/src/tools/bcrypt/BcryptTool.vue:19-21, 45-47`
   - 触发：compare 区 hash 输入框填入非 bcrypt 格式的任意字符串。
   - 期望：提示「hash 格式非法」。实际：`compareSync` 抛错被 `catch { return false }` 吞掉，界面显示红色「no match」，把「输入错误」伪装成「密码不匹配」，会误导决策。
   - 修复建议：区分 catch 分支，返回 error 态而非 false。
   - 真实缺陷理由：错误信息被呈现为错误结果。

### benchmark-builder
1. **D7 / P1** `apps/web/src/tools/benchmark-builder/benchmark-builder.service.ts:28-37`
   - 触发：某 suite 代码含无限循环（如 `while(true){}`），点击运行。
   - 期望：可取消或有超时保护。实际：warmup 与计时代码均在主线程同步 `new Function` 执行，死循环直接永久冻结页面，无取消、无超时。
   - 修复建议：在 Worker 中执行被测代码，或至少加超时保护。
   - 真实缺陷理由：用户输入任意 JS，死循环是常见情形，触发即页面卡死。
2. **D4 / P2** `apps/web/src/tools/benchmark-builder/benchmark-builder.service.ts:38-41`
   - 触发：多个 suite 中某一个代码运行时报错（如 `undefinedVar()`），点击运行。
   - 期望：告知哪个 suite 失败及原因。实际：`catch { continue }` 静默跳过失败 suite，结果表只显示成功项；只有当全部失败时才显示笼统的 noResults，用户无法区分「代码有 bug」和「确实慢」。
   - 修复建议：收集每 suite 的错误并在结果区/告警中列出。
   - 真实缺陷理由：失败不可见，与 dns-resolver 已知样例同类。

### bip39-generator
1. **D1 / P1** `apps/web/src/tools/bip39-generator/Bip39Generator.vue:27, 39`
   - 触发：点击「重新生成（retry）」按钮。
   - 期望：生成一组新的助记词。实际：`refresh()` 函数体为 `words.value = words.value`，是无操作，按钮永远不改变输出（mnemonic 为依赖 words 的 computed，无其他触发源）。
   - 修复建议：引入 `nonce` ref 并让 computed 依赖它，refresh 递增 nonce。
   - 真实缺陷理由：核心控件为死控件，重新生成功能完全不可用。
2. **D5 / P3** `apps/web/src/tools/bip39-generator/Bip39Generator.vue:26`
   - 触发：点击「复制」。实际：无 try/catch、无成功反馈，同已知样例模式。

### camera-recorder
1. **D11 / P3** `apps/web/src/tools/camera-recorder/CameraRecorder.vue:96-101, 141-146`
   - 触发：录制若干视频后直接离开工具页（或录制中离开，`onBeforeUnmount` 调 `stopRecording` 触发 `onstop` 再创建 blob URL）。
   - 期望：卸载时撤销所有 `URL.createObjectURL`。实际：`onBeforeUnmount` 只停轨道和录制，`recordings` 中的 object URL 全部泄漏。
   - 修复建议：卸载时遍历 `recordings` 调用 `URL.revokeObjectURL`。
2. **D3 / P3** `apps/web/src/tools/camera-recorder/CameraRecorder.vue:135-139, 223`
   - 触发：点击某条录制的「清除」按钮。
   - 期望：二次确认或提供撤销。实际：立即 `splice` 删除录制项（仅 revoke 了 URL），录制的视频不可恢复，无确认。
   - 修复建议：加确认弹窗或软删除。
   - 真实缺陷理由：录制是耗时产出，一键不可逆删除。

### case-converter
1. **D5 / P2** `apps/web/src/tools/case-converter/CaseConverter.vue:36, 46`
   - 触发：点击任一结果输入框执行复制。
   - 期望：有可见的复制控件或复制成功反馈。实际：复制通过 readonly 输入框的 `@click` 隐式触发，无任何成功/失败提示；剪贴板 API 失败（非安全上下文）时用户无从知晓。同类工具均有显式复制按钮 + 反馈。
   - 修复建议：加复制按钮 + message 反馈。
   - 真实缺陷理由：复制是否生效完全不可感知。

## 覆盖清单
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
| base64-encoder | D3/P2 ×1, D5/P2 ×1 |
| base64-file-converter | D8/P2 ×1, D5/P3 ×1 |
| basic-auth-generator | D4/P1 ×1 |
| bcrypt | D7/P1 ×1, D12/P2 ×1 |
| benchmark-builder | D7/P1 ×1, D4/P2 ×1 |
| bip39-generator | D1/P1 ×1, D5/P3 ×1 |
| browser-fingerprint | clean |
| byte-converter | clean |
| camera-recorder | D11/P3 ×1, D3/P3 ×1 |
| case-converter | D5/P2 ×1 |
| censorship-check | clean |
