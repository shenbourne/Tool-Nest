# ToolNest

把常用开发工具集中到一个支持中英文的 Web 工作台。

ToolNest 提供文本与列表处理、结构化数据转换、图片与 PDF 处理、编码与加密辅助、日期计算和网络诊断等工具，支持搜索、分类、收藏、最近使用以及主题切换。你可以在本机运行，也可以部署到可信局域网。

[快速开始](#快速开始) · [使用示例](#使用示例) · [本地开发](#本地开发) · [参与贡献](#参与贡献) · [问题反馈](#问题反馈)

## 主要功能

| 场景 | 代表工具 |
| --- | --- |
| 文本与列表 | 文本工作台、列表处理、文本差异比较、正则表达式测试、信息脱敏 |
| 数据与格式 | JSON 格式化、压缩与校验，JSON/YAML/TOML/XML/CSV 转换，可编辑表格 |
| 编码与安全辅助 | Base64、URL 编解码、哈希、HMAC、JWT 解析、密码与 UUID 生成、二维码 |
| 图片与文档 | 图片裁剪、调整与标注、格式转换、压缩、OCR，PDF 合并、拆分与旋转 |
| 音视频 | 音视频转换、剪辑、合并、速度调整、视频转 GIF |
| 数字与时间 | 计算器、数字序列、进制与单位转换、日期时间处理、Cron 表达式生成 |
| 网络与运维 | IP 信息、DNS 查询、Ping、连通性检查、Docker 命令转 Compose、Compose 转 1Panel 应用 |

部分工具在浏览器中完成处理；网络诊断需要后端或外部服务，OCR 和音视频工具可能需要下载运行资源。项目不保证所有功能均可离线使用。收藏、偏好和报告等状态由后端持久化保存。

## 快速开始

### 使用 Docker Compose

前提：安装 Docker Engine 或 Docker Desktop，并确保 `docker compose` 可用。默认拉取 `shenbourne/tool-nest:latest` 镜像。

```sh
git clone https://github.com/shenbourne/Tool-Nest.git
cd Tool-Nest
docker compose up -d
```

打开 **http://localhost:8080**。

```sh
# 查看服务状态和日志
docker compose ps
docker compose logs -f toolnest

# 停止并移除容器，保留数据卷
docker compose down
```

默认配置将端口绑定到 `127.0.0.1`，数据保存在 `toolnest-data` 命名卷中。普通的容器重建会保留数据；`docker compose down -v` 会删除数据卷，请勿将它当作日常停止命令。

可通过 `IMAGE_TAG` 固定镜像版本，例如 `0.1.0`；发布镜像支持 Linux amd64 和 arm64。更换访问端口时，在根目录创建供 Compose 使用的 `.env` 文件，同时设置访问地址：

```dotenv
PORT=8088
CORS_ORIGIN=http://localhost:8088
```

重新启动后访问 `http://localhost:8088`。需要从源码构建、配置镜像发布或了解版本标签时，参阅 [Docker 部署与版本发布文档](docs/docker.md)。版本号由根目录 `package.json` 管理；稳定版本发布对应版本及 `latest` 标签，预发布版本仅发布对应版本标签。

### 部署边界

默认用于本机或可信局域网。需要局域网访问时，应明确调整 Compose 的端口绑定，并将 `CORS_ORIGIN` 设为实际访问地址。不要直接将写入 API 暴露到公网；CORS 配置不能代替身份认证和访问控制。

## 使用示例

启动后，在首页搜索工具名称或按分类进入工具。

### 格式化 JSON

1. 搜索 JSON，打开 JSON 工具。
2. 在输入区粘贴以下内容，选择格式化操作。
3. 查看校验状态，并复制或导出结果。

输入：

```json
{"project":"ToolNest","languages":["zh-CN","en"],"selfHosted":true}
```

格式化结果：

```json
{
  "project": "ToolNest",
  "languages": [
    "zh-CN",
    "en"
  ],
  "selfHosted": true
}
```

### 整理列表和表格

- 打开列表工具，粘贴多行文本，按需配置去重、排序及分隔符，再执行对应操作。
- 打开表格工具，导入 CSV/TSV 或粘贴单元格数据，编辑后复制或导出；误操作可使用撤销和重做。

### 编辑图片

打开图片编辑器，导入图片，使用裁剪、调整或标注页签进行编辑，确认预览后导出结果。

### 检查服务是否可用

```sh
curl http://localhost:8080/api/health
```

成功响应包含 `status: "ok"`、`timestamp` 和 `version` 字段。

## 本地开发

### 环境要求

- Node.js：项目声明最低版本为 18；Docker 构建使用 Node.js 22，建议开发环境也采用 22。
- pnpm：使用仓库指定的 **9.11.0**。
- Git。

在仓库根目录执行：

```sh
corepack enable
corepack prepare pnpm@9.11.0 --activate
pnpm install --frozen-lockfile
pnpm --filter @toolnest/shared build
pnpm dev
```

先构建共享包，再启动服务。默认前端地址为 `http://localhost:3000`，后端为 `http://localhost:3001`；前端将 `/api` 请求代理到后端。

### 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 同时启动前后端开发服务 |
| `pnpm dev:web` | 仅启动前端 |
| `pnpm dev:server` | 仅启动后端 |
| `pnpm build` | 按工作区依赖顺序构建共享包、前后端 |
| `pnpm type-check` | 类型检查；干净检出时先构建共享包 |
| `pnpm test` | 运行工作区测试 |
| `pnpm lint` | 运行代码检查；现有脚本带自动修复，会修改文件 |

### 修改开发代理地址

在启动前端的终端设置 `VITE_API_TARGET`。例如 PowerShell：

```powershell
$env:VITE_API_TARGET = 'http://127.0.0.1:3355'
pnpm dev:web
```

该变量只调整代理目标，不会改变后端监听端口。当前 Vite 配置读取进程环境，单独写入 `.env` 不会自动应用此设置；修改后需要重启 Vite。生产容器由同一个 Node.js 服务提供页面和 API，不使用开发代理。

### 服务端配置

通过启动服务的进程环境传入配置。Compose 已设置容器内部端口和数据目录。

| 变量 | 源码运行默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | 后端监听端口；Compose 容器内部固定使用 `3000` |
| `CORS_ORIGIN` | `http://localhost:3000` | 允许的前端来源；Compose 默认 `http://localhost:8080` |
| `DATA_DIR` | `../../data` | 相对于进程工作目录的数据路径；Compose 使用 `/app/data` |
| `NODE_ENV` | 未设置 | 设置为 `production` 时提供构建后的前端静态资源 |
| `REPORT_EXPIRY_DAYS` | `7` | 报告过期天数 |
| `MAX_REPORTS` | `100` | 报告数量上限 |
| `MAX_REPORT_SIZE` | `500000` | 单份报告大小限制 |

更多说明见 [开发文档](docs/development.md)。

## 项目结构

```text
Tool-Nest/
├── apps/
│   ├── web/                 # Vue 3 前端，工具页面与交互
│   │   └── src/tools/       # 各工具实现与注册信息
│   └── server/              # Express API、网络操作和 YAML 存储
├── packages/shared/         # 前后端共享类型与契约
├── docs/                    # 开发、部署、架构和迁移文档
├── scripts/                 # 验证等辅助脚本
├── data/                    # 本地运行数据，勿提交用户数据
├── Dockerfile               # 多阶段构建，运行镜像使用非 root 用户
├── docker-compose.yml       # 单服务部署与持久化配置
├── LICENSE                  # 项目许可证
└── THIRD_PARTY_NOTICES.md    # 上游项目与第三方声明
```

前端使用 Vue 3、TypeScript、Vite、Naive UI、Pinia、Vue Router 和 vue-i18n；后端使用 Node.js、TypeScript 和 Express。两端通过共享包约定数据结构，服务端采用 YAML 文件持久化状态。

## 参与贡献

欢迎提交缺陷修复、工具改进、翻译、文档和使用反馈。

1. 先查看已有问题；较大的功能或架构调整请先说明场景和方案。
2. Fork 仓库并创建独立分支，保持改动集中，避免提交运行数据、密钥和临时文件。
3. 修改相关实现与中英文文案，为行为变化补充适用的测试。
4. 先构建共享包，再运行适用的测试、类型检查、代码检查和构建。涉及界面时检查桌面与移动端。
5. 提交 Pull Request，说明问题、改动效果、验证结果和已知限制；界面改动请附截图。

## 问题反馈

通过 [GitHub Issues](https://github.com/shenbourne/Tool-Nest/issues) 提交问题或建议。请提供运行方式、浏览器与系统版本、复现步骤、预期与实际结果，以及脱敏后的日志或截图。

## 许可证与致谢

项目采用 [GNU GPL v3](LICENSE) 许可证。使用、修改和分发时请遵守许可证，并保留相关版权与第三方声明。

感谢 it-tools、1Panel-Tools、omni-tools、MyIP 及项目依赖的开源贡献者。上游来源、用途与许可证信息见 [第三方声明](THIRD_PARTY_NOTICES.md)。
