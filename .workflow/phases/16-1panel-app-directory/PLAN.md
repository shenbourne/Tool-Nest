# Phase 16 plan

1. service 层（纯函数，可单测）
   - `docker-compose-to-1panel.service.ts`：保留既有转换规则，新增端口参数化（host 端口 → `${PANEL_APP_PORT_HTTP}` / `${PANEL_APP_PORT_N}`，返回 formFields 列表）。
   - 新增 `onepanel-app-directory.ts`：由 compose 转换结果 + 元数据 + README/logo 生成有序文件清单（root `data.yml`、`README.md`、`versions/<v>/docker-compose.yml`、`versions/<v>/data.yml`）；appKey/version 清洗；中文标签映射。
   - 新增单测 `docker-compose-to-1panel.service.test.ts` / `onepanel-app-directory.test.ts`。
2. UI `DockerComposeTo1panel.vue` 重写
   - 可折叠 compose 输入（NCollapse）；元数据表单（NForm）；logo 上传（ToolFileUpload，accept png）；目录树（NTree）+ 文件卡片（NInput textarea 可编辑 + 重置按钮）；logo 卡片为预览；底部 zip 下载按钮（jszip 动态 import）。
   - overrides 状态：卡片编辑覆盖自动生成；输入/元数据变化时重新生成并保留 override；重置按钮清除 override。
3. 国际化 zh/en 新增键；About 卡片更新（补端口参数化说明）。
4. 依赖：`apps/web` 增加 `jszip` + `@types` 无需（自带类型）。
5. 验证：worktree 内 `pnpm install` → `pnpm test` / `type-check` / `build` / 差分 lint；Chrome DevTools MCP 浏览器验收（树渲染、卡片编辑、zip 下载并在页内解包断言结构），证据入 VERIFICATION.md / ACCEPTANCE.md。
6. 提交（原子提交）、推送 feature 分支、更新 STATE.md；合并 master 需用户授权。
