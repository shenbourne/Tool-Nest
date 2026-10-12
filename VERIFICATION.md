# 验证记录：文本类工具合并（2026-10-12）

## 任务 1：回文双工具合并

合并 `palindrome-checker`（检测）与 `create-palindrome`（创建）为一个双标签页工具，旧路径 `/create-palindrome` 重定向。

## 任务 2：截取类双工具合并

合并 `extract-substring`（按范围提取）与 `text-truncate`（按字符/单词/行截断）为四模式工具「文本截取」（保留 `/text-truncate` 路径），旧路径 `/extract-substring` 重定向。

## 技术验证

| 检查项 | 命令 | 结果 |
|--------|------|------|
| 单元测试（任务 1 后） | `pnpm --filter @toolnest/web test` | 482/482 通过（64 个文件） |
| 类型检查（任务 1 后） | `pnpm --filter @toolnest/web type-check` | 通过，无错误 |
| 单元测试（任务 2 后） | `pnpm --filter @toolnest/web test` | 482/482 通过（64 个文件） |
| 类型检查（任务 2 后） | `pnpm --filter @toolnest/web type-check` | 通过，无错误 |

## 浏览器验证（一）：回文工具 `/palindrome-checker`

开发服务器 `pnpm dev`（vite，端口 3002，已停止）。

| 页面 | 检查内容 | 结果 |
|------|----------|------|
| `/palindrome-checker` | 标题"回文工具"、描述更新、标签页"检测回文/创建回文"渲染正常，输入/输出面板布局无溢出 | 通过 |
| 检测模式 | 输入 `level` → "✅ 是的！这是回文。"；输入 `abc` → "❌ 不是回文。" | 通过 |
| 创建模式 | 输入 `abc` → `abccba`；与检测模式共享输入、切换正常 | 通过 |
| `/create-palindrome` | 旧路径自动跳转至合并工具页面 | 通过 |

截图证据：`C:\Users\ROG\AppData\Local\Temp\kimi-workbench-browser\1791800113243-conversation-05c6034f-d07c-40c3-9172-27736a8a44b4.png`

### 过程中发现并修复的问题（任务 1）

空内容的 `NTabPane` 使用 `:tab` prop 时标签文字渲染为空。根因：naive-ui 2.45.3 的 `Tabs.js` 通过 `normalizeSlots(children ? { default: children.tab } : void 0)` 生成标签内容；pane 无任何子节点时 `normalizeSlots(undefined)` 会生成一个渲染为空的 default slot，导致 Tab 组件优先走 slot 分支而不回退到 `tab` prop（date-time 等工具因有 pane 内容不受影响）。修复：改用 `#tab` 具名插槽传入标签文字。

## 浏览器验证（二）：文本截取 `/text-truncate`

开发服务器 `pnpm dev`（vite，端口 3003，已停止）。验证方式以 DOM 级操作为主（验证时内置浏览器面板未对用户可见，真实鼠标/截图不可用；布局结构经 DOM 检查无溢出）。

| 页面 | 检查内容 | 结果 |
|------|----------|------|
| `/text-truncate` | 标题"文本截取"，模式选择器默认"字符"，参数区显示"保留数量" | 通过 |
| 字符模式 | 输入 26 个字母、保留 5 → 输出 `abcde` | 通过 |
| 按范围提取模式 | 切换后参数区正确换为起止索引（保留数量隐藏）；start=1/end=3 → 输出 `bc`；默认 0–10 → 前 10 字符 | 通过 |
| 单词模式 | 输入 `aa bb cc dd ee`、保留 3 → 输出 `aa bb cc` | 通过 |
| 行模式 | 输入 4 行、保留 3 → 输出前 3 行 | 通过 |
| `/extract-substring` | 旧路径自动跳转至合并工具页面 | 通过 |

截图：NOT RUN（浏览器面板未可见，`IN_APP_BROWSER_TAB_NOT_VISIBLE`；不影响功能验证结论）。

### 参数栏交互改版（2026-10-12 第二轮，按用户要求）

参数栏重构为三行布局：第一行单位选择（字符/单词/行）；第二行贯通整条的 NSlider 区间滑条（min=0，max=输入文本按当前单位的实时总数，左右端即起始/结束索引）；第三行起始/结束索引数值输入框（flex space-between 左/右对齐）。截断成为"起点置 0"的特例，不再单独设模式。

| 页面 | 检查内容 | 结果 |
|------|----------|------|
| 布局 | 参数栏三行（select / slider / index-row），flex column 间距 12px；滑条为双柄区间模式；索引行 space-between | 通过 |
| 字符模式 | 26 字母输入 → unitCount=26、sliderMax=26；默认 [0,10) → `abcdefghij`；滑条设 [5,15) → `fghijklmno` | 通过 |
| 越界钳制 | 输入缩至 `abc` 后 start/end 从 5/15 自动钳到 3/3，输出为空串 | 通过 |
| 单词模式 | 5 词输入，[1,3) → `bb cc` | 通过 |
| 行模式 | 5 行输入，[2,4) → `l3\nl4`；数值框直接输入 0/2 → `l1\nl2` | 通过 |

类型修复记录：`computed<[number, number]>` 的 getter 需显式标注元组返回类型，否则数组字面量被推断为 `number[]` 导致 vue-tsc 报错。

### 索引语义改版（2026-10-12 第三轮，按用户要求）

索引从 0 基半开改为 **1 基闭区间**：起始索引从 1 开始，结束索引包含自身，N 个单位的全选为 [1, N]。滑条 min=1、max=N（旧的 0 基实现中 max=N 是"末尾后一位"的越界哨兵；新模型取消该哨兵，内部最大有效索引相应减 1）。新增起止顺序互推（与滑条双柄推挤一致）；数值输入框 min=1、max=N。

| 页面 | 检查内容 | 结果 |
|------|----------|------|
| 全选 | 26 字母 [1,26] → 完整字母表 | 通过 |
| 闭区间 | [2,5] → `bcde`（含第 5 个）；[26,26] → `z` | 通过 |
| 顺序互推 | 尝试 [20,3] → 自动压为 [3,3] → `c` | 通过 |
| 单词/行 1 基 | 5 词 [2,4] → `bb cc dd`；输入缩至 `abc` 后 [2,4] 钳为 [2,3] → `bc` | 通过 |
| 空输入 | unitCount=0 → sliderMax 守卫为 1，起止保持 1，输出空串 | 通过 |

### 工具移除与恢复（2026-10-12 第四轮）

按用户要求移除 `text-censor`（#95）、`text-repeat`（#104）、`text-split`（#107），随后恢复 `text-rotate`（#106）与 `remove-duplicate-lines`（#103，含 `/list-find-unique` 重定向链）。移除为彻底删除（无重定向，404 落统一提示页）。registry.test.ts 增加"按用户要求移除的工具"断言；inventory.md 计数：已迁移 121、已合并 5、排除 6（含 X01–X03）。

| 页面 | 检查内容 | 结果 |
|------|----------|------|
| `/text-rotate` | 页面恢复，默认输入旋转 1 位 → `Line 2/3/4/1` | 通过 |
| `/remove-duplicate-lines` | 输入 `a b a c b` 去重 → `a b c` | 通过 |
| `/list-find-unique` | 旧路径重定向至去除重复行 | 通过 |
| 分类页 `/tools/text` | 文本与字符串 16 个（移除 3、恢复 2、合并净减 2） | 通过 |
| `/text-rotate` 字符旋转 | 改为按字符旋转（原按行）：`abcdefg` 旋 1 → `bcdefga`、旋 3 → `defgabc`、旋 -2 → `fgabcde`（回绕正确） | 通过 |

## 变更文件（两次合并合计）

- `apps/web/src/tools/palindrome-checker/`（双标签页合并实现、redirectFrom / aliases / keywords）
- `apps/web/src/tools/text-truncate/`（四模式合并实现、redirectFrom / aliases / keywords）
- `apps/web/src/tools/create-palindrome/`、`apps/web/src/tools/extract-substring/`（已删除）
- `apps/web/src/tools/tool-text-panels.test.ts`（移除两个已删除工具的清单条目）
- `apps/web/src/locales/zh.json`、`en.json`（合并文案，新增 checkTab/createTab；textTruncate 描述与选项随交互改版更新）
- `docs/migration/inventory.md`（#96/#98/#101/#109 状态、合并计数 5、备注 8）
