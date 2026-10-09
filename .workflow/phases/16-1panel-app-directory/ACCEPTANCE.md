# Acceptance verification

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| 官方目录结构 | zip 解包后含 `<appKey>/data.yml`、`logo.png`（已上传时）、`README.md`、`versions/<version>/docker-compose.yml`、`versions/<version>/data.yml` | 页内解包 zip（key 输入 `My Cool App!`、版本 `2.0.0`）：`["my-cool-app/","my-cool-app/README.md","my-cool-app/data.yml","my-cool-app/logo.png","my-cool-app/versions/","my-cool-app/versions/2.0.0/","my-cool-app/versions/2.0.0/data.yml","my-cool-app/versions/2.0.0/docker-compose.yml"]` | PASS |
| compose 转换保留既有规则 | version/labels/restart/networks 规则与 phase 前一致（单测锁定） | `docker-compose-to-1panel.service.test.ts` 断言 `version: '3.8'`、`com.1panel.appName`、`restart: always`、网络 map 化、卷驱动，全过 | PASS |
| 端口参数化 | 首个宿主端口→`${PANEL_APP_PORT_HTTP}`，其余→`${PANEL_APP_PORT_1..N}`；版本 data.yml 生成 formFields（默认值=原宿主端口，rule paramPort） | 单测：三服务 compose → HTTP/1/2 顺序与默认值 8080/3000/9000；浏览器卡片与 zip 内 compose 均含 `${PANEL_APP_PORT_HTTP}`；zip 内 `versions/2.0.0/data.yml` 含 `envKey: PANEL_APP_PORT_HTTP` 与 `paramPort` | PASS |
| 元数据表单驱动 root data.yml | 修改 Key/名称/描述/标签/类型/版本后 root data.yml 与版本目录名联动更新；标签 root data.yml 用中文、additionalProperties 用英文值 | 版本号 1.0.0→2.0.0 后目录树出现 `versions/2.0.0/`；Key `My Cool App!`→根节点 `my-cool-app/`、zip 按钮「打包下载 my-cool-app.zip」、zip 内 `data.yml` 含 `key: my-cool-app`；单测断言中文标签（实用工具/开发工具）与英文值（Tool/DevTool）并存 | PASS |
| README 文字框可编辑 | 点击 README.md 树节点，卡片文字框可编辑，zip 内为编辑后内容 | 卡片改为 `# Custom README\n\nedited by user\n` → 重新打包 zip 内 README 即该内容，卡片徽标「已编辑」 | PASS |
| logo 上传 | 上传 png 后树出现 logo.png 节点，卡片显示预览，zip 内含该二进制 | 页内 canvas 生成 PNG 经 DataTransfer 导入 ToolFileUpload → 树节点 `logo.png`、卡片 `blob:` 预览图 `naturalWidth>0`、zip 内 `logo.png` 110 字节 | PASS |
| 文件编辑 override | 编辑 versions 下 docker-compose.yml 后修改 compose 输入，编辑内容保留；点「重置」恢复自动生成 | 卡片改为 `# custom edit…`（徽标「已编辑」、出现「重置」按钮）→ compose 输入追加 `# touched` 后卡片仍 `# custom edit` → 点重置后内容恢复含 `${PANEL_APP_PORT_HTTP}`、徽标「自动生成」 | PASS |
| compose 输入可折叠 | 折叠/展开切换正常 | CDP 真实点击标题：active class 移除且 textarea 卸载（displayDirective if），再点击恢复 | PASS |
| zip 打包下载 | 点击导出得到 `<appKey>.zip`，页内解包断言文件清单完整 | 捕获 `createObjectURL` blob → `JSZip.loadAsync` 解包，清单与内容全部断言通过 | PASS |
| 无效 compose 报错 | 输入非法 YAML 时显示错误、目录区不生成、zip 禁用；修复后恢复 | 输入 `services: [unclosed` → 错误 alert「YAML 解析错误…」、zip 按钮 disabled；恢复合法 YAML → 7 行目录树恢复、zip 可用 | PASS |

验收方式：vitest 15 个新单测（apps/web）+ Chrome DevTools MCP `evaluate_script` 在 `/docker-compose-to-1panel` 页内驱动（dev server `:3012`，2026-10-07）。
