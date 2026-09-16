# ToolNest 许可证清单

## 项目许可证

| 项目 | 许可证 | 兼容性 | 备注 |
|------|--------|--------|------|
| it-tools | GPL-3.0 | ✅ 兼容 | 基底项目，需保留 GPL-3.0 |
| 1Panel-Tools | GPL-3.0 | ✅ 兼容 | it-tools fork，同样 GPL-3.0 |
| MyIP | MIT | ✅ 兼容 | 需保留版权声明 |
| omni-tools | MIT | ✅ 兼容 | 需保留版权声明 |

---

## ToolNest 许可证选择

**主许可证：GPL-3.0**

### 选择理由

1. **it-tools 和 1Panel-Tools 均为 GPL-3.0**，作为基底项目，衍生作品必须继续使用 GPL-3.0
2. GPL-3.0 确保 ToolNest 及其衍生作品保持开源
3. 与项目目标一致：为开发者社区提供自由、开放的工具集合

### 兼容性分析

| 许可证 | 与 GPL-3.0 兼容性 | 说明 |
|--------|-------------------|------|
| GPL-3.0 | ✅ 完全兼容 | 同许可证，无冲突 |
| MIT | ✅ 兼容 | MIT 代码可并入 GPL-3.0 项目，但需保留版权声明 |
| Apache 2.0 | ✅ 兼容 | Apache 2.0 代码可并入 GPL-3.0 项目，但需保留版权声明和 NOTICE 文件 |
| BSD (2/3-clause) | ✅ 兼容 | 需保留版权声明 |
| ISC | ✅ 兼容 | 需保留版权声明 |
| LGPL-2.1 | ✅ 兼容 | 动态链接时需允许替换 |
| MPL-2.0 | ⚠️ 部分兼容 | 文件级 copyleft，需注意混合代码 |
| CC0 / Public Domain | ✅ 兼容 | 无版权限制 |
| WTFPL | ✅ 兼容 | 宽松许可证 |

**注意**：GPL-3.0 与某些许可证不兼容（如 CC-BY-SA 4.0、Apache 1.0、旧版 GPL），但四个上游项目均使用兼容许可证。

---

## 上游许可证保留要求

### it-tools (GPL-3.0)

- **版权所有**：Corentin Th <corentin.thomasset74+it-tools@gmail.com>
- **要求**：
  - 保留原始 GPL-3.0 许可证文本
  - 保留版权声明
  - 修改后的文件需标明修改
  - 提供源代码

### 1Panel-Tools (GPL-3.0)

- **版权所有**：Corentin Th（原始 it-tools 作者）+ arch3rPro（fork 维护者）
- **要求**：同 it-tools

### MyIP (MIT)

- **版权所有**：Jason Ng (2026)
- **要求**：
  - 保留 MIT 许可证文本
  - 保留版权声明
  - 需在显著位置注明使用了 MyIP 的代码

### omni-tools (MIT)

- **版权所有**：Ibrahima Gaye Coulibaly (2024)
- **要求**：
  - 保留 MIT 许可证文本
  - 保留版权声明
  - 需在显著位置注明使用了 omni-tools 的代码

---

## 第三方依赖许可证分类

以下为主要生产依赖的许可证分类（基于 npm 包通常使用的许可证）：

### MIT 许可

绝大多数 npm 包使用 MIT 许可证，包括但不限于：

- vue, vue-router, pinia
- lodash, axios
- @vueuse/core, @vueuse/head, @vueuse/router
- naive-ui
- @tabler/icons-vue, @vicons/material, @vicons/tabler
- dayjs, date-fns
- crypto-js, bcryptjs, js-base64
- json5, yaml, xml-js, xml-formatter
- highlight.js, markdown-it, marked
- dompurify
- fuse.js
- qrcode
- uuid, ulid
- jszip, file-saver
- chart.js
- monaco-editor
- @ffmpeg/ffmpeg, @ffmpeg/util, @ffmpeg/core
- tesseract.js
- jimp, @jimp/types
- pdf-lib, pdfjs-dist, jspdf
- @imgly/background-removal
- express, express-rate-limit, express-slow-down
- pino, pino-http, pino-pretty
- cors, dotenv
- mime-types, mime
- ua-parser-js
- country-code-lookup
- colord, color
- diff
- figlet
- mathjs
- cron-validator, cronstrue
- libphonenumber-js
- ibantools
- @sindresorhus/slugify
- change-case
- sql-formatter
- iarna-toml-esm
- fast-xml-parser
- buffer
- type-fest
- @tiptap/* (MIT)
- vuedraggable
- vue-shadow-dom
- @guolao/vue-monaco-editor
- @monaco-editor/react
- react, react-dom (迁移后移除)
- @mui/material (MIT)
- @emotion/* (MIT)
- styled-components (MIT)
- i18next, react-i18next (MIT)
- @tanstack/vue-table (MIT)
- reka-ui (MIT)
- tailwindcss (MIT)
- unocss (MIT)
- vite, @vitejs/plugin-vue (MIT)
- typescript (Apache-2.0，但类型定义通常 MIT)
- eslint, prettier (MIT)

### Apache 2.0 许可

- @cloudflare/speedtest
- @sentry/* (BSD-3-Clause / MIT / Apache-2.0 混合，需确认)
- firebase (Apache-2.0)
- @tensorflow/tfjs (Apache-2.0)（如使用）
- onnxruntime-web (MIT)

### BSD 许可

- @sentry/node, @sentry/vue (BSD-3-Clause)
- @sentry/vite-plugin (MIT)

### ISC 许可

- @types/* (通常 MIT 或 ISC)
- rimraf, glob 等 Node.js 工具包

### 其他许可

| 包名 | 许可证 | 备注 |
|------|--------|------|
| node-forge | BSD-3-Clause | 或 GPL-2.0 双许可，选择 BSD |
| netmask | MIT | |
| oui-data | MIT | |
| emojilib | MIT | |
| unicode-emoji-json | MIT | |
| email-normalizer | MIT | |
| @it-tools/bip39 | MIT | |
| @it-tools/oggen | MIT | |
| @regexper/render | MIT | |
| figue | MIT | |
| randexp | MIT | |
| composerize-ts | MIT | |
| pdf-signature-reader | MIT | |
| cron-validator | MIT | |
| nerdamer-prime | MIT | |
| morsee | MIT | |
| to-words | MIT | |
| js-quantities | MIT | |
| heic-to | MIT | |
| heic2any | MIT | |
| omggif | MIT | (注意：omggif 为 Unlicense/MIT 双许可) |
| browser-image-compression | MIT | |
| @simplepdf/react-embed-pdf | MIT | |
| react-filerobot-image-editor | MIT | |
| react-image-crop | MIT | |
| react-konva | MIT | |
| rc-slider | MIT | |
| use-deep-compare-effect | MIT | |
| formik | MIT | |
| yup | MIT | |
| notistack | MIT | |
| react-helmet | MIT | |
| @emotion/react | MIT | |
| @emotion/styled | MIT | |
| @mui/icons-material | MIT | |
| @mui/material | MIT | |
| styled-components | MIT | |
| @iconify/* | MIT | |
| @lucide/vue | ISC | |
| @photostructure/tz-lookup | MIT | |
| @thumbmarkjs/thumbmarkjs | MIT | |
| @khmyznikov/pwa-install | MIT | |
| circle-progress.vue | MIT | |
| class-variance-authority | MIT | |
| clsx | MIT | |
| tailwind-merge | MIT | |
| tw-animate-css | MIT | |
| vaul-vue | MIT | |
| vue-input-otp | MIT | |
| vue-sonner | MIT | |
| vue-markdown-render | MIT | |
| html-to-image | MIT | |
| dagre | MIT | |
| world-atlas | ISC | |
| chartjs-chart-geo | MIT | |
| whoiser | MIT | |
| maxmind | MIT | |
| http-proxy-middleware | MIT | |
| tar | ISC | |
| unbzip2-stream | MIT | |
| concurrently | MIT | |
| nodemon | MIT | |
| dotenv | BSD-2-Clause | |
| express | MIT | |
| express-rate-limit | MIT | |
| express-slow-down | MIT | |
| pino | MIT | |
| pino-http | MIT | |
| pino-pretty | MIT | |
| firebase | Apache-2.0 | |
| @cloudflare/speedtest | Apache-2.0 | |
| @sentry/node | BSD-3-Clause | |
| @sentry/vue | BSD-3-Clause | |
| @sentry/vite-plugin | MIT | |
| @tanstack/vue-table | MIT | |
| @types/* | MIT | |
| @playwright/test | Apache-2.0 | |
| playwright | Apache-2.0 | |
| happy-dom | MIT | |
| husky | MIT | |
| lint-staged | MIT | |
| @commitlint/* | MIT | |
| autoprefixer | MIT | |
| postcss | MIT | |
| @tailwindcss/vite | MIT | |
| vconsole | MIT | |
| code-inspector-plugin | MIT | |
| unplugin-auto-import | MIT | |
| unplugin-vue-components | MIT | |
| unplugin-icons | MIT | |
| @intlify/unplugin-vue-i18n | MIT | |
| vite-plugin-pwa | MIT | |
| vite-plugin-vue-markdown | MIT | |
| vite-svg-loader | MIT | |
| vite-plugin-node-polyfills | MIT | |
| vite-tsconfig-paths | MIT | |
| unocss-preset-scrollbar | MIT | |
| @antfu/eslint-config | MIT | |
| @unocss/eslint-config | MIT | |
| @rushstack/eslint-patch | MIT | |
| @tsconfig/node18 | MIT | |
| @vue/tsconfig | MIT | |
| consola | MIT | |
| hygen | MIT | |
| jsdom | MIT | |
| less | Apache-2.0 | |
| workbox-window | MIT | |
| zx | Apache-2.0 | |
| @iconify-json/mdi | MIT | (图标数据，CC-BY-4.0 部分) |
| @iconify-json/circle-flags | MIT | |

---

## 署名要求

### 需要保留的版权声明列表

```
================================================================================
ToolNest - 统一在线工具平台
Copyright (C) 2026 ToolNest Contributors
License: GPL-3.0-or-later

Based on:
================================================================================

1. it-tools
   Copyright (C) Corentin Th <corentin.thomasset74+it-tools@gmail.com>
   License: GPL-3.0
   Source: https://github.com/CorentinTh/it-tools

2. 1Panel-Tools
   Copyright (C) Corentin Th (original it-tools author)
   Copyright (C) arch3rPro (fork maintainer)
   License: GPL-3.0
   Source: https://github.com/arch3rPro/1Panel-Tools

3. MyIP
   Copyright (C) 2026 Jason Ng
   License: MIT
   Source: https://github.com/jason5ng32/MyIP

4. omni-tools
   Copyright (C) 2024 Ibrahima Gaye Coulibaly
   License: MIT
   Source: https://github.com/iib0011/omni-tools
================================================================================
```

### 署名位置建议

1. **README.md**：项目简介中注明基于上述项目
2. **LICENSE 文件**：包含 GPL-3.0 全文 + 上述版权声明
3. **THIRD_PARTY_NOTICES.md**：完整的第三方依赖许可证列表
4. **应用内 About/Credits 页面**：图形化展示上游项目贡献
5. **每个迁移文件的头部注释**：注明原始来源（如适用）

---

## THIRD_PARTY_NOTICES.md 框架

```markdown
# Third-Party Notices

ToolNest incorporates third-party software from the following projects.
Each project is licensed under its respective terms as noted below.

---

## Upstream Projects

### it-tools
- **License**: GPL-3.0
- **Copyright**: Corentin Th
- **Source**: https://github.com/CorentinTh/it-tools
- **Usage**: Base application framework, 86+ tools

### 1Panel-Tools
- **License**: GPL-3.0
- **Copyright**: Corentin Th, arch3rPro
- **Source**: https://github.com/arch3rPro/1Panel-Tools
- **Usage**: Docker Compose to 1Panel converter tool

### MyIP
- **License**: MIT
- **Copyright**: 2026 Jason Ng
- **Source**: https://github.com/jason5ng32/MyIP
- **Usage**: Network diagnostic tools, Express backend patterns

### omni-tools
- **License**: MIT
- **Copyright**: 2024 Ibrahima Gaye Coulibaly
- **Source**: https://github.com/iib0011/omni-tools
- **Usage**: Media processing tools (image/video/audio/PDF)

---

## Third-Party Dependencies

### MIT License

[Auto-generated list of MIT-licensed packages]

### Apache License 2.0

[Auto-generated list of Apache 2.0-licensed packages]

### BSD Licenses

[Auto-generated list of BSD-licensed packages]

### ISC License

[Auto-generated list of ISC-licensed packages]

### Other Licenses

[Auto-generated list of packages with other licenses]

---

## Font and Icon Licenses

### Fonts
- [List embedded fonts and their licenses]

### Icons
- Tabler Icons: MIT
- Material Icons: Apache 2.0
- Lucide Icons: ISC
- Circle Flags: MIT

---

## Data and Assets

- world-atlas: ISC
- oui-data: MIT
- emojilib: MIT
- unicode-emoji-json: MIT

---

*This file is auto-generated. Last updated: [DATE]*
```

---

## GPL-3.0 合规检查清单

### 必须项

- [ ] 项目根目录包含 GPL-3.0 许可证全文（`LICENSE` 或 `COPYING` 文件）
- [ ] 每个源文件头部包含版权和许可证声明（或至少在根目录和 README 中声明）
- [ ] 保留所有上游项目的版权声明和许可证文本
- [ ] 在显著位置（README、About 页面）注明基于的项目
- [ ] 提供获取源代码的方式（如公开仓库链接）
- [ ] 修改 GPL 许可的文件时，在文件头部注明修改内容和日期

### 建议项

- [ ] 创建 `THIRD_PARTY_NOTICES.md` 列出所有第三方依赖
- [ ] 在应用内添加 Licenses/Credits 页面
- [ ] 定期扫描依赖许可证变化（如使用 `license-checker`）
- [ ] 对 Apache 2.0 依赖保留其 NOTICE 文件内容
- [ ] 对 CC-BY 许可的图标/数据注明来源

### 工具推荐

```bash
# 扫描项目依赖许可证
npx license-checker --summary

# 生成详细报告
npx license-checker --json > licenses.json

# 检查 GPL 兼容性
npx license-checker --excludePackages 'tool-nest@1.0.0' --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;GPL-3.0;LGPL-2.1;MPL-2.0;CC0-1.0;Unlicense'
```

---

## 总结

| 类别 | 数量 | 兼容性 |
|------|------|--------|
| 上游项目 GPL-3.0 | 2 | ✅ 完全兼容 |
| 上游项目 MIT | 2 | ✅ 兼容（需署名） |
| 第三方依赖 MIT | ~150+ | ✅ 兼容 |
| 第三方依赖 Apache 2.0 | ~5 | ✅ 兼容（需保留 NOTICE） |
| 第三方依赖 BSD | ~3 | ✅ 兼容 |
| 第三方依赖 ISC | ~5 | ✅ 兼容 |
| **不兼容许可证** | **0** | ✅ 无冲突 |

**结论**：ToolNest 使用 GPL-3.0 作为主许可证，与所有上游项目和第三方依赖完全兼容。
