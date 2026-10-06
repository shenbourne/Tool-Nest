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

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.
