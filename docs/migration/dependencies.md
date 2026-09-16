# ToolNest 依赖清单

## 概述

| 项目 | 框架 | 工具数量 | 依赖数 (deps) | 构建工具 |
|------|------|----------|---------------|----------|
| it-tools | Vue 3.3 + TypeScript | ~86 | 67 | Vite 4 |
| 1Panel-Tools | Vue 3.5 + TypeScript | 1 | 26 | Vite 4 |
| omni-tools | React 18 + TypeScript | ~126 | 68 | Vite 5 |
| MyIP | Vue 3.5 + JavaScript | ~20 | 47 | Vite 8 |

**合并策略**：
- 以 it-tools 为基底（Vue 3 + Naive UI + UnoCSS），整合所有工具
- omni-tools 的 React 工具重写为 Vue 3 组件，逻辑层复用
- 1Panel-Tools 作为 it-tools 的 fork，直接合并其唯一工具
- MyIP 的 Express 后端作为可选服务端保留，前端工具逐步迁移
- 统一使用 pnpm 管理依赖

---

## 核心框架依赖

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| vue | 前端框架 | it-tools, 1Panel-Tools, MyIP | ^3.3.4 / ^3.5.25 / ^3.5.41 | **^3.5.x** | 统一至最新 3.5 |
| react | 前端框架 | omni-tools | ^18.3.1 | — | 迁移后移除 |
| react-dom | React DOM | omni-tools | ^18.3.1 | — | 迁移后移除 |
| vue-router | 路由 | it-tools, 1Panel-Tools, MyIP | ^4.1.6 / ^5.2.0 | **^4.5.x** | MyIP 的 v5 需降级兼容 |
| pinia | 状态管理 | it-tools, 1Panel-Tools, MyIP | ^2.0.34 / ^4.0.3 | **^2.3.x** | MyIP 的 v4 需降级兼容 |
| naive-ui | UI 组件库 | it-tools, 1Panel-Tools | ^2.35.0 | **^2.40.x** | 统一升级 |
| @mui/material | UI 组件库 | omni-tools | ^5.15.20 | — | 迁移后移除 |
| @emotion/react | CSS-in-JS | omni-tools | ^11.11.4 | — | 迁移后移除 |
| @emotion/styled | CSS-in-JS | omni-tools | ^11.11.5 | — | 迁移后移除 |
| styled-components | CSS-in-JS | omni-tools | ^6.1.19 | — | 迁移后移除 |
| typescript | 类型系统 | it-tools, 1Panel-Tools, omni-tools | ~5.2.0 / ^5.4.5 | **~5.5.x** | 统一版本 |
| vite | 构建工具 | it-tools, 1Panel-Tools, omni-tools, MyIP | ^4.4.9 / ^5.2.11 / ^8.2.2 | **^5.4.x** | 统一至 Vite 5，MyIP 的 Vite 8 需降级 |
| @vitejs/plugin-vue | Vue 插件 | it-tools, 1Panel-Tools, MyIP | ^4.3.2 / ^6.0.8 | **^5.x** | 匹配 Vite 5 |
| @vitejs/plugin-react-swc | React 插件 | omni-tools | ^3.7.0 | — | 迁移后移除 |

---

## 按类别分组的依赖

### UI 与样式

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| naive-ui | Vue UI 组件库 | it-tools, 1Panel-Tools | ^2.35.0 | ^2.40.x | 保留 |
| @tabler/icons-vue | Tabler 图标 (Vue) | it-tools, 1Panel-Tools | ^3.20.0 | ^3.20.x | 保留 |
| @vicons/material | Material 图标 | it-tools, 1Panel-Tools | ^0.12.0 | ^0.12.x | 保留 |
| @vicons/tabler | Tabler 图标 | it-tools, 1Panel-Tools | ^0.12.0 | ^0.12.x | 保留 |
| @iconify/vue | Iconify 图标 (Vue) | MyIP | ^5.0.1 | ^5.0.x | 保留 |
| @iconify-json/circle-flags | 国旗图标 | MyIP | ^1.2.10 | ^1.2.x | 保留 |
| @lucide/vue | Lucide 图标 | MyIP | ^1.33.0 | ^1.33.x | 保留 |
| unocss | 原子化 CSS | it-tools, 1Panel-Tools | ^0.65.1 / ^0.57.1 | **^0.65.x** | 统一版本 |
| tailwindcss | 原子化 CSS | omni-tools, MyIP | ^3.4.3 / ^4.3.3 | — | 统一用 UnoCSS 替代 |
| @tailwindcss/vite | Tailwind Vite 插件 | MyIP | ^4.3.3 | — | 移除 |
| autoprefixer | CSS 前缀 | omni-tools | ^10.4.19 | — | 移除 |
| postcss | CSS 处理 | omni-tools | ^8.4.38 | — | 移除 |
| tw-animate-css | 动画工具 | MyIP | ^1.4.0 | — | 评估保留 |
| class-variance-authority | CSS 变体 | MyIP | ^0.7.1 | — | 评估保留 |
| clsx | CSS 类合并 | MyIP | ^2.1.1 | — | 评估保留 |
| tailwind-merge | Tailwind 类合并 | MyIP | ^3.6.0 | — | 评估保留 |
| reka-ui | 无头 UI 组件 | MyIP | ^2.10.3 | — | 评估保留 |
| vaul-vue | 抽屉组件 | MyIP | ^0.4.1 | — | 评估保留 |
| circle-progress.vue | 圆形进度条 | MyIP | ^3.4.1 | — | 评估保留 |
| vue-input-otp | OTP 输入 | MyIP | ^0.4.0 | — | 评估保留 |
| vue-sonner | Toast 通知 | MyIP | ^2.0.9 | — | 评估保留 |
| @mui/icons-material | MUI 图标 | omni-tools | ^5.15.20 | — | 迁移后移除 |
| @iconify/react | Iconify 图标 (React) | omni-tools | ^5.2.0 | — | 迁移后移除 |
| notistack | Toast 通知 (React) | omni-tools | ^3.0.1 | — | 迁移后移除 |
| formik | 表单管理 (React) | omni-tools | ^2.4.6 | — | 迁移后移除 |
| yup | 表单验证 | omni-tools | ^1.4.0 | — | 评估保留（框架无关） |
| rc-slider | 滑块组件 (React) | omni-tools | ^11.1.8 | — | 迁移后移除 |
| react-filerobot-image-editor | 图片编辑器 (React) | omni-tools | ^4.9.1 | — | 用 Vue 替代方案 |
| react-image-crop | 图片裁剪 (React) | omni-tools | ^11.0.7 | — | 用 Vue 替代方案 |
| react-konva | Canvas 绘图 (React) | omni-tools | ^18.2.10 | — | 用 Vue 替代方案 |
| @monaco-editor/react | Monaco 编辑器 (React) | omni-tools | ^4.7.0 | — | 用 @guolao/vue-monaco-editor 替代 |
| @guolao/vue-monaco-editor | Monaco 编辑器 (Vue) | 1Panel-Tools | ^1.5.2 | ^1.5.x | 保留 |
| @tiptap/vue-3 | 富文本编辑器 | it-tools | 2.0.3 | 2.0.3 | 保留 |
| @tiptap/starter-kit | TipTap 插件 | it-tools | 2.1.6 | 2.1.6 | 保留 |
| @tiptap/pm | ProseMirror | it-tools | 2.1.6 | 2.1.6 | 保留 |
| vuedraggable | 拖拽排序 | it-tools | ^4.1.0 | ^4.1.x | 保留 |
| vue-shadow-dom | Shadow DOM | it-tools | ^4.2.0 | ^4.2.x | 保留 |

### 加密与安全

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| crypto-js | 加密算法 | it-tools | ^4.1.1 | ^4.2.x | 保留 |
| bcryptjs | bcrypt 哈希 | it-tools, omni-tools | ^2.4.3 | ^2.4.3 | 保留 |
| node-forge | TLS/加密 | it-tools | ^1.3.1 | ^1.3.1 | 保留 |
| @it-tools/bip39 | BIP39 助记词 | it-tools | ^0.0.4 | ^0.0.4 | 保留 |
| jwt-decode | JWT 解码 | it-tools | ^3.1.2 | **^4.x** | 建议升级 |
| @thumbmarkjs/thumbmarkjs | 浏览器指纹 | MyIP | ^1.10.1 | ^1.10.x | 保留 |
| js-base64 | Base64 编解码 | it-tools, 1Panel-Tools | ^3.7.6 / ^3.7.7 | ^3.7.x | 保留 |

### 数据格式处理（JSON/YAML/TOML/XML/CSV）

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| json5 | JSON5 解析 | it-tools, 1Panel-Tools, omni-tools | ^2.2.3 | ^2.2.3 | 保留 |
| yaml | YAML 解析 | it-tools, 1Panel-Tools | ^2.2.1 / ^2.8.0 | **^2.8.x** | 统一版本 |
| iarna-toml-esm | TOML 解析 | it-tools | ^3.0.5 | ^3.0.5 | 保留 |
| xml-formatter | XML 格式化 | it-tools | ^3.3.2 | ^3.3.x | 保留 |
| xml-js | XML 转换 | it-tools | ^1.6.11 | ^1.6.x | 保留 |
| fast-xml-parser | XML 解析 | omni-tools | ^5.2.5 | — | 与 xml-js 功能重叠，保留一个 |
| sql-formatter | SQL 格式化 | it-tools | ^13.0.0 | ^13.0.x | 保留 |
| composerize-ts | Docker Compose 转换 | it-tools | ^0.6.2 | ^0.6.2 | 保留 |

### 文本处理

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| lodash | 工具函数 | it-tools, 1Panel-Tools, omni-tools | ^4.17.21 | ^4.17.21 | 保留 |
| change-case | 大小写转换 | it-tools | ^4.1.2 | ^4.1.2 | 保留 |
| date-fns | 日期处理 | it-tools, 1Panel-Tools | ^2.29.3 / ^4.0.0 | **^4.x** | 统一至 v4 |
| dayjs | 日期处理 | omni-tools | ^1.11.13 | — | 与 date-fns 功能重叠，保留一个 |
| fuse.js | 模糊搜索 | it-tools | ^6.6.2 | ^6.6.2 | 保留 |
| flexsearch | 全文搜索 | 1Panel-Tools | ^0.8.205 | — | 与 fuse.js 功能重叠，保留一个 |
| diff | 文本对比 | omni-tools | ^8.0.2 | ^8.0.x | 保留 |
| markdown-it | Markdown 渲染 | it-tools | ^14.0.0 | ^14.0.x | 保留 |
| marked | Markdown 解析 | it-tools, 1Panel-Tools | ^10.0.0 | ^10.0.x | 保留 |
| highlight.js | 语法高亮 | it-tools, 1Panel-Tools | ^11.7.0 / ^11.11.1 | **^11.11.x** | 统一版本 |
| dompurify | HTML 消毒 | it-tools, 1Panel-Tools, omni-tools | ^3.0.6 / ^3.2.6 / ^3.4.2 | **^3.2.x** | 统一版本 |
| figlet | ASCII 艺术字 | it-tools | ^1.7.0 | ^1.7.x | 保留 |
| morsee | 摩尔斯电码 | omni-tools | ^1.0.9 | ^1.0.9 | 保留 |
| to-words | 数字转文字 | omni-tools | ^5.6.1 | ^5.6.x | 保留 |
| js-quantities | 单位换算 | omni-tools | ^1.8.0 | ^1.8.0 | 保留 |
| nerdamer-prime | 数学计算 | omni-tools | ^1.2.4 | ^1.2.4 | 保留 |
| mathjs | 数学计算 | it-tools | ^11.9.1 | ^11.9.x | 保留 |
| randexp | 正则生成 | it-tools | ^0.5.3 | ^0.5.3 | 保留 |
| @regexper/render | 正则可视化 | it-tools | ^1.0.0 | ^1.0.0 | 保留 |
| @sindresorhus/slugify | URL slug | it-tools | ^2.2.1 | ^2.2.x | 保留 |
| email-normalizer | 邮箱规范化 | it-tools | ^1.0.0 | ^1.0.0 | 保留 |
| emojilib | Emoji 数据 | it-tools | ^3.0.10 | ^3.0.x | 保留 |
| unicode-emoji-json | Emoji JSON | it-tools | ^0.4.0 | ^0.4.0 | 保留 |
| libphonenumber-js | 电话号码 | it-tools | ^1.10.28 | ^1.10.x | 保留 |
| ibantools | IBAN 验证 | it-tools | ^4.3.3 | ^4.3.x | 保留 |
| cron-validator | Cron 验证 | it-tools, omni-tools | ^1.3.1 | ^1.3.1 | 保留 |
| cronstrue | Cron 解释 | it-tools, omni-tools | ^2.26.0 / ^3.0.0 | **^3.x** | 统一至 v3 |
| mime-types | MIME 类型 | it-tools, 1Panel-Tools | ^2.1.35 | ^2.1.x | 保留 |
| mime | MIME 类型 | omni-tools | ^4.0.6 | — | 与 mime-types 功能重叠，保留一个 |
| oui-data | OUI 数据 | it-tools | ^1.0.10 | ^1.0.x | 保留 |
| country-code-lookup | 国家代码 | it-tools, MyIP | ^0.1.0 / ^0.1.5 | **^0.1.x** | 统一版本 |
| ua-parser-js | UA 解析 | it-tools, MyIP | ^1.0.35 / ^2.0.10 | **^2.x** | 统一至 v2 |
| uuid | UUID 生成 | it-tools | ^9.0.0 | **^10.x** | 建议升级 |
| ulid | ULID 生成 | it-tools | ^2.3.0 | ^2.3.0 | 保留 |
| @photostructure/tz-lookup | 时区查询 | MyIP | ^11.6.1 | ^11.6.x | 保留 |

### 网络与 IP

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| netmask | IP 子网 | it-tools | ^2.0.2 | ^2.0.2 | 保留 |
| @cloudflare/speedtest | 网速测试 | MyIP | ^1.13.1 | ^1.13.x | 保留 |
| whoiser | WHOIS 查询 | MyIP | ^1.18.0 | ^1.18.x | 保留 |
| http-proxy-middleware | HTTP 代理 | MyIP | ^4.2.0 | ^4.2.x | 保留 |
| maxmind | GeoIP 数据库 | MyIP | ^5.0.7 | ^5.0.x | 后端 |
| firebase | Firebase | MyIP | ^12.18.0 | — | 评估是否需要 |

### 媒体处理（图片/视频/音频/PDF）

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| @ffmpeg/core | FFmpeg WASM 核心 | omni-tools | ^0.12.10 | ^0.12.x | 按需加载 |
| @ffmpeg/ffmpeg | FFmpeg WASM | omni-tools | ^0.12.15 | ^0.12.x | 按需加载 |
| @ffmpeg/util | FFmpeg 工具 | omni-tools | ^0.12.2 | ^0.12.x | 按需加载 |
| @imgly/background-removal | 背景移除 | omni-tools | ^1.6.0 | ^1.6.x | 按需加载 |
| tesseract.js | OCR | omni-tools | ^6.0.0 | ^6.0.x | 按需加载 |
| jimp | 图片处理 | omni-tools | ^0.22.12 | ^0.22.x | 按需加载 |
| @jimp/types | Jimp 类型 | omni-tools | ^1.6.0 | — | 与 jimp 版本不一致，需统一 |
| pdf-lib | PDF 编辑 | omni-tools | ^1.17.1 | ^1.17.x | 按需加载 |
| pdfjs-dist | PDF 渲染 | omni-tools | ^5.2.133 | ^5.2.x | 按需加载 |
| jspdf | PDF 生成 | omni-tools | ^3.0.3 | ^3.0.x | 按需加载 |
| @simplepdf/react-embed-pdf | PDF 嵌入 (React) | omni-tools | ^1.9.0 | — | 迁移后移除 |
| browser-image-compression | 图片压缩 | omni-tools | ^2.0.2 | ^2.0.x | 按需加载 |
| heic-to | HEIC 转换 | omni-tools | ^1.4.2 | ^1.4.x | 按需加载 |
| heic2any | HEIC 转换 | omni-tools | ^0.0.4 | ^0.0.4 | 按需加载 |
| omggif | GIF 处理 | omni-tools | ^1.0.10 | ^1.0.10 | 按需加载 |
| react-konva | Canvas 绘图 | omni-tools | ^18.2.10 | — | 用 Vue 替代方案 |
| html-to-image | HTML 转图片 | MyIP | ^1.11.13 | ^1.11.x | 保留 |
| jszip | ZIP 压缩 | 1Panel-Tools, omni-tools | ^3.10.1 | ^3.10.x | 保留 |
| file-saver | 文件保存 | 1Panel-Tools | ^2.0.5 | ^2.0.5 | 保留 |
| qrcode | 二维码生成 | it-tools, omni-tools | ^1.5.1 / ^1.5.4 | **^1.5.x** | 统一版本 |
| pdf-signature-reader | PDF 签名读取 | it-tools | ^1.4.2 | ^1.4.2 | 按需加载 |
| colord | 颜色处理 | it-tools | ^2.9.3 | ^2.9.x | 保留 |
| color | 颜色处理 | omni-tools | ^4.2.3 | — | 与 colord 功能重叠，保留一个 |

### 图表与可视化

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| chart.js | 图表库 | MyIP | ^4.5.1 | ^4.5.x | 保留 |
| chartjs-chart-geo | 地理图表 | MyIP | ^4.3.6 | ^4.3.x | 保留 |
| world-atlas | 世界地图数据 | MyIP | ^2.0.2 | ^2.0.2 | 保留 |
| dagre | 图布局 | MyIP | ^0.8.5 | ^0.8.5 | 保留 |
| figue | 图表库 | it-tools | ^1.2.0 | ^1.2.0 | 保留 |
| @tanstack/vue-table | 表格 | MyIP | ^9.1.2 | ^9.1.x | 保留 |

### 开发工具

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| monaco-editor | 代码编辑器 | it-tools, 1Panel-Tools, omni-tools | ^0.43.0 / ^0.44.0 / ^0.53.0 | **^0.53.x** | 统一版本，按需加载 |
| @vueuse/core | Vue 工具集 | it-tools, 1Panel-Tools, MyIP | ^10.3.0 / ^10.11.1 / ^14.4.0 | **^11.x** | 统一版本 |
| @vueuse/head | Head 管理 | it-tools, 1Panel-Tools | ^1.0.0 | ^1.0.0 | 保留 |
| @vueuse/router | 路由工具 | it-tools, 1Panel-Tools | ^10.0.0 | ^10.0.0 | 保留 |
| @vueuse/shared | VueUse 共享 | 1Panel-Tools | 10.11.1 | — | 随 @vueuse/core 一起 |
| vue-tsc | Vue TS 检查 | it-tools, 1Panel-Tools | ^1.8.1 | **^2.x** | 建议升级 |
| vue-i18n | 国际化 | it-tools, 1Panel-Tools, MyIP | ^9.9.1 / ^11.1.9 / ^11.4.8 | **^11.x** | 统一至 v11 |
| unplugin-auto-import | 自动导入 | it-tools, 1Panel-Tools | ^0.16.4 | ^0.16.x | 保留 |
| unplugin-vue-components | 组件自动导入 | it-tools, 1Panel-Tools | ^0.25.0 | ^0.25.0 | 保留 |
| unplugin-icons | 图标自动导入 | it-tools, 1Panel-Tools | ^0.17.0 | ^0.17.0 | 保留 |
| @intlify/unplugin-vue-i18n | i18n Vite 插件 | it-tools, 1Panel-Tools | ^2.0.0 / ^6.0.8 | **^6.x** | 统一版本 |
| vite-plugin-pwa | PWA 插件 | it-tools | ^0.16.0 | ^0.16.x | 保留 |
| vite-plugin-vue-markdown | Markdown 插件 | it-tools | ^0.23.5 | ^0.23.5 | 保留 |
| vite-svg-loader | SVG 加载器 | it-tools, 1Panel-Tools | ^4.0.0 | ^4.0.0 | 保留 |
| vite-plugin-node-polyfills | Node polyfill | 1Panel-Tools | ^0.23.0 | ^0.23.0 | 保留 |
| vite-tsconfig-paths | TS 路径插件 | omni-tools | ^4.3.2 | — | 评估保留 |
| unocss-preset-scrollbar | 滚动条预设 | it-tools, 1Panel-Tools | ^0.2.1 | ^0.2.1 | 保留 |
| @it-tools/oggen | OG 图片生成 | it-tools | ^1.3.0 | ^1.3.0 | 保留 |
| plausible-tracker | 分析追踪 | it-tools | ^0.3.8 | — | 评估保留 |
| @khmyznikov/pwa-install | PWA 安装 | MyIP | ^0.6.4 | ^0.6.4 | 保留 |
| vconsole | 移动端调试 | MyIP | ^3.15.1 | — | 开发依赖 |
| code-inspector-plugin | 代码检查 | MyIP | ^2.0.7 | — | 开发依赖 |
| buffer | Buffer polyfill | omni-tools | ^6.0.3 | — | 评估保留 |

### 后端框架与中间件

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| express | Web 框架 | MyIP | ^5.2.1 | ^5.2.1 | 可选后端 |
| express-rate-limit | 限流 | MyIP | ^8.6.2 | ^8.6.x | 可选后端 |
| express-slow-down | 减速 | MyIP | ^3.1.0 | ^3.1.0 | 可选后端 |
| pino | 日志 | MyIP | ^10.3.1 | ^10.3.x | 可选后端 |
| pino-http | HTTP 日志 | MyIP | ^11.0.0 | ^11.0.x | 可选后端 |
| pino-pretty | 日志美化 | MyIP | ^13.1.3 | ^13.1.x | 可选后端 |
| @sentry/node | Sentry 后端 | MyIP | ^10.70.0 | — | 可选 |
| @sentry/vue | Sentry 前端 | MyIP | ^10.70.0 | — | 可选 |
| @sentry/vite-plugin | Sentry Vite | MyIP | ^5.4.0 | — | 可选 |
| dotenv | 环境变量 | MyIP | ^17.4.2 | ^17.4.x | 可选后端 |
| tar | 压缩/解压 | MyIP | ^7.5.22 | ^7.5.x | 可选后端 |
| unbzip2-stream | bzip2 解压 | MyIP | ^1.4.3 | ^1.4.3 | 可选后端 |
| concurrently | 并行运行 | MyIP | ^10.0.5 | ^10.0.x | 开发依赖 |
| nodemon | 自动重启 | MyIP | ^3.1.14 | ^3.1.x | 开发依赖 |
| onnxruntime-web | ONNX 推理 | omni-tools | 1.21.0 | — | 评估保留 |

### 国际化

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| vue-i18n | Vue 国际化 | it-tools, 1Panel-Tools, MyIP | ^9.9.1 / ^11.x | **^11.x** | 统一至 v11 |
| @intlify/unplugin-vue-i18n | i18n Vite 插件 | it-tools, 1Panel-Tools | ^2.0.0 / ^6.0.8 | **^6.x** | 统一版本 |
| i18next | React 国际化 | omni-tools | ^25.3.2 | — | 迁移后移除 |
| react-i18next | React i18next | omni-tools | ^15.6.0 | — | 迁移后移除 |
| i18next-browser-languagedetector | 语言检测 | omni-tools | ^8.2.0 | — | 迁移后移除 |
| i18next-http-backend | i18n 后端 | omni-tools | ^3.0.2 | — | 迁移后移除 |
| @types/react-i18next | React i18next 类型 | omni-tools | ^7.8.3 | — | 迁移后移除 |
| i18next-locize-backend | Locize 后端 | omni-tools | ^7.0.4 | — | 迁移后移除 |
| locize | Locize CLI | omni-tools | ^4.0.14 | — | 迁移后移除 |
| locize-cli | Locize CLI | omni-tools | ^10.1.1 | — | 迁移后移除 |

### 其他

| 包名 | 用途 | 来源项目 | 版本 | 整合版本 | 备注 |
|------|------|----------|------|----------|------|
| type-fest | TS 类型工具 | omni-tools | ^4.35.0 | ^4.35.x | 保留 |
| use-deep-compare-effect | 深比较 Hook | omni-tools | ^1.8.1 | — | 迁移后移除 |
| react-helmet | Head 管理 (React) | omni-tools | ^6.1.0 | — | 迁移后移除 |
| @types/* | 类型定义 | 各项目 | 各版本 | 按需 | 按需安装 |
| husky | Git hooks | omni-tools | ^9.0.11 | — | 评估保留 |
| lint-staged | 暂存检查 | omni-tools | ^15.4.3 | — | 评估保留 |
| @commitlint/* | 提交规范 | omni-tools | ^19.x | — | 评估保留 |

---

## 版本冲突与解决方案

| 包名 | it-tools | 1Panel-Tools | omni-tools | MyIP | 解决方案 |
|------|----------|--------------|------------|------|----------|
| vue | ^3.3.4 | ^3.5.25 | — | ^3.5.41 | 统一至 **^3.5.x** |
| vite | ^4.4.9 | ^4.4.9 | ^5.2.11 | ^8.2.2 | 统一至 **^5.4.x**（it-tools 需升级，MyIP 需降级） |
| @vitejs/plugin-vue | ^4.3.2 | ^4.3.4 | — | ^6.0.8 | 统一至 **^5.x**（匹配 Vite 5） |
| naive-ui | ^2.35.0 | ^2.35.0 | — | — | 统一升级至 **^2.40.x** |
| vue-router | ^4.1.6 | ^4.1.6 | — | ^5.2.0 | 统一至 **^4.5.x**（MyIP 的 v5 需降级） |
| pinia | ^2.0.34 | ^2.0.34 | — | ^4.0.3 | 统一至 **^2.3.x**（MyIP 的 v4 需降级） |
| @vueuse/core | ^10.3.0 | ^10.11.1 | — | ^14.4.0 | 统一至 **^11.x** |
| vue-i18n | ^9.9.1 | ^11.1.9 | — | ^11.4.8 | 统一至 **^11.x** |
| @intlify/unplugin-vue-i18n | ^2.0.0 | ^6.0.8 | — | — | 统一至 **^6.x** |
| date-fns | ^2.29.3 | ^4.0.0 | — | — | 统一至 **^4.x** |
| dompurify | ^3.0.6 | ^3.2.6 | ^3.4.2 | — | 统一至 **^3.2.x** |
| highlight.js | ^11.7.0 | ^11.11.1 | — | — | 统一至 **^11.11.x** |
| js-base64 | ^3.7.6 | ^3.7.7 | — | — | 统一至 **^3.7.x** |
| json5 | ^2.2.3 | ^2.2.3 | ^2.2.3 | — | 一致，无需处理 |
| lodash | ^4.17.21 | ^4.17.21 | ^4.17.21 | — | 一致，无需处理 |
| monaco-editor | ^0.43.0 | ^0.44.0 | ^0.53.0 | — | 统一至 **^0.53.x** |
| yaml | ^2.2.1 | ^2.8.0 | — | — | 统一至 **^2.8.x** |
| cronstrue | ^2.26.0 | — | ^3.0.0 | — | 统一至 **^3.x** |
| ua-parser-js | ^1.0.35 | — | — | ^2.0.10 | 统一至 **^2.x** |
| uuid | ^9.0.0 | — | — | — | 升级至 **^10.x** |
| jwt-decode | ^3.1.2 | — | — | — | 升级至 **^4.x** |
| @types/node | ^18.15.11 | ^22.0.0 | ^20.12.12 | — | 统一至 **^22.x** |
| typescript | ~5.2.0 | ~5.2.2 | ^5.4.5 | — | 统一至 **~5.5.x** |
| eslint | ^8.47.0 | ^8.47.0 | ^8.57.0 | — | 统一至 **^8.57.x** |
| prettier | ^3.0.0 | ^3.0.0 | 3.1.1 | — | 统一至 **^3.1.x** |
| unocss | ^0.65.1 | ^0.57.1 | — | — | 统一至 **^0.65.x** |
| vue-tsc | ^1.8.1 | ^1.8.1 | — | — | 升级至 **^2.x** |
| tailwindcss | — | — | ^3.4.3 | ^4.3.3 | 统一用 UnoCSS 替代 |
| pinia | ^2.0.34 | ^2.0.34 | — | ^4.0.3 | 统一至 **^2.3.x** |

---

## 重型依赖（需按需加载）

| 包名 | 大小估计 | 关联工具 | 加载策略 |
|------|----------|----------|----------|
| @ffmpeg/core + @ffmpeg/ffmpeg + @ffmpeg/util | ~30 MB (WASM) | 视频转换/压缩/剪辑 | 动态 import + Web Worker，仅在视频工具页面加载 |
| tesseract.js | ~15 MB (WASM + 语言包) | OCR 文字识别 | 动态 import + 语言包按需下载 |
| monaco-editor | ~5 MB | 代码编辑器 | 动态 import，按语言分包 |
| @imgly/background-removal | ~10 MB (ONNX 模型) | 图片背景移除 | 动态 import + 模型懒加载 |
| onnxruntime-web | ~5 MB (WASM) | ONNX 模型推理 | 与背景移除一起按需加载 |
| jimp | ~3 MB | 图片处理 | 动态 import |
| pdf-lib | ~1 MB | PDF 编辑 | 动态 import |
| pdfjs-dist | ~2 MB | PDF 渲染 | 动态 import |
| jspdf | ~1 MB | PDF 生成 | 动态 import |
| node-forge | ~1 MB | 加密/证书 | 动态 import |
| mathjs | ~2 MB | 数学计算 | 动态 import |
| nerdamer-prime | ~2 MB | 符号计算 | 动态 import |
| @tiptap/* | ~2 MB | 富文本编辑 | 动态 import |
| chart.js + chartjs-chart-geo | ~500 KB | 图表/地图 | 动态 import |
| world-atlas | ~1 MB (TopoJSON) | 世界地图 | 动态 import |
| firebase | ~500 KB | 后端服务 | 评估是否需要，如保留则按需加载 |

---

## 可移除/替代的依赖

| 包名 | 来源项目 | 原因 | 替代方案 |
|------|----------|------|----------|
| react / react-dom | omni-tools | 迁移至 Vue 3 | — |
| react-router-dom | omni-tools | 迁移至 vue-router | vue-router |
| @mui/material / @mui/icons-material | omni-tools | React 专属 | naive-ui |
| @emotion/react / @emotion/styled | omni-tools | React 专属 | UnoCSS |
| styled-components | omni-tools | React 专属 | UnoCSS |
| formik | omni-tools | React 专属 | 原生表单或 vee-validate |
| notistack | omni-tools | React 专属 | naive-ui message |
| react-helmet | omni-tools | React 专属 | @vueuse/head |
| @monaco-editor/react | omni-tools | React 专属 | @guolao/vue-monaco-editor |
| @simplepdf/react-embed-pdf | omni-tools | React 专属 | 自研 Vue PDF 组件 |
| react-filerobot-image-editor | omni-tools | React 专属 | 评估 Vue 替代或自研 |
| react-image-crop | omni-tools | React 专属 | vue-cropper 或自研 |
| react-konva | omni-tools | React 专属 | vue-konva 或自研 |
| rc-slider | omni-tools | React 专属 | naive-ui slider |
| use-deep-compare-effect | omni-tools | React 专属 | Vue watch deep |
| i18next / react-i18next / * | omni-tools | React 专属 | vue-i18n |
| locize / locize-cli | omni-tools | 商业服务 | 自建 i18n 工作流 |
| tailwindcss / @tailwindcss/vite | omni-tools, MyIP | 统一用 UnoCSS | unocss |
| autoprefixer / postcss | omni-tools | Tailwind 依赖 | — |
| dayjs | omni-tools | 与 date-fns 重叠 | date-fns |
| fast-xml-parser | omni-tools | 与 xml-js 重叠 | xml-js |
| mime | omni-tools | 与 mime-types 重叠 | mime-types |
| color | omni-tools | 与 colord 重叠 | colord |
| flexsearch | 1Panel-Tools | 与 fuse.js 重叠 | fuse.js |
| @jimp/types | omni-tools | 与 jimp 版本不一致 | 统一 jimp 版本 |
| @types/react-i18next | omni-tools | React 专属 | — |
| @types/ffmpeg | omni-tools | 非官方类型 | 自研类型 |
| buffer | omni-tools | Node polyfill | vite-plugin-node-polyfills |
| unenv | 1Panel-Tools | 未使用 | — |
| plausible-tracker | it-tools | 可选分析 | 评估保留 |
| firebase | MyIP | 评估是否需要 | 自建后端替代 |
| @sentry/* | MyIP | 可选监控 | 评估保留 |
| vconsole | MyIP | 开发调试 | 开发依赖保留 |
| code-inspector-plugin | MyIP | 开发调试 | 开发依赖保留 |
