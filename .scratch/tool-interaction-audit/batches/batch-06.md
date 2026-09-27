# Batch 06

## 概要
- 审计工具数：19
- 发现：P0 1 条 / P1 1 条 / P2 12 条 / P3 1 条
- clean 工具：json-validate, jwt-parser, list-find-popular, list-find-unique, list-reverse, list-rotate, list-sort, list-unwrap

## 发现

### json-to-xml
1. **D5 / P2** `apps/web/src/tools/json-to-xml/JsonToXml.vue:16-18`
   - 触发：点击「复制」按钮（输出非空时）。
   - 期望：复制成功/失败给出反馈，剪贴板不可用时提示失败。 / 实际：`navigator.clipboard.writeText` 为浮动 promise，无 try/catch、无成功/失败提示；在非 HTTPS 或权限被拒时静默失败，用户误以为已复制。
   - 修复建议：包 try/catch 并用 message 反馈成功/失败。
   - 真实缺陷理由：与已校准样例 hash-text 相同模式（复制无 try/catch、无反馈 → D5/P2），此处为独立文件。

### json-to-yaml
1. **D5 / P2** `apps/web/src/tools/json-to-yaml/JsonToYaml.vue:16-18`
   - 触发：点击「复制」按钮。
   - 期望：复制有成功/失败反馈。 / 实际：浮动 promise，无 try/catch、无提示，失败静默。
   - 修复建议：同 json-to-xml，加 try/catch + message。
   - 真实缺陷理由：复制结果无任何反馈，失败不可见。
2. **D6 / P2** `apps/web/src/tools/json-to-yaml/json-to-yaml.service.ts:5-12`
   - 触发：打开工具或清空输入框（input 为 `''`）。
   - 期望：空输入应像 json-to-xml 一样返回 `{ result: '', error: null }`，不显示错误。 / 实际：`jsonToXml` 有 `!input.trim()` 守卫，本 service 没有；`JSON.parse('')` 抛异常 → 页面一打开就弹出 `Unexpected end of JSON input` 错误 Alert，误导用户。
   - 修复建议：在 parse 前加 `if (!input.trim()) return { result: '', error: null };`。
   - 真实缺陷理由：空输入产生误导性错误信息，属边界处理缺陷。

### json-viewer
1. **D5 / P2** `apps/web/src/tools/json-viewer/JsonViewer.vue:17-21`
   - 触发：点击「复制」按钮（格式化结果存在时）。
   - 期望：复制有成功/失败反馈。 / 实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：加 try/catch + message 反馈。
   - 真实缺陷理由：复制失败（剪贴板权限/非安全上下文）不可见。

### keycode-info
1. **D9 / P1** `apps/web/src/tools/keycode-info/KeycodeInfo.vue:13-20`
   - 触发：进入工具页后按 F5 / Ctrl+R / F12 / Tab 等任意键盘快捷键。
   - 期望：仅捕获按键信息，不拦截浏览器默认行为。 / 实际：`handleKeyDown` 对 document 上所有 keydown 一律 `e.preventDefault()`，导致刷新、开发者工具、Tab 焦点导航等全部失效；页面上也没有任何可输入控件需要防干扰。
   - 修复建议：移除无差别的 `e.preventDefault()`，或仅对会改变页面状态的按键（如 Space 滚动、/ 唤起快速搜索）选择性拦截。
   - 真实缺陷理由：全局拦截键盘默认行为，阻断基本键盘交互。
2. **D5 / P2** `apps/web/src/tools/keycode-info/KeycodeInfo.vue:45-47,79`
   - 触发：点击任一字段的只读输入框（click-to-copy）。
   - 期望：复制有成功反馈。 / 实际：`navigator.clipboard.writeText` 无 try/catch、无提示，且输入框外观无任何“已复制”变化，用户无法确认点击是否生效。
   - 修复建议：加 try/catch 并用 message 提示已复制。
   - 真实缺陷理由：复制操作无任何可感知反馈。

### list-converter
1. **D5 / P2** `apps/web/src/tools/list-converter/ListConverter.vue:49-51`
   - 触发：点击「复制」按钮。
   - 期望：复制有成功/失败反馈。 / 实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：加 try/catch + message。
   - 真实缺陷理由：复制失败不可见。
2. **D6 / P2** `apps/web/src/tools/list-converter/list-converter.service.ts:41-45`
   - 触发：输入含数字编号项（如 `item1, item2, ... item10`），排序选「升序」。
   - 期望：自然序 `item2 < item9 < item10`。 / 实际：`localeCompare` 默认非数字排序，`item10` 排在 `item9` 前面（`1 < 9` 字符比较）。
   - 修复建议：改用 `localeCompare(b, undefined, { numeric: true })` 或显式 numeric collation。
   - 真实缺陷理由：与已校准样例 list-sort 同类（localeCompare 非数字排序），此处为独立文件。

### list-duplicate
1. **D3 / P2** `apps/web/src/tools/list-duplicate/ListDuplicate.vue:12-13`
   - 触发：输入含空行的列表（如 `a\n\nb`），执行复制每行。
   - 期望：空行作为列表结构被保留（复制后仍为空行）。 / 实际：`.filter(Boolean)` 静默丢弃所有空行，输出 `a\na\nb\nb`，空行结构丢失且无任何提示。
   - 修复建议：仅过滤末尾空行或保留空行语义，至少在界面说明空行会被移除。
   - 真实缺陷理由：静默丢弃用户输入内容，与 list-reverse/list-rotate（保留空行）行为不一致。

### list-shuffle
1. **D3 / P2** `apps/web/src/tools/list-shuffle/ListShuffle.vue:12-13`
   - 触发：输入含空行的列表并查看洗牌结果。
   - 期望：空行参与/保留。 / 实际：`.filter(Boolean)` 静默删除空行，输出列表项数少于输入，无提示。
   - 修复建议：同 list-duplicate，保留空行或明示过滤行为。
   - 真实缺陷理由：静默数据丢失，与同类工具行为不一致。

### list-group
1. **D6 / P0** `apps/web/src/tools/list-group/ListGroup.vue:12-17,23`
   - 触发：输入任意列表后，清空「分组大小」NInputNumber（值为 `null`）。
   - 期望：空值时回退默认值或禁用计算。 / 实际：`for (let i = 0; i < items.length; i += size.value)` 中 `size.value` 为 `null`，`i += null` 使 `i` 永远不变 → 死循环无限 `groups.push(...)`，computed 不返回，标签页直接卡死。
   - 修复建议：`const s = size.value ?? 3`（或 `:default-value` 并在模板判空），保证步长为正整数。
   - 真实缺陷理由：一个清空操作即可冻结整个页面，属阻断级边界缺陷。
2. **D3 / P3** `apps/web/src/tools/list-group/ListGroup.vue:13`
   - 触发：输入含空行的列表并分组。
   - 期望：空行参与分组或被明示过滤。 / 实际：`.filter(Boolean)` 静默删除空行后再分组，分组结果与输入行数不对应，无提示。
   - 修复建议：同 list-duplicate，保留空行或明示过滤行为。
   - 真实缺陷理由：静默丢弃输入内容，与 list-reverse/list-rotate 行为不一致。

### list-truncate
1. **D3 / P2** `apps/web/src/tools/list-truncate/ListTruncate.vue:12`
   - 触发：输入含空行的列表（如 `a\n\nb`）并截断。
   - 期望：空行作为列表结构参与计数。 / 实际：`.filter(Boolean)` 先静默删除所有空行再 `slice(0, count)`，空行被吞且占用截断名额的行数语义变化，无提示。
   - 修复建议：仅过滤末尾空行或保留空行后再截断，并明示行为。
   - 真实缺陷理由：静默丢弃用户输入内容，与 list-reverse/list-rotate（保留空行）行为不一致。

## list-wrap
1. **D3 / P2** `apps/web/src/tools/list-wrap/ListWrap.vue:13`
   - 触发：输入含空行的列表并加前后缀。
   - 期望：空行保留（如保持行数不变）。 / 实际：`.filter(Boolean)` 静默删除空行后再包裹，输出丢失空行，无提示。
   - 修复建议：同 list-duplicate。
   - 真实缺陷理由：静默数据丢失，与 list-reverse 等保留空行的同类工具不一致。

### lorem-ipsum
1. **D5 / P2** `apps/web/src/tools/lorem-ipsum/LoremIpsum.vue:19`
   - 触发：点击「复制」按钮。
   - 期望：复制有成功/失败反馈。 / 实际：浮动 promise，无 try/catch、无提示。
   - 修复建议：加 try/catch + message。
   - 真实缺陷理由：复制失败不可见。

## 覆盖清单
| 工具 | 结论 |
| --- | --- |
| json-to-xml | D5/P2 ×1 |
| json-to-yaml | D5/P2 ×1, D6/P2 ×1 |
| json-validate | clean |
| json-viewer | D5/P2 ×1 |
| jwt-parser | clean |
| keycode-info | D9/P1 ×1, D5/P2 ×1 |
| list-converter | D5/P2 ×1, D6/P2 ×1 |
| list-duplicate | D3/P2 ×1 |
| list-find-popular | clean |
| list-find-unique | clean |
| list-group | D6/P0 ×1, D3/P3 ×1 |
| list-reverse | clean |
| list-rotate | clean |
| list-shuffle | D3/P2 ×1 |
| list-sort | clean（已知样例覆盖，不重复报告） |
| list-truncate | D3/P2 ×1 |
| list-unwrap | clean |
| list-wrap | D3/P2 ×1 |
| lorem-ipsum | D5/P2 ×1 |
