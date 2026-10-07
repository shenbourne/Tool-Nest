# Acceptance verification

场景数据（2026-10-07，Chrome DevTools MCP 驱动本 worktree dev server `http://localhost:3017`，原生 value setter + input 事件注入）：

- text-diff 原文 4 行（alpha/beta/gamma/delta line），修改后 5 行：第 2 行插入 `INSERTED line`，第 4 行 `gamma line` → `gamma 2 line`
- json-diff：version 1→2、tags 数组加元素、nested.on true→false、新增键 extra；另测删除键与非法 JSON

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| 文本对比：算法对齐 | 中间插入一行后，下方相同行仍判定相同 | 行类型序 `[same, added, same, changed, same]`；beta/delta 为 same 且行号跨插入对齐（2/3、3/4... 实测 leftNum 2↔rightNum 3） | PASS |
| 文本对比：双栏视图 | 双栏并排各带行号；删除行只在左栏、新增行只在右栏且对侧留空 | 5 行均渲染双侧单元格；added 行 leftNum='' 且左栏空；标题行「原文」「修改后」；左栏列 x/宽跨行一致（309/160 == 309/160） | PASS |
| 文本对比：行内高亮 | 修改行内差异字符段加深 | changed 行右侧 `.diff-inline-changed` 文本为 `'2 '`，左侧无（纯插入型差异） | PASS |
| 文本对比：gutter 差异条 | 最左列绿/红/蓝条标示区块 | added 行 stripe 类 `diff-stripe-added`、changed 行 `diff-stripe-changed`，计算背景 rgba 与令牌一致 | PASS |
| 文本对比：滚动 | 双栏同容器滚动同步、长行横向滚动 | `.diff-scroll` 唯一（scrollCount=1），双栏为其内同一 grid；容器 `overflow:auto` | PASS |
| 文本对比：统计 | 计数标签正确 | 「相同: 3」「已修改: 1」「已删除: 0」「已新增: 1」 | PASS |
| JSON 对比：双栏呈现 | gutter 路径 + 左红底旧值 / 右绿底新值，修改行双栏同显 | 4 条目：version/tags/nested.on 均 left-fill+right-fill，路径与类型标签（修改）在 gutter；extra 仅 right-fill 左栏空；左值列宽 429/160 跨行一致 | PASS |
| JSON 对比：引擎不变 | 语义引擎与错误提示不变 | version 1→2、tags 数组、nested.on、extra 新增均按路径递归输出；删除键呈 removed 条纹+左值填充；非法 JSON `{ bad json` 仍弹 `.n-alert` 错误 | PASS |
| 暗色主题 | diff 底色暗色清晰 | dark 下：text-diff added `rgba(35,165,91,0.18)`、changed `rgba(75,163,245,0.14)`、inline `rgba(75,163,245,0.34)`、canvas `rgb(25,25,25)`；json-diff removed `rgba(224,49,49,0.16)`；移除 class 后恢复亮色值 | PASS |
| 长行软换行 | 长行不溢出、不重叠、无横向滚动条 | 500+300 字符长行注入后：`.diff-code` 计算样式 `white-space: pre-wrap`，8 个内容单元格 0 溢出（scrollWidth ≤ clientWidth+1），`.diff-scroll` 无横向滚动条（scrollWidth == clientWidth） | PASS |
| 输入面板：双栏导入/粘贴 | 两栏各有导入文件+粘贴文件图标按钮（hover tooltip 显示名称） | text-diff：2 栏 ×（1 导入 + 1 粘贴）= 4 个图标按钮，aria-label 分别为「导入文件」「粘贴文件」；标题「原文」「修改后」正确 | PASS |
| 输入面板：同步折叠 | 点任一栏折叠箭头，两栏 textarea+操作行同步消失/恢复，标题保留 | text-diff：折叠前 textareas=2/actions=2 → 点左栏折叠后 textareas=0/actions=0/collapsed=true，标题仍在；点展开恢复 textareas=2/actions=2。json-diff 同步验证一致 | PASS |
| 输入面板：文件导入 | 选择文件后内容读入对应栏 | DataTransfer 模拟 `.txt` 文件触发左栏 change 事件，textarea 值变为文件内容 `line one\nline two\nline three`（28 字符） | PASS |
| 输入面板：json-diff accept | json-diff 文件选择限定 .json | 两个 file input 的 accept 均为 `.json,application/json`；text-diff 无 accept（任意文件） | PASS |
| 输入面板：暗色 | 面板在暗色下背景正确 | dark 下 `.tool-text-pair-panel__column` 背景 `rgb(37,37,37)`，diff 单元格 `rgb(32,32,32)`（等 ≥800ms 避开全局背景过渡） | PASS |
| JSON 树状对比：递归展开 | 对象/数组子块逐键对比，非整坨塞入 | 嵌套对象 `address` 展开为 postcode/city 子行；数组 `courses` 展开为 `[0]`/`[1]`/`[2]` 子行，每个含 id/title/credits 叶子 | PASS |
| JSON 树状对比：未修改值展示 | 无差异的键也列出，灰色无标签 | 26 行中 12 行 same（name/address 容器/city/gpa 等），`.json-diff-label-dim` 颜色 `rgb(151,149,143)`，无差异标签 | PASS |
| JSON 树状对比：数组下标对齐 | 数组按下标配对，多余项标新增/删除 | hobbies `[0]`/`[1]` changed、`[2]` same、`[3]` added；courses `[2]` added；缩进 40px（depth 2） | PASS |
| JSON 树状对比：三列铺满 | 三列等宽占满容器，右侧不留白 | `lastCellRight == gridRight == 1252`，`grid-template-columns: 8px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)`，无横向滚动条 | PASS |
| JSON 树状对比：暗色 | 树状布局暗色背景正确 | dark 下 changed `rgba(224,49,49,0.16)`、路径列 `rgb(37,37,37)`、画布 `rgb(25,25,25)`（等 ≥800ms） | PASS |
| JSON 树状对比：标签最左对齐 | 差异标签固定不缩进，key 在标签右侧树形排布 | 标签列 `width: 52px` 固定，所有行 `tagCell.left == 420`；key 树 `treeCell.left == 472` 在标签右侧；未修改行无标签但占位 52px | PASS |
| JSON 树状对比：龙骨线 | 树形连接线 ├─/└─ 正确渲染 | 连接符序列 `└─,├─,├─,├─,...` 正确；12 条竖线 `.json-diff-tree-line` 在祖先非末位时绘制 | PASS |
| JSON 树状对比：行底色 | 非标量行灰色、changed 蓝色双侧、removed 左红、added 右绿；非标量 same 行透明 | 容器行 `(root)`/`courses`/`[0]`/`notes` 灰 `rgba(0,0,0,0.04)`；changed `name`/`age`/`city` 双侧蓝 `rgba(0,117,222,0.1)`；added 非标量 `a`/`b`/`c` 右绿 `rgba(26,174,57,0.12)` 左透明；same 非标量行（旧引擎 `(root)` 等）透明 `rgba(0,0,0,0)` | PASS |
| JSON 树状对比：容器行灰底 | 仅显示元素数量的容器行（{N}/[N]）统一灰色背景，不随 type 变色 | 容器行 `(root){4}`/`courses[1]`/`[0]{3}`/`notes{3}` 双侧 `rgba(0,0,0,0.04)`；暗色下 `rgba(255,255,255,0.06)`；非标量 same 行 `id`/`gpa` 仍透明 | PASS |
| JSON 树状对比：新增容器仅显示数量 | added/removed 容器行只显示 {N}/[N] 不显示完整 JSON | added `notes` 行右值 `{3}`（非 `{"a":1,"b":2,"c":3}`），左值空；子行 `a`/`b`/`c` 正常显示标量值 | PASS |
| JSON 树状对比：标签颜色 | 修改标签蓝色、新增绿色、移除红色 | 修改标签 `color: rgb(0,117,222)` `bg: rgba(0,117,222,0.12)`；新增 `rgb(26,174,57)`；移除 `rgb(224,49,49)` | PASS |

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.
