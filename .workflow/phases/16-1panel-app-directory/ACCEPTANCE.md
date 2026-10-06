# Acceptance verification

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| 官方目录结构 | zip 解包后含 `<appKey>/data.yml`、`logo.png`（已上传时）、`README.md`、`versions/<version>/docker-compose.yml`、`versions/<version>/data.yml` | PENDING | PENDING |
| compose 转换保留既有规则 | version/labels/restart/networks 规则与 phase 前一致（单测锁定） | PENDING | PENDING |
| 端口参数化 | 首个宿主端口→`${PANEL_APP_PORT_HTTP}`，其余→`${PANEL_APP_PORT_1..N}`；版本 data.yml 生成对应 formFields（默认值=原宿主端口，rule paramPort） | PENDING | PENDING |
| 元数据表单驱动 root data.yml | 修改 Key/名称/描述/标签/类型/版本后 root data.yml 与版本目录名联动更新；标签在 root data.yml 用中文、additionalProperties 用英文值 | PENDING | PENDING |
| README 文字框可编辑 | 点击 README.md 树节点，卡片文字框可编辑，zip 内为编辑后内容 | PENDING | PENDING |
| logo 上传 | 上传 png 后树出现 logo.png 节点，卡片显示预览，zip 内含该二进制 | PENDING | PENDING |
| 文件编辑 override | 编辑 versions 下 docker-compose.yml 后修改 compose 输入，编辑内容保留；点「重置」恢复自动生成 | PENDING | PENDING |
| compose 输入可折叠 | 折叠/展开切换正常 | PENDING | PENDING |
| zip 打包下载 | 点击导出得到 `<appKey>.zip`，页内 JSZip 解包断言文件清单完整 | PENDING | PENDING |
| 无效 compose 报错 | 输入非法 YAML 时显示错误、目录区不生成 | PENDING | PENDING |

验收方式：vitest 单测 + Chrome DevTools MCP `evaluate_script` 驱动 `/docker-compose-to-1panel` 页（dev server），zip 内容通过页内 `JSZip.loadAsync` 解包断言。

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`.
