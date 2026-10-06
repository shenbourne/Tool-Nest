# Phase context

- Phase: 16 — 1panel-app-directory
- Goal: `docker-compose-to-1panel` 工具从「compose → 单个转换后 YAML」升级为「生成完整 1Panel 应用目录」：官方应用商店结构 `<appKey>/{data.yml, logo.png, README.md}` + `<appKey>/versions/<version>/{docker-compose.yml, data.yml(参数)}`，目录内全部文件可在页面预览/编辑（无法从 compose 推导的文件提供表单/文字框/上传控件供用户输入），并支持打包为 zip 下载。
- Requirements: 用户直接需求（2026-10-07），经提问确认三项决定。
- Decisions already made（用户 2026-10-07 确认）:
  1. 目录结构采用 1Panel 官方应用商店格式（含 `versions/` 层），zip 根目录为 `<appKey>/`。
  2. 可编辑输入项：应用元数据表单（Key/名称/中英文描述/标签/类型/版本/架构）、`logo.png` 图片上传、`README.md` 文字框（经文件卡片编辑）；不提供 params 可视化编辑器与 `scripts/init.sh`。
  3. UI：上方 compose 输入框（可折叠）；下方左侧文件列表（目录树），右侧文件卡片（可编辑代码框），点击树节点切换文件；底部「打包下载 zip」按钮。
- 派生设计决定: compose 转换在现有规则之上新增端口参数化——按服务顺序收集 `host:container` 映射，首个宿主端口改写为 `${PANEL_APP_PORT_HTTP}`，后续依次为 `${PANEL_APP_PORT_1..N}`，原始宿主端口作为对应 formField 的默认值写入 `versions/<v>/data.yml`；用户在文件卡片中的编辑以 override 形式保留（卡片提供「重置为自动生成」），不被重新生成覆盖。
- Constraints: 纯生成逻辑放 `.ts` 便于 vitest 单测；zip 用 `jszip` 依赖、点击时动态 import 不进主包；沿用设计令牌与 42px 控件基准；提交信息单行（commit-lint hook）。
- Open questions: 无。
- Boundary: 不含 1Panel 参数（formFields）可视化编辑器、init.sh/upgrade.sh 脚本、服务端 zip（纯前端生成）、compose 既有转换规则之外的改写（build/depends_on 等保持原样）。
