# Batch 04

## 概要
- 审计工具数：19
- 发现：P0 0 条 / P1 2 条 / P2 8 条 / P3 12 条
- clean 工具：hello-world, http-status, html-entities

## 发现

### global-latency-test
1. **D9 / P3** `apps/web/src/tools/global-latency-test/GlobalLatencyTest.vue:40-41`
   - 触发：在域名输入框中输入目标后按回车键。
   - 期望：与同类单输入表单一致，回车即触发测试。/ 实际：无任何反应，必须鼠标点击按钮。
   - 修复建议：为 NInput 添加 `@keyup.enter="run"`。
   - 真实缺陷理由：单输入框 + 单按钮的执行型工具缺少回车提交，键盘用户无法完成操作路径。

### hash-text
1. **D5 / P2** `apps/web/src/tools/hash-text/HashText.vue:16`（已知样例，记录备查）
   - 触发：点击「复制」。
   - 期望：复制成功/失败有反馈。/ 实际：`navigator.clipboard.writeText` 无 try/catch 且为浮动 promise，失败静默，成功也无提示。
   - 修复建议：await + try/catch + message 反馈。
   - 真实缺陷理由：与已知样例相同，不重复展开。

### hello-world
- clean（纯展示组件，无交互逻辑）。

### hidden-char-detector
1. **D6 / P2** `apps/web/src/tools/hidden-char-detector/HiddenCharDetector.vue:13`
   - 触发：粘贴包含换行符（`\n`/`\r`）的普通多行文本。
   - 期望：普通换行/回车不应被报告为隐藏字符。/ 实际：`code < 32` 把每个换行符都列为 `[pos n] U+000A`，正常文本被误报为一串「隐藏字符」，结果具有误导性。
   - 修复建议：将 `\n`/`\r`/`\t` 从检测范围排除（或单列处理），只保留真正的不可见/控制字符。
   - 真实缺陷理由：常规输入产生错误的检测结果，报告内容失真。

### hmac-generator
1. **D5 / P2** `apps/web/src/tools/hmac-generator/HmacGenerator.vue:32`
   - 触发：点击「复制」。
   - 期望：复制成功/失败有反馈。/ 实际：`navigator.clipboard.writeText(hmac.value)` 无 try/catch、无成功提示，浮动 promise。
   - 修复建议：await + try/catch + message 反馈。
   - 真实缺陷理由：与 hash-text 同模式的复制无反馈缺陷。

### hours-to-days
1. **D8 / P2** `apps/web/src/tools/hours-to-days/HoursToDays.vue:9-14`
   - 触发：输入负数（如 `-25`）或部分非法数字（如 `12abc`）。
   - 期望：非法/无意义输入应被拒绝或提示。/ 实际：`-25` 产出 `-25 hours = -2 days -1 hours`（负数余数、负数天数）；`parseFloat('12abc')` 静默截断为 12。
   - 修复建议：使用严格数值校验（如 `Number` + `Number.isFinite` + `>= 0`），非法输入显示提示而非产出结果。
   - 真实缺陷理由：非法输入被静默接受并产出错误结果，无校验、无上下界约束。

### html-entities
- clean（escape/unescape 对本工具自身产生的 5 种实体往返一致，未知实体安全透传，属功能范围而非缺陷）。

### html-wysiwyg-editor
1. **D1 / P1** `apps/web/src/tools/html-wysiwyg-editor/HtmlWysiwygEditor.vue:14-17, 57-68`
   - 触发：在编辑器中选中一段文字，然后点击 B/I/U 等格式按钮。
   - 期望：选中文字应用加粗等格式。/ 实际：按钮的 click 使 contenteditable 失焦、选区被折叠，随后 `document.execCommand` 作用于空选区，格式未应用到目标文字；工具栏对「先选中文本再点按钮」的常规操作无效。
   - 修复建议：按钮加 `@mousedown.prevent` 保持选区与焦点，或在 execCommand 前恢复保存的 Range。
   - 真实缺陷理由：核心编辑路径（选中后格式化）失效，控件存在但不改变预期状态。
2. **D5 / P2** `apps/web/src/tools/html-wysiwyg-editor/HtmlWysiwygEditor.vue:38-42`
   - 触发：点击「复制 HTML」。
   - 期望：复制结果有反馈。/ 实际：`navigator.clipboard.writeText` 无 try/catch、无提示。
   - 修复建议：await + try/catch + message 反馈。

### http-status
- clean（搜索过滤、大小写处理正常，无排序逻辑故无 numeric 比较问题）。

### image-change-colors
1. **D11 / P3** `apps/web/src/tools/image-change-colors/ImageChangeColors.vue:27`
   - 触发：反复上传不同图片，或离开该工具页面。
   - 期望：旧的 blob URL 被释放。/ 实际：`URL.createObjectURL` 的结果从不 `revokeObjectURL`，每次换图泄漏一个，组件卸载也不清理。
   - 修复建议：换图与 onUnmounted 时 revoke 旧 URL。
   - 真实缺陷理由：资源生命周期缺陷，符合 D11 定义。

### image-change-opacity
1. **D11 / P3** `apps/web/src/tools/image-change-opacity/ImageChangeOpacity.vue:28`
   - 触发：多次点击「应用」。
   - 期望：临时 object URL 用完即释放。/ 实际：每次 process 都 `URL.createObjectURL(file.value)` 赋给 `img.src` 且从不 revoke。
   - 修复建议：`img.onload` 后 `URL.revokeObjectURL(img.src)`。
   - 真实缺陷理由：资源生命周期缺陷。

### image-compress
1. **D11 / P3** `apps/web/src/tools/image-compress/ImageCompress.vue:31`
   - 触发：多次点击「压缩」。
   - 期望：临时 object URL 释放。/ 实际：`URL.createObjectURL(file.value)` 从不 revoke；`toBlob` 返回 null 时也无任何失败反馈（newSize 保持 0，界面显示 next: 0.0 KB）。
   - 修复建议：onload 后 revoke；toBlob 失败时提示用户。
   - 真实缺陷理由：资源生命周期缺陷 + 静默失败路径。

### image-create-transparent
1. **D1 / P2** `apps/web/src/tools/image-create-transparent/ImageCreateTransparent.vue:65-77, 104-105`
   - 触发：上传图片后不点「应用」、也不改动颜色/容差，直接点「下载」。
   - 期望：未生成结果时下载不可用或产出处理后的图。/ 实际：下载按钮仅按 `!file` 禁用；此时 canvas 仍是空白默认画布，静默下载一张空白 PNG。
   - 修复建议：以「是否已处理」状态控制下载禁用（如 track 已 putImageData），或在图片加载后自动 processImage。
   - 真实缺陷理由：disabled 逻辑错误导致产出错误结果。
2. **D11 / P3** `apps/web/src/tools/image-create-transparent/ImageCreateTransparent.vue:22`
   - 触发：反复换图/离开页面。/ 实际：`URL.createObjectURL` 从不 revoke。
   - 修复建议：换图与卸载时 revoke。

### image-crop
1. **D8 / P2** `apps/web/src/tools/image-crop/ImageCrop.vue:199-212, 125-146`
   - 触发：在 X/Y/宽/高输入框输入超出图片范围的值（X/Y 无上限约束），然后点击裁剪下载。
   - 期望：越界裁剪区域被拒绝或提示。/ 实际：X/Y 只有 `:min="0"` 无 max，用户可设 X 大于图片宽度；`drawImage` 源矩形越界被静默裁剪，下载到含透明/黑边的图而不告知。
   - 修复建议：以图片 naturalWidth/Height 作为 X/Y/宽/高的上下界约束。
   - 真实缺陷理由：输入校验缺失，非法输入静默产出错误结果。
2. **D11 / P3** `apps/web/src/tools/image-crop/ImageCrop.vue:54`
   - 触发：反复换图/离开页面。/ 实际：`URL.createObjectURL` 从不 revoke。

### image-editor
1. **D2 / P1** `apps/web/src/tools/image-editor/ImageEditor.vue:200-212, 145-158`
   - 触发：添加文字标注后，在舞台上拖动该文字到新位置，然后点击下载。
   - 期望：下载图中文字位于拖动后的位置。/ 实际：`v-text` 设了 `draggable: true`，但没有任何 dragend 处理把新坐标写回 `ann.x/ann.y`；`downloadImage` 仍按旧坐标渲染，下载结果与所见不一致（屏幕上拖走了，导出又回原位）。
   - 修复建议：为 v-text 添加 dragend 更新 ann.x/ann.y（按 stage 缩放换算）。
   - 真实缺陷理由：状态不同步：交互改变了显示状态但导出使用陈旧数据，产出错误结果。
2. **D1 / P2** `apps/web/src/tools/image-editor/ImageEditor.vue:114-124, 200-212`
   - 触发：双击已有文字标注。
   - 期望：进入文字编辑或提示可编辑。/ 实际：`onTextDblClick` 置 `editing = true`，模板却从未使用 `editing` 渲染任何输入控件；`onTextType` 监听 Enter 也无对应输入框。双击是无效交互，文字内容永远无法修改。
   - 修复建议：editing 为 true 时在标注位置渲染 NInput/textarea 替换 v-text。
   - 真实缺陷理由：控件状态存在但不改变任何可见行为，属死交互。
3. **D3 / P3** `apps/web/src/tools/image-editor/ImageEditor.vue:59-62, 245`
   - 触发：画多条线/文字后误点「清空全部」。
   - 期望：破坏性操作有确认或可撤销。/ 实际：一键清空全部标注，无确认、无撤销。
   - 修复建议：加确认弹窗或实现撤销栈。
   - 真实缺陷理由：破坏性操作无确认。
4. **D11 / P3** `apps/web/src/tools/image-editor/ImageEditor.vue:41`
   - 触发：反复换图/离开页面。/ 实际：`URL.createObjectURL` 从不 revoke。

### image-flip
1. **D11 / P3** `apps/web/src/tools/image-flip/ImageFlip.vue:29`
   - 触发：多次点击「翻转」。/ 实际：每次 `URL.createObjectURL(file.value)` 从不 revoke。

### image-remove-background
1. **D11 / P3** `apps/web/src/tools/image-remove-background/ImageRemoveBackground.vue:26`
   - 触发：反复换图/离开页面。/ 实际：`URL.createObjectURL` 从不 revoke。

### image-resize
1. **D11 / P3** `apps/web/src/tools/image-resize/ImageResize.vue:27`
   - 触发：多次点击「调整大小」。/ 实际：每次 `URL.createObjectURL(file.value)` 从不 revoke。

### image-rotate
1. **D11 / P3** `apps/web/src/tools/image-rotate/ImageRotate.vue:32`
   - 触发：多次点击「旋转」。/ 实际：每次 `URL.createObjectURL(file.value)` 从不 revoke。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| global-latency-test | D9/P3 回车不提交 |
| hash-text | D5/P2 复制无反馈（已知样例） |
| hello-world | clean |
| hidden-char-detector | D6/P2 换行被误报为隐藏字符 |
| hmac-generator | D5/P2 复制无反馈 |
| hours-to-days | D8/P2 负数/非法输入无校验产出错误结果 |
| html-entities | clean |
| html-wysiwyg-editor | D1/P1 选中后点格式按钮无效；D5/P2 复制无反馈 |
| http-status | clean |
| image-change-colors | D11/P3 object URL 未释放 |
| image-change-opacity | D11/P3 object URL 未释放 |
| image-compress | D11/P3 object URL 未释放 + toBlob 失败静默 |
| image-create-transparent | D1/P2 未处理即可下载空白图；D11/P3 |
| image-crop | D8/P2 裁剪框无越界约束；D11/P3 |
| image-editor | D2/P1 拖动文字标注后导出位置陈旧；D1/P2 双击编辑为死交互；D3/P3 清空无确认；D11/P3 |
| image-flip | D11/P3 object URL 未释放 |
| image-remove-background | D11/P3 object URL 未释放 |
| image-resize | D11/P3 object URL 未释放 |
| image-rotate | D11/P3 object URL 未释放 |
