# Acceptance verification

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| 文本对比：算法对齐 | 在中间插入一行后，插入点下方的相同行仍判定为相同（旧实现会全部标为已修改） | PENDING | PENDING |
| 文本对比：双栏视图 | 结果区为原文/修改后双栏并排，各带行号；删除行只在左栏（右栏留空占位）、新增行只在右栏，两侧逐行对齐 | PENDING | PENDING |
| 文本对比：行内高亮 | 修改行内的具体差异字符段以加深色高亮 | PENDING | PENDING |
| 文本对比：gutter 差异条 | 最左列以绿/红/蓝色条标示新增/删除/修改区块 | PENDING | PENDING |
| 文本对比：滚动 | 双栏在同一滚动容器内，纵向滚动天然同步；长行可横向滚动 | PENDING | PENDING |
| 文本对比：统计 | 相同/已修改/已删除/已新增计数标签仍显示且数字正确 | PENDING | PENDING |
| JSON 对比：双栏呈现 | 差异列表为双栏行：左 gutter 路径，左栏旧值（红底 mono）/右栏新值（绿底 mono），修改行双栏同显 | PENDING | PENDING |
| JSON 对比：引擎不变 | 语义递归引擎与错误提示行为不变（无效 JSON 仍报错） | PENDING | PENDING |
| 暗色主题 | 两个工具的 diff 底色在暗色下清晰可辨（非亮色系硬编码） | PENDING | PENDING |

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.
