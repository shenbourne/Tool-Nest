# Batch 11

## 概要
- 审计工具数：19
- 发现：P0 0 条 / P1 3 条 / P2 8 条 / P3 7 条
- clean 工具：video-crop, video-merge, video-to-gif, xml-validator

## 发现

### video-change-speed
1. **D6 / P1** `apps/web/src/tools/video-change-speed/VideoChangeSpeed.vue:51-63`
   - 触发：选择速度选项「4x」(value='4')，点击变速。
   - 期望：正常输出 4 倍速视频 / 实际：`atempo=1/4=0.25`，ffmpeg atempo 滤镜参数合法范围为 [0.5, 100]，0.25 越界，exec 报错、无输出文件，处理必然失败（用户只看到错误信息，该选项完全不可用）。
   - 修复建议：atempo>2 时用链式 `atempo=2,atempo=2`（如 4x → 1/4 = 0.5*0.5），或对 >2 倍速做分拆解。
   - 真实缺陷理由：界面提供的选项 100% 失败，属边界逻辑错误而非设计选择。
2. **D6 / P2** `apps/web/src/tools/video-change-speed/VideoChangeSpeed.vue:61`
   - 触发：上传无音轨的视频（如无声录屏），任意速度处理。
   - 期望：视频变速完成 / 实际：`-filter:a atempo=...` 匹配不到音频流，ffmpeg 报错，所有速度下均失败。
   - 修复建议：先用 ffprobe 判断音轨，无音轨时去掉 `-filter:a` 或加 `-an`。
   - 真实缺陷理由：常见输入（无声视频）在所有选项下均失败且无变通路径。

### video-compress
1. **D11 / P3** `apps/web/src/tools/video-compress/VideoCompress.vue:16,69-70`
   - 触发：每次处理成功都会 `URL.createObjectURL` 生成 `resultUrl`。
   - 期望：用到并在替换/卸载时 revoke / 实际：`resultUrl` 模板中从未使用，也从不 revoke，每次处理泄漏一个 blob URL 直到页面卸载。
   - 修复建议：删除该变量及创建代码，或在 `onFileChange`/卸载时 revoke。
   - 真实缺陷理由：`createObjectURL` 无对应 `revokeObjectURL`，属资源生命周期缺陷。

### video-flip
1. **D11 / P3** `apps/web/src/tools/video-flip/VideoFlip.vue:16,68-69`
   - 触发：同 video-compress，每次处理成功创建 `resultUrl`。
   - 期望：使用并释放 / 实际：从未使用、从不 revoke，逐次泄漏 blob URL。
   - 修复建议：删除无用代码。
   - 真实缺陷理由：同上，资源未释放。

### video-loop
1. **D6 / P1** `apps/web/src/tools/video-loop/VideoLoop.vue:49`
   - 触发：任意视频，loopCount=3，点击 loop。
   - 期望：整个视频重复播放 3 次 / 实际：ffmpeg `loop` 滤镜的语义是「从 start 起缓存 size 帧并重复」，`size=1` 只缓存第 0 帧，输出仅为首帧重复数次的一小段冻结画面，原视频其余内容全部丢失，且无任何报错。
   - 修复建议：改用输入选项 `-stream_loop <N>`，或 concat 整文件；若用 loop 滤镜须 size 覆盖全片帧数（不可行）。
   - 真实缺陷理由：结果完全错误（内容丢失）且静默，用户会下载到损坏产物。

### video-resize
1. **D11 / P3** `apps/web/src/tools/video-resize/VideoResize.vue:18,68-69`
   - 触发：每次处理成功创建 `resultUrl`。
   - 期望：使用并释放 / 实际：模板未使用、从不 revoke，逐次泄漏。
   - 修复建议：删除无用代码。
   - 真实缺陷理由：资源未释放。

### video-rotate
1. **D11 / P3** `apps/web/src/tools/video-rotate/VideoRotate.vue:16,74-75`
   - 触发：每次处理成功创建 `resultUrl`。
   - 期望：使用并释放 / 实际：模板未使用、从不 revoke，逐次泄漏。
   - 修复建议：删除无用代码。
   - 真实缺陷理由：资源未释放。

### video-trim
1. **D11 / P3** `apps/web/src/tools/video-trim/VideoTrim.vue:17,62-63`
   - 触发：每次处理成功创建 `resultUrl`。
   - 期望：使用并释放 / 实际：模板未使用、从不 revoke，逐次泄漏。
   - 修复建议：删除无用代码。
   - 真实缺陷理由：资源未释放。

### webrtc-detection
1. **D12 / P2** `apps/web/src/tools/webrtc-detection/WebrtcDetection.vue:23`
   - 触发：浏览器不支持/拒绝 WebRTC，`new RTCPeerConnection` 抛错。
   - 期望：以错误提示呈现 / 实际：错误文案被 push 进 `ips` 数组，渲染在「detected」结果列表中，与真实 IP 条目外观一致（等宽字体一行），用户无法区分这是错误还是检测结果。
   - 修复建议：用独立的 `error` ref + NAlert(type=error) 展示，不混入结果列表。
   - 真实缺陷理由：错误信息被写入结果区（与已知样例 TextReplacer D12 同类）。
2. **D11 / P2** `apps/web/src/tools/webrtc-detection/WebrtcDetection.vue:14-22`
   - 触发：反复点击 detect。
   - 期望：每次检测结束后关闭连接 / 实际：`RTCPeerConnection` 从不调用 `pc.close()`，每次检测泄漏一个连接及其 candidate 监听；组件卸载时亦无清理。
   - 修复建议：`onicegatheringstatechange` complete 分支及 5s 超时分支中调用 `pc.close()`；onUnmounted 兜底。
   - 真实缺陷理由：媒体/网络资源未在结束时释放。

### whois-lookup
1. **D4 / P2** `apps/web/src/tools/whois-lookup/WhoisLookup.vue:15-22`
   - 触发：查询不存在的域名（rdap.org 返回 404 JSON `{error:"Not Found"}`）或网络错误返回非预期结构。
   - 期望：告知用户查询失败 / 实际：未检查 `r.ok`，404 响应被当作正常数据解析，输出 name=所查域名、registrar=unknown、status 空的「结果」，用户误以为域名存在但信息未知。
   - 修复建议：`if (!r.ok) throw new Error(...)` 后再解析。
   - 真实缺陷理由：失败被静默吞掉并以「无数据的结果」呈现，失败与成功不可区分（与已知样例 DnsResolver D4 同类）。
2. **D9 / P3** `apps/web/src/tools/whois-lookup/WhoisLookup.vue:30-31`
   - 触发：在域名输入框按回车。
   - 期望：触发查询 / 实际：无 `@keyup.enter`，必须鼠标点击按钮。
   - 修复建议：`NInput` 加 `@keyup.enter="lookup"`。
   - 真实缺陷理由：单字段查询工具缺少键盘提交。

### wifi-qr-code-generator
1. **D4 / P2** `apps/web/src/tools/wifi-qr-code-generator/WifiQrCodeGenerator.vue:41-53`
   - 触发：点击「复制」按钮，浏览器拒绝 ClipboardItem 写权限（非安全上下文/未授权），或 dataUrl 解析失败提前 return。
   - 期望：失败时告知用户 / 实际：`navigator.clipboard.write(...)` 为浮动 Promise，无 await、无 catch，失败静默；也无任何成功/失败反馈。
   - 修复建议：`await` 并 try/catch，配合 message 反馈。
   - 真实缺陷理由：async 操作无错误处理且失败不可见。

### xml-formatter
1. **D6 / P1** `apps/web/src/tools/xml-formatter/xml-formatter.service.ts:46-48,58-59`
   - 触发：输入含转义实体的文本节点，如 `<a>x &amp; y</a>`，format 模式。
   - 期望：输出仍为合法 XML（`x &amp; y`）/ 实际：`textContent` 返回已解码文本 `x & y`，被原样拼进输出（第 48/59 行未做转义），产出非法 XML `<a>x & y</a>`；属性值有 `escapeAttrValue` 而文本节点没有，不一致。用户复制到下游解析直接报错。
   - 修复建议：对写入的文本节点按 `& < >` 重新转义（CDATA 分支除外）。
   - 真实缺陷理由：静默产出错误结果（已知样例 TextReplacer 同类严重度）。
2. **D5 / P2** `apps/web/src/tools/xml-formatter/XmlFormatter.vue:23-27`
   - 触发：点击复制。
   - 期望：成功/失败有反馈 / 实际：`navigator.clipboard.writeText` 无 try/catch、无提示（与已知样例 hash-text 同模式）。
   - 修复建议：try/catch + message.success/error。
   - 真实缺陷理由：复制失败静默，成功无确认。

### xml-to-json
1. **D5 / P2** `apps/web/src/tools/xml-to-json/XmlToJson.vue:16-18`
   - 触发：点击复制。
   - 期望：有成功/失败反馈 / 实际：无 try/catch、无提示。
   - 修复建议：同上加反馈。
   - 真实缺陷理由：复制操作无结果反馈。

### yaml-to-json
1. **D5 / P2** `apps/web/src/tools/yaml-to-json/YamlToJson.vue:16-18`
   - 触发：点击复制。
   - 期望：有反馈 / 实际：无 try/catch、无提示。
   - 修复建议：同上。
   - 真实缺陷理由：复制操作无结果反馈。

### yaml-to-toml
1. **D5 / P2** `apps/web/src/tools/yaml-to-toml/YamlToToml.vue:16-18`
   - 触发：点击复制。
   - 期望：有反馈 / 实际：无 try/catch、无提示。
   - 修复建议：同上。
   - 真实缺陷理由：复制操作无结果反馈。

### yaml-viewer
1. **D5 / P2** `apps/web/src/tools/yaml-viewer/YamlViewer.vue:29-31`
   - 触发：点击复制。
   - 期望：有反馈 / 实际：无 try/catch、无提示。
   - 修复建议：同上。
   - 真实缺陷理由：复制操作无结果反馈。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| video-change-speed | D6/P1（4x 选项必失败）、D6/P2（无声视频必失败） |
| video-compress | D11/P3（resultUrl 泄漏） |
| video-crop | clean |
| video-flip | D11/P3（resultUrl 泄漏） |
| video-loop | D6/P1（loop 滤镜 size=1 只循环首帧，结果错误） |
| video-merge | clean |
| video-resize | D11/P3（resultUrl 泄漏） |
| video-rotate | D11/P3（resultUrl 泄漏） |
| video-to-gif | clean |
| video-trim | D11/P3（resultUrl 泄漏） |
| webrtc-detection | D12/P2（错误混入结果列表）、D11/P2（RTCPeerConnection 未关闭） |
| whois-lookup | D4/P2（404 当作成功）、D9/P3（无回车提交） |
| wifi-qr-code-generator | D4/P2（clipboard.write 浮动 Promise 静默失败） |
| xml-formatter | D6/P1（文本节点实体未转义产出非法 XML）、D5/P2（复制无反馈） |
| xml-to-json | D5/P2（复制无反馈） |
| xml-validator | clean |
| yaml-to-json | D5/P2（复制无反馈） |
| yaml-to-toml | D5/P2（复制无反馈） |
| yaml-viewer | D5/P2（复制无反馈） |
