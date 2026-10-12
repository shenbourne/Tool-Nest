# ToolNest 工具迁移清单

> 生成日期：2026-09-17
> 更新日期：2026-09-17（逐项对照 `apps/web/src/tools` 实际实现核对迁移状态，并补记验证情况）
> 数据来源：it-tools (86) / 1Panel-Tools (1) / omni-tools (~126) / MyIP (~20)

---

## 概述

| 来源项目 | 工具总数 | 纯浏览器 | 需后端 | 混合 | 许可 |
|---------|---------|---------|--------|------|------|
| it-tools | 86 | 86 | 0 | 0 | GPL-3.0 |
| 1Panel-Tools | 1 | 1 | 0 | 0 | GPL-3.0 |
| omni-tools | ~126 | ~126 | 0 | 0 | MIT |
| MyIP | ~20 | 8 | 7 | 3 | MIT |
| **合计（原始条目）** | **~233** | | | | |

### 迁移统计（去重后）

| 类别 | 数量 | 说明 |
|------|------|------|
| 直接迁移（无重复） | ~150 | 单一来源，直接迁移 |
| 合并迁移（多来源重复） | ~40 组 | 涉及 ~90 个条目，合并为 ~40 个工具 |
| 不可迁移 | 3 | MyIP 私有 API 工具 |
| **去重后净工具数** | **~190** | |

### 迁移进度（2026-09-17 核对）

| 状态 | 条目数 | 说明 |
|------|--------|------|
| 已迁移 | 124 | 含平台功能 3 项（#226/#227/#230）与生成器分类交叉引用 7 项 |
| 已合并 | 3 | #60 → browser-fingerprint、#88 → mac-lookup、#151 → image-compress |
| 待迁移 | 103 | 主要为 YAML/TOML/XML 转换、视频/音频、二维码与网络测试类 |
| **编号条目小计** | **230** | |
| 排除 | 3 | X01–X03（MyIP 私有 API，不占用编号条目） |

### 验证方式（2026-09-17）

- 实现核对：逐项对照 `apps/web/src/tools/*/index.ts`（`registry.ts` 通过 `import.meta.glob` 自动发现并注册路由）。
- 机械校验：`pnpm --filter @toolnest/web test`（registry 测试 4/4 通过：模块可加载、元数据有效、路径唯一）与 `pnpm --filter @toolnest/web type-check`（vue-tsc 通过）。
- 抽查记录：hash-text、bcrypt、chronometer、mac-lookup、csv-to-json、browser-fingerprint 等条目状态与实现目录逐一核对一致。
- 迁移批次：80baa24（crypto）、0c6271b（converter/web/math/text）、3b28f31（text/measurement）、cc01408（omni 轻量工具）、b2afb0f（image/pdf）、0ff8b3b（MyIP 网络）。
- “验证情况”列中的 `apps/web/src/tools/<dir>/；/<path>` 表示实现目录与注册路由；`—` 表示尚无实现。

---

## 分类体系

ToolNest 统一分类（不按来源项目划分）：

| # | 分类 ID | 分类名称 | 说明 |
|---|---------|---------|------|
| 1 | `crypto` | 加密与安全 | 哈希、加密、密码学、密码工具 |
| 2 | `converter` | 格式转换 | 编码/格式/单位/颜色/时间转换 |
| 3 | `web` | Web 开发 | URL、HTML、JWT、HTTP、Meta、UA |
| 4 | `developer` | 开发者工具 | JSON、YAML、XML、SQL、正则、Git、Docker |
| 5 | `network` | 网络工具 | IP 计算、MAC、DNS、Whois、连通性 |
| 6 | `text` | 文本处理 | 文本统计、转换、比较、生成 |
| 7 | `data` | 数据处理 | CSV、TSV、列表操作 |
| 8 | `image` | 图片处理 | 图片编辑、压缩、格式转换、OCR |
| 9 | `video` | 视频处理 | 视频剪辑、压缩、格式转换 |
| 10 | `audio` | 音频处理 | 音频剪辑、转换、合并 |
| 11 | `pdf` | PDF 处理 | PDF 合并、拆分、压缩、转换 |
| 12 | `math` | 数学计算 | 计算器、数学求值、百分比 |
| 13 | `measurement` | 度量与时间 | 温度、计时、基准测试、时间计算 |
| 14 | `generator` | 生成器 | UUID、密码、Lorem、占位图、QR 码 |
| 15 | `network-test` | 网络测试 | 速度测试、Ping、MTR、DNS 泄露 |
| 16 | `platform` | 平台功能 | 分享、设置、主题、报告 |

---

## 工具清单

### 1. 加密与安全 (crypto)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 1 | Token Generator | it-tools | `src/tools/token-generator/` | 浏览器 | 无 | — | 直接迁移 | 已合并 | `apps/web/src/tools/password-generator/；/password-generator（旧 /token-generator 重定向）` |
| 2 | Hash Text | it-tools | `src/tools/hash-text/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/hash-text/；/hash-text` |
| 3 | BCrypt | it-tools | `src/tools/bcrypt/` | 浏览器 | bcryptjs | omni: string/bcrypt | 保留 it-tools（含对比验证） | 已迁移 | `apps/web/src/tools/bcrypt/；/bcrypt` |
| 4 | UUID Generator | it-tools | `src/tools/uuid-generator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/uuid-generator/；/uuid-generator` |
| 5 | ULID Generator | it-tools | `src/tools/ulid-generator/` | 浏览器 | ulid | — | 直接迁移 | 已迁移 | `apps/web/src/tools/ulid-generator/；/ulid-generator` |
| 6 | Encryption/Decryption | it-tools | `src/tools/encryption/` | 浏览器 | crypto-js | — | 直接迁移 | 已迁移 | `apps/web/src/tools/encryption/；/encryption` |
| 7 | BIP39 Generator | it-tools | `src/tools/bip39-generator/` | 浏览器 | bip39 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/bip39-generator/；/bip39-generator` |
| 8 | HMAC Generator | it-tools | `src/tools/hmac-generator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/hmac-generator/；/hmac-generator` |
| 9 | RSA Key Pair Generator | it-tools | `src/tools/rsa-key-pair-generator/` | 浏览器 | node-forge | — | 直接迁移 | 已迁移 | `apps/web/src/tools/rsa-key-pair-generator/；/rsa-key-pair-generator` |
| 10 | Password Strength Analyser | it-tools | `src/tools/password-strength-analyser/` | 浏览器 | zxcvbn | — | 直接迁移 | 已迁移 | `apps/web/src/tools/password-strength-analyser/；/password-strength-analyser` |
| 11 | PDF Signature Checker | it-tools | `src/tools/pdf-signature-checker/` | 浏览器 | pdf-lib | — | 直接迁移 | 待迁移 | — |
| 12 | Password Generator | omni-tools | `src/pages/tools/string/password-generator/` | 浏览器 | 无 | it-tools #1(部分重叠) | 合并：保留 omni 实现 + it-tools 选项 | 已迁移 | `apps/web/src/tools/password-generator/；/password-generator` |
| 13 | String Obfuscator | it-tools | `src/tools/string-obfuscator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/string-obfuscator/；/string-obfuscator` |
| 14 | ROT13 | omni-tools | `src/pages/tools/string/rot13/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/rot13/；/rot13` |
| 15 | Security Checklist | MyIP | `frontend/components/advanced-tools/SecurityChecklist.vue` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/security-checklist/；/security-checklist` |

### 2. 格式转换 (converter)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 16 | Date-Time Converter | it-tools | `src/tools/date-time-converter/` | 浏览器 | dayjs | omni: time/* (部分) | 保留 it-tools（更完整） | 待迁移 | — |
| 17 | Integer Base Converter | it-tools | `src/tools/integer-base-converter/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/base-converter/；/base-converter` |
| 18 | Roman Numeral Converter | it-tools | `src/tools/roman-numeral-converter/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 19 | Base64 String Converter | it-tools | `src/tools/base64-string-converter/` | 浏览器 | 无 | omni: string/base64 | 保留 it-tools（双方向） | 已迁移 | `apps/web/src/tools/base64-encoder/；/base64-encoder` |
| 20 | Base64 File Converter | it-tools | `src/tools/base64-file-converter/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 21 | Color Converter | it-tools | `src/tools/color-converter/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/color-converter/；/color-converter` |
| 22 | Case Converter | it-tools | `src/tools/case-converter/` | 浏览器 | 无 | omni: string/uppercase, randomize-case | 保留 it-tools（更多 case 选项） | 已迁移 | `apps/web/src/tools/case-converter/；/case-converter` |
| 23 | Text to NATO Alphabet | it-tools | `src/tools/text-to-nato-alphabet/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 24 | Text to Binary | it-tools | `src/tools/text-to-binary/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 25 | Text to Unicode | it-tools | `src/tools/text-to-unicode/` | 浏览器 | 无 | omni: string/unicode | 合并：保留 it-tools | 待迁移 | — |
| 26 | YAML to JSON | it-tools | `src/tools/yaml-to-json-converter/` | 浏览器 | js-yaml | omni: csv/csv-to-yaml (反向) | 直接迁移 | 待迁移 | — |
| 27 | YAML to TOML | it-tools | `src/tools/yaml-to-toml/` | 浏览器 | @iarna/toml | — | 直接迁移 | 待迁移 | — |
| 28 | JSON to YAML | it-tools | `src/tools/json-to-yaml-converter/` | 浏览器 | js-yaml | — | 直接迁移 | 待迁移 | — |
| 29 | JSON to TOML | it-tools | `src/tools/json-to-toml/` | 浏览器 | @iarna/toml | — | 直接迁移 | 待迁移 | — |
| 30 | List Converter | it-tools | `src/tools/list-converter/` | 浏览器 | 无 | omni: list/* (部分) | 保留 it-tools | 待迁移 | — |
| 31 | TOML to JSON | it-tools | `src/tools/toml-to-json/` | 浏览器 | @iarna/toml | — | 直接迁移 | 待迁移 | — |
| 32 | TOML to YAML | it-tools | `src/tools/toml-to-yaml/` | 浏览器 | @iarna/toml | — | 直接迁移 | 待迁移 | — |
| 33 | XML to JSON | it-tools | `src/tools/xml-to-json/` | 浏览器 | xml-js | — | 直接迁移 | 待迁移 | — |
| 34 | JSON to XML | it-tools | `src/tools/json-to-xml/` | 浏览器 | xml-js | omni: json/json-to-xml | 保留 it-tools | 待迁移 | — |
| 35 | Markdown to HTML | it-tools | `src/tools/markdown-to-html/` | 浏览器 | markdown-it | — | 直接迁移 | 待迁移 | — |
| 36 | Byte Converter | omni-tools | `src/pages/tools/number/byte-converter/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/byte-converter/；/byte-converter` |
| 37 | Number to Words | omni-tools | `src/pages/tools/number/number-to-words/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/number-to-words/；/number-to-words` |
| 38 | Temperature Converter | it-tools | `src/tools/temperature-converter/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/temperature/；/temperature-converter` |
| 39 | Morse Code Converter | omni-tools | `src/pages/tools/string/to-morse/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/morse-code/；/morse-code` |
| 40 | Audio Converter | omni-tools | `src/pages/tools/converters/audio-converter/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 41 | Convert to JPG | omni-tools | `src/pages/tools/converters/convert-to-jpg/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/convert-to-jpg/；/convert-to-jpg` |
| 42 | Convert to WebP | omni-tools | `src/pages/tools/converters/convert-to-webp/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/convert-to-webp/；/convert-to-webp` |
| 43 | Video to GIF | omni-tools | `src/pages/tools/converters/video-to-gif/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |

### 3. Web 开发 (web)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 44 | URL Encoder/Decoder | it-tools | `src/tools/url-encoder/` | 浏览器 | 无 | omni: string/url-encode, url-decode | 保留 it-tools（双方向一体） | 已迁移 | `apps/web/src/tools/url-encoder/；/url-encoder` |
| 45 | HTML Entities | it-tools | `src/tools/html-entities/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/html-entities/；/html-entities` |
| 46 | URL Parser | it-tools | `src/tools/url-parser/` | 浏览器 | 无 | omni: string/url-editor (部分) | 保留 it-tools | 已迁移 | `apps/web/src/tools/url-parser/；/url-parser` |
| 47 | Device Information | it-tools | `src/tools/device-information/` | 浏览器 | 无 | MyIP: browserinfo (部分) | 合并：it-tools 为主 + MyIP 补充 | 已迁移 | `apps/web/src/tools/browser-fingerprint/；/browser-fingerprint（含 #60 合并）` |
| 48 | Basic Auth Generator | it-tools | `src/tools/basic-auth-generator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 49 | Meta Tag Generator | it-tools | `src/tools/meta-tag-generator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 50 | OTP Generator & Validator | it-tools | `src/tools/otp-code-generator-and-validator/` | 浏览器 | otplib | — | 直接迁移 | 待迁移 | — |
| 51 | MIME Types | it-tools | `src/tools/mime-types/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 52 | JWT Parser | it-tools | `src/tools/jwt-parser/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/jwt-parser/；/jwt-parser` |
| 53 | Keycode Info | it-tools | `src/tools/keycode-info/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 54 | Slugify String | it-tools | `src/tools/slugify-string/` | 浏览器 | 无 | omni: string/slug-generator | 保留 it-tools | 已迁移 | `apps/web/src/tools/slugify/；/slugify` |
| 55 | HTML WYSIWYG Editor | it-tools | `src/tools/html-wysiwyg-editor/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 56 | User-Agent Parser | it-tools | `src/tools/user-agent-parser/` | 浏览器 | ua-parser-js | — | 直接迁移 | 待迁移 | — |
| 57 | HTTP Status Codes | it-tools | `src/tools/http-status-codes/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/http-status/；/http-status-codes` |
| 58 | JSON Diff | it-tools | `src/tools/json-diff/` | 浏览器 | 无 | omni: json/json-comparison | 保留 it-tools | 待迁移 | — |
| 59 | Safelink Decoder | it-tools | `src/tools/safelink-decoder/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 60 | Browser Info | MyIP | `frontend/components/advanced-tools/BrowserInfo.vue` | 浏览器 | 无 | it-tools #47 (部分) | 合并到 Device Information | 已合并 → browser-fingerprint（#47） | 并入 `apps/web/src/tools/browser-fingerprint/；/browser-fingerprint` |

### 4. 开发者工具 (developer)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 61 | Git Memo | it-tools | `src/tools/git-memo/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 62 | Random Port Generator | it-tools | `src/tools/random-port-generator/` | 浏览器 | 无 | omni: number/random-port-generator | 保留 it-tools | 待迁移 | — |
| 63 | Crontab Generator | it-tools | `src/tools/crontab-generator/` | 浏览器 | 无 | omni: time/crontab-guru | 合并：保留 it-tools + omni 预览 | 待迁移 | — |
| 64 | JSON Viewer | it-tools | `src/tools/json-viewer/` | 浏览器 | 无 | omni: json/prettify (部分) | 保留 it-tools（树形视图） | 待迁移 | 树形查看器未实现；JSON 美化暂由附加工具 `/json-prettify` 覆盖（见备注 7） |
| 65 | JSON Minify | it-tools | `src/tools/json-minify/` | 浏览器 | 无 | omni: json/minify | 保留 it-tools | 待迁移 | — |
| 66 | JSON to CSV | it-tools | `src/tools/json-to-csv/` | 浏览器 | papaparse | omni: json/json-to-csv | 保留 it-tools | 待迁移 | — |
| 67 | SQL Prettify | it-tools | `src/tools/sql-prettify/` | 浏览器 | sql-formatter | — | 直接迁移 | 待迁移 | — |
| 68 | Chmod Calculator | it-tools | `src/tools/chmod-calculator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 69 | Docker Run to Compose | it-tools | `src/tools/docker-run-to-docker-compose-converter/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 70 | XML Formatter | it-tools | `src/tools/xml-formatter/` | 浏览器 | 无 | omni: xml/xml-beautifier | 保留 it-tools | 待迁移 | — |
| 71 | YAML Viewer | it-tools | `src/tools/yaml-viewer/` | 浏览器 | js-yaml | — | 直接迁移 | 待迁移 | — |
| 72 | Email Normalizer | it-tools | `src/tools/email-normalizer/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 73 | Regex Tester | it-tools | `src/tools/regex-tester/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 74 | Regex Memo | it-tools | `src/tools/regex-memo/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 75 | JSON Escape | omni-tools | `src/pages/tools/json/escape-json/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/json-escape/；/json-escape` |
| 76 | JSON Stringify | omni-tools | `src/pages/tools/json/stringify/` | 浏览器 | 无 | — | 直接迁移 | 已合并 | `apps/web/src/tools/json-prettify/；/json-prettify（旧 /json-stringify 重定向）` |
| 77 | JSON Sort | omni-tools | `src/pages/tools/json/sort/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/json-sort/；/json-sort` |
| 78 | JSON Validate | omni-tools | `src/pages/tools/json/validateJson/` | 浏览器 | 无 | it-tools #64(部分) | 合并到 JSON Viewer | 已迁移（独立实现） | `apps/web/src/tools/json-validate/；/json-validate（未并入 #64，单独成工具）` |
| 79 | XML Validator | omni-tools | `src/pages/tools/xml/xml-validator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/xml-validator/；/xml-validator` |
| 80 | Crontab Guru | omni-tools | `src/pages/tools/time/crontab-guru/` | 浏览器 | 无 | it-tools #63 | 合并到 Crontab Generator | 待迁移 | 待随 #63 Crontab Generator 一并并入 |
| 81 | Docker Compose to 1Panel | 1Panel-Tools | `src/tools/docker-compose-to-1panel-appstore/` | 浏览器 | 无 | — | 直接迁移（独有） | 待迁移 | — |

### 5. 网络工具 (network)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 82 | IPv4 Subnet Calculator | it-tools | `src/tools/ipv4-subnet-calculator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 83 | IPv4 Address Converter | it-tools | `src/tools/ipv4-address-converter/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 84 | IPv4 Range Expander | it-tools | `src/tools/ipv4-range-expander/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 85 | MAC Address Lookup | it-tools | `src/tools/mac-address-lookup/` | 浏览器 | 无 | MyIP: macchecker | 保留 it-tools | 已迁移 | `apps/web/src/tools/mac-lookup/；/mac-lookup` |
| 86 | MAC Address Generator | it-tools | `src/tools/mac-address-generator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 87 | IPv6 ULA Generator | it-tools | `src/tools/ipv6-ula-generator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 88 | MAC Checker | MyIP | `frontend/components/advanced-tools/MacChecker.vue` | 浏览器 | 无 | it-tools #85 | 合并到 MAC Address Lookup | 已合并 → mac-lookup（#85） | 并入 `apps/web/src/tools/mac-lookup/；/mac-lookup` |

### 6. 文本处理 (text)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 89 | Lorem Ipsum Generator | it-tools | `src/tools/lorem-ipsum-generator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/lorem-ipsum/；/lorem-ipsum-generator` |
| 90 | Text Statistics | it-tools | `src/tools/text-statistics/` | 浏览器 | 无 | omni: string/statistic | 保留 it-tools | 已迁移 | `apps/web/src/tools/text-statistics/；/text-statistics` |
| 91 | Emoji Picker | it-tools | `src/tools/emoji-picker/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/emoji-picker/；/emoji-picker` |
| 92 | Text Diff | it-tools | `src/tools/text-diff/` | 浏览器 | 无 | omni: string/text-compare | 保留 it-tools | 已迁移 | `apps/web/src/tools/text-diff/；/text-diff` |
| 93 | Numeronym Generator | it-tools | `src/tools/numeronym-generator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 94 | ASCII Text Drawer | it-tools | `src/tools/ascii-text-drawer/` | 浏览器 | figlet | — | 直接迁移 | 待迁移 | — |
| 95 | Text Censor | omni-tools | `src/pages/tools/string/censor/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/text-censor/；/text-censor` |
| 96 | Create Palindrome | omni-tools | `src/pages/tools/string/create-palindrome/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/create-palindrome/；/create-palindrome` |
| 97 | Email Extractor | omni-tools | `src/pages/tools/string/email-extractor/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/email-extractor/；/email-extractor` |
| 98 | Extract Substring | omni-tools | `src/pages/tools/string/extract-substring/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/extract-substring/；/extract-substring` |
| 99 | Hidden Character Detector | omni-tools | `src/pages/tools/string/hidden-character-detector/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/hidden-char-detector/；/hidden-char-detector` |
| 100 | Text Join | omni-tools | `src/pages/tools/string/join/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/text-join/；/text-join` |
| 101 | Palindrome Checker | omni-tools | `src/pages/tools/string/palindrome/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/palindrome-checker/；/palindrome-checker` |
| 102 | Quote Generator | omni-tools | `src/pages/tools/string/quote/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/quote-generator/；/quote-generator` |
| 103 | Remove Duplicate Lines | omni-tools | `src/pages/tools/string/remove-duplicate-lines/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/remove-duplicate-lines/；/remove-duplicate-lines` |
| 104 | Text Repeat | omni-tools | `src/pages/tools/string/repeat/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/text-repeat/；/text-repeat` |
| 105 | Text Reverse | omni-tools | `src/pages/tools/string/reverse/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/text-reverse/；/text-reverse` |
| 106 | Text Rotate | omni-tools | `src/pages/tools/string/rotate/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/text-rotate/；/text-rotate` |
| 107 | Text Split | omni-tools | `src/pages/tools/string/split/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/text-split/；/text-split` |
| 108 | Text Replacer | omni-tools | `src/pages/tools/string/text-replacer/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/text-replacer/；/text-replacer` |
| 109 | Text Truncate | omni-tools | `src/pages/tools/string/truncate/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/text-truncate/；/text-truncate` |
| 110 | URL Editor | omni-tools | `src/pages/tools/string/url-editor/` | 浏览器 | 无 | it-tools #46(部分) | 合并到 URL Parser | 待迁移 | URL 编辑能力未实现；`/url-parser` 目前仅解析展示 |

### 7. 数据处理 (data)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 111 | Phone Parser & Formatter | it-tools | `src/tools/phone-parser-and-formatter/` | 浏览器 | libphonenumber-js | — | 直接迁移 | 待迁移 | — |
| 112 | IBAN Validator & Parser | it-tools | `src/tools/iban-validator-and-parser/` | 浏览器 | iban | — | 直接迁移 | 待迁移 | — |
| 113 | CSV to JSON | omni-tools | `src/pages/tools/csv/csv-to-json/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-to-json/；/csv-to-json` |
| 114 | CSV to TSV | omni-tools | `src/pages/tools/csv/csv-to-tsv/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-to-tsv/；/csv-to-tsv` |
| 115 | CSV to XML | omni-tools | `src/pages/tools/csv/csv-to-xml/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-to-xml/；/csv-to-xml` |
| 116 | CSV to YAML | omni-tools | `src/pages/tools/csv/csv-to-yaml/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-to-yaml/；/csv-to-yaml` |
| 117 | TSV to JSON | omni-tools | `src/pages/tools/csv/tsv-to-json/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/tsv-to-json/；/tsv-to-json` |
| 118 | Change CSV Separator | omni-tools | `src/pages/tools/csv/change-csv-separator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-change-separator/；/csv-change-separator` |
| 119 | CSV Rows to Columns | omni-tools | `src/pages/tools/csv/csv-rows-to-columns/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-rows-to-columns/；/csv-rows-to-columns` |
| 120 | Find Incomplete CSV Records | omni-tools | `src/pages/tools/csv/find-incomplete-csv-records/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-find-incomplete/；/csv-find-incomplete` |
| 121 | Insert CSV Columns | omni-tools | `src/pages/tools/csv/insert-csv-columns/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-insert-columns/；/csv-insert-columns` |
| 122 | Swap CSV Columns | omni-tools | `src/pages/tools/csv/swap-csv-columns/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/csv-swap-columns/；/csv-swap-columns` |
| 123 | Transpose CSV | omni-tools | `src/pages/tools/csv/transpose-csv/` | 浏览器 | 无 | — | 直接迁移 | 已合并 | `apps/web/src/tools/csv-rows-to-columns/；/csv-rows-to-columns（旧 /csv-transpose 重定向）` |
| 124 | List Duplicate | omni-tools | `src/pages/tools/list/duplicate/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-duplicate/；/list-duplicate` |
| 125 | List Find Most Popular | omni-tools | `src/pages/tools/list/find-most-popular/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-find-popular/；/list-find-popular` |
| 126 | List Find Unique | omni-tools | `src/pages/tools/list/find-unique/` | 浏览器 | 无 | — | 直接迁移 | 已合并 | `apps/web/src/tools/remove-duplicate-lines/；/remove-duplicate-lines（旧 /list-find-unique 重定向）` |
| 127 | List Group | omni-tools | `src/pages/tools/list/group/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-group/；/list-group` |
| 128 | List Reverse | omni-tools | `src/pages/tools/list/reverse/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-reverse/；/list-reverse` |
| 129 | List Rotate | omni-tools | `src/pages/tools/list/rotate/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-rotate/；/list-rotate` |
| 130 | List Shuffle | omni-tools | `src/pages/tools/list/shuffle/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-shuffle/；/list-shuffle` |
| 131 | List Sort | omni-tools | `src/pages/tools/list/sort/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-sort/；/list-sort` |
| 132 | List Truncate | omni-tools | `src/pages/tools/list/truncate/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-truncate/；/list-truncate` |
| 133 | List Unwrap | omni-tools | `src/pages/tools/list/unwrap/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-unwrap/；/list-unwrap` |
| 134 | List Wrap | omni-tools | `src/pages/tools/list/wrap/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/list-wrap/；/list-wrap` |

### 8. 图片处理 (image)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 135 | QR Code Generator | it-tools | `src/tools/qr-code-generator/` | 浏览器 | qrcode | omni: image/generic/qr-code | 保留 it-tools | 待迁移 | — |
| 136 | WiFi QR Code Generator | it-tools | `src/tools/wifi-qr-code-generator/` | 浏览器 | qrcode | — | 直接迁移 | 待迁移 | — |
| 137 | SVG Placeholder Generator | it-tools | `src/tools/svg-placeholder-generator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 138 | Camera Recorder | it-tools | `src/tools/camera-recorder/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 139 | Image Change Colors | omni-tools | `src/pages/tools/image/generic/change-colors/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 140 | Image Change Opacity | omni-tools | `src/pages/tools/image/generic/change-opacity/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/image-change-opacity/；/image-change-opacity` |
| 141 | Image Compress | omni-tools | `src/pages/tools/image/generic/compress/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/image-compress/；/image-compress` |
| 142 | Image Create Transparent | omni-tools | `src/pages/tools/image/generic/create-transparent/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 143 | Image Crop | omni-tools | `src/pages/tools/image/generic/crop/` | 浏览器 | react-konva | — | 直接迁移 | 待迁移 | — |
| 144 | Image Editor | omni-tools | `src/pages/tools/image/generic/editor/` | 浏览器 | react-konva | — | 直接迁移 | 待迁移 | — |
| 145 | Image to Text (OCR) | omni-tools | `src/pages/tools/image/generic/image-to-text/` | 浏览器 | Tesseract.js | — | 直接迁移 | 待迁移 | — |
| 146 | Image Remove Background | omni-tools | `src/pages/tools/image/generic/remove-background/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 147 | Image Resize | omni-tools | `src/pages/tools/image/generic/resize/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/image-resize/；/image-resize` |
| 148 | Image Rotate | omni-tools | `src/pages/tools/image/generic/rotate/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/image-rotate/；/image-rotate` |
| 149 | Image Split | omni-tools | `src/pages/tools/image/generic/split/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 150 | Image Watermark | omni-tools | `src/pages/tools/image/generic/watermark/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/image-watermark/；/image-watermark` |
| 151 | Compress PNG | omni-tools | `src/pages/tools/image/png/compress-png/` | 浏览器 | 无 | omni: image/generic/compress | 合并到 Image Compress | 已合并 → image-compress（#141） | 并入 `apps/web/src/tools/image-compress/；/image-compress`（支持 PNG/JPEG） |
| 152 | Convert JPG to PNG | omni-tools | `src/pages/tools/image/png/convert-jgp-to-png/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |

### 9. 视频处理 (video)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 153 | Video Add Audio | omni-tools | `src/pages/tools/video/add-audio/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 154 | Video Change Speed | omni-tools | `src/pages/tools/video/change-speed/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 155 | Video Compress | omni-tools | `src/pages/tools/video/compress/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 156 | Video Crop | omni-tools | `src/pages/tools/video/crop-video/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 157 | Video Flip | omni-tools | `src/pages/tools/video/flip/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 158 | Video Loop | omni-tools | `src/pages/tools/video/loop/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 159 | Video Merge | omni-tools | `src/pages/tools/video/merge-video/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 160 | Video Resize | omni-tools | `src/pages/tools/video/resize/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 161 | Video Rotate | omni-tools | `src/pages/tools/video/rotate/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 162 | Video Trim | omni-tools | `src/pages/tools/video/trim/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 163 | GIF Change Speed | omni-tools | `src/pages/tools/video/gif/change-speed/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 164 | Images to GIF | omni-tools | `src/pages/tools/video/gif/images-to-gif/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |

### 10. 音频处理 (audio)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 165 | Audio Change Speed | omni-tools | `src/pages/tools/audio/change-speed/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 166 | Audio Extract | omni-tools | `src/pages/tools/audio/extract-audio/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 167 | Audio Loop | omni-tools | `src/pages/tools/audio/loop-audio/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 168 | Audio Merge | omni-tools | `src/pages/tools/audio/merge-audio/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |
| 169 | Audio Trim | omni-tools | `src/pages/tools/audio/trim/` | 浏览器 | FFmpeg.wasm | — | 直接迁移 | 待迁移 | — |

### 11. PDF 处理 (pdf)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 170 | Compress PDF | omni-tools | `src/pages/tools/pdf/compress-pdf/` | 浏览器 | pdf-lib | — | 直接迁移 | 已迁移 | `apps/web/src/tools/compress-pdf/；/compress-pdf` |
| 171 | Convert to PDF | omni-tools | `src/pages/tools/pdf/convert-to-pdf/` | 浏览器 | jsPDF | — | 直接迁移 | 已迁移 | `apps/web/src/tools/convert-to-pdf/；/convert-to-pdf` |
| 172 | PDF Editor | omni-tools | `src/pages/tools/pdf/editor/` | 浏览器 | pdf-lib | — | 直接迁移 | 待迁移 | — |
| 173 | PDF Extract Images | omni-tools | `src/pages/tools/pdf/extract-images-from-pdf/` | 浏览器 | pdfjs-dist | — | 直接迁移 | 待迁移 | — |
| 174 | PDF Merge | omni-tools | `src/pages/tools/pdf/merge-pdf/` | 浏览器 | pdf-lib | — | 直接迁移 | 已迁移 | `apps/web/src/tools/pdf-merge/；/pdf-merge` |
| 175 | PDF to EPUB | omni-tools | `src/pages/tools/pdf/pdf-to-epub/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 176 | PDF to PNG | omni-tools | `src/pages/tools/pdf/pdf-to-png/` | 浏览器 | pdfjs-dist | — | 直接迁移 | 待迁移 | — |
| 177 | PDF Protect | omni-tools | `src/pages/tools/pdf/protect-pdf/` | 浏览器 | pdf-lib | — | 直接迁移 | 已迁移 | `apps/web/src/tools/pdf-protect/；/pdf-protect` |
| 178 | PDF Rotate | omni-tools | `src/pages/tools/pdf/rotate-pdf/` | 浏览器 | pdf-lib | — | 直接迁移 | 已迁移 | `apps/web/src/tools/pdf-rotate/；/pdf-rotate` |
| 179 | PDF Split | omni-tools | `src/pages/tools/pdf/split-pdf/` | 浏览器 | pdf-lib | — | 直接迁移 | 已迁移 | `apps/web/src/tools/pdf-split/；/pdf-split` |

### 12. 数学计算 (math)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 180 | Math Evaluator | it-tools | `src/tools/math-evaluator/` | 浏览器 | mathjs | — | 直接迁移 | 已合并 | `apps/web/src/tools/generic-calculator/；/generic-calculator（旧 /math-evaluator 重定向）` |
| 181 | ETA Calculator | it-tools | `src/tools/eta-calculator/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 182 | Percentage Calculator | it-tools | `src/tools/percentage-calculator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/percentage-calc/；/percentage-calculator` |
| 183 | Arithmetic Sequence | omni-tools | `src/pages/tools/number/arithmetic-sequence/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/arithmetic-sequence/；/arithmetic-sequence` |
| 184 | Generic Calculator | omni-tools | `src/pages/tools/number/generic-calc/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/generic-calculator/；/generic-calculator` |
| 185 | Random Number Generator | omni-tools | `src/pages/tools/number/random-number-generator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/random-number-generator/；/random-number-generator` |
| 186 | Number Sum | omni-tools | `src/pages/tools/number/sum/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/number-sum/；/number-sum` |
| 187 | Number Generator | omni-tools | `src/pages/tools/number/generate/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/number-generator/；/number-generator` |

### 13. 度量与时间 (measurement)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 188 | Chronometer | it-tools | `src/tools/chronometer/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/chronometer/；/chronometer` |
| 189 | Benchmark Builder | it-tools | `src/tools/benchmark-builder/` | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 190 | Check Leap Years | omni-tools | `src/pages/tools/time/check-leap-years/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/check-leap-years/；/check-leap-years` |
| 191 | Convert Days to Hours | omni-tools | `src/pages/tools/time/convert-days-to-hours/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/days-to-hours/；/days-to-hours` |
| 192 | Convert Hours to Days | omni-tools | `src/pages/tools/time/convert-hours-to-days/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/hours-to-days/；/hours-to-days` |
| 193 | Convert Seconds to Time | omni-tools | `src/pages/tools/time/convert-seconds-to-time/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/seconds-to-time/；/seconds-to-time` |
| 194 | Convert Time to Decimal | omni-tools | `src/pages/tools/time/convert-time-to-decimal/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/time-to-decimal/；/time-to-decimal` |
| 195 | Convert Time to Seconds | omni-tools | `src/pages/tools/time/convert-time-to-seconds/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/time-to-seconds/；/time-to-seconds` |
| 196 | Convert Unix to Date | omni-tools | `src/pages/tools/time/convert-unix-to-date/` | 浏览器 | 无 | it-tools #16(部分) | 合并到 Date-Time Converter | 待迁移 | 待随 #16 Date-Time Converter 一并并入 |
| 197 | Date Weekday Calculator | omni-tools | `src/pages/tools/time/date-weekday-calculator/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/date-weekday-calculator/；/date-weekday-calculator` |
| 198 | Discord Timestamp | omni-tools | `src/pages/tools/time/discord-timestamp/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/discord-timestamp/；/discord-timestamp` |
| 199 | Time Between Dates | omni-tools | `src/pages/tools/time/time-between-dates/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/time-between-dates/；/time-between-dates` |
| 200 | Truncate Clock Time | omni-tools | `src/pages/tools/time/truncate-clock-time/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/truncate-clock-time/；/truncate-clock-time` |

### 14. 生成器 (generator)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 201 | QR Code Generator | it-tools | `src/tools/qr-code-generator/` | 浏览器 | qrcode | omni: image/generic/qr-code | 见 #135 | 待迁移 | — |
| 202 | WiFi QR Code Generator | it-tools | `src/tools/wifi-qr-code-generator/` | 浏览器 | qrcode | — | 见 #136 | 待迁移 | — |
| 203 | SVG Placeholder Generator | it-tools | `src/tools/svg-placeholder-generator/` | 浏览器 | 无 | — | 见 #137 | 待迁移 | — |
| 204 | Lorem Ipsum Generator | it-tools | `src/tools/lorem-ipsum-generator/` | 浏览器 | 无 | — | 见 #89 | 已迁移 | 同 #89（`apps/web/src/tools/lorem-ipsum/；/lorem-ipsum-generator`） |
| 205 | UUID Generator | it-tools | `src/tools/uuid-generator/` | 浏览器 | 无 | — | 见 #4 | 已迁移 | 同 #4（`apps/web/src/tools/uuid-generator/；/uuid-generator`） |
| 206 | ULID Generator | it-tools | `src/tools/ulid-generator/` | 浏览器 | ulid | — | 见 #5 | 已迁移 | 同 #5（`apps/web/src/tools/ulid-generator/；/ulid-generator`） |
| 207 | Token Generator | it-tools | `src/tools/token-generator/` | 浏览器 | 无 | — | 见 #1 | 已合并 | 同 #1（`apps/web/src/tools/password-generator/；/password-generator（旧 /token-generator 重定向）`） |
| 208 | Password Generator | omni-tools | `src/pages/tools/string/password-generator/` | 浏览器 | 无 | — | 见 #12 | 已迁移 | 同 #12（`apps/web/src/tools/password-generator/；/password-generator`） |
| 209 | Random Number Generator | omni-tools | `src/pages/tools/number/random-number-generator/` | 浏览器 | 无 | — | 见 #185 | 已迁移 | 同 #185（`apps/web/src/tools/random-number-generator/；/random-number-generator`） |
| 210 | Random Port Generator | it-tools | `src/tools/random-port-generator/` | 浏览器 | 无 | — | 见 #62 | 待迁移 | — |
| 211 | MAC Address Generator | it-tools | `src/tools/mac-address-generator/` | 浏览器 | 无 | — | 见 #86 | 待迁移 | — |
| 212 | BIP39 Generator | it-tools | `src/tools/bip39-generator/` | 浏览器 | bip39 | — | 见 #7 | 已迁移 | 同 #7（`apps/web/src/tools/bip39-generator/；/bip39-generator`） |

### 15. 网络测试 (network-test)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 213 | IP Info / Detection | MyIP | `frontend/components/IpInfos.vue` | 混合 | ipapi.co 等 | — | 直接迁移（核心功能） | 已迁移 | `apps/web/src/tools/ip-info/；/ip-info` |
| 214 | Connectivity Check | MyIP | `frontend/components/ConnectivityTest.vue` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/connectivity-check/；/connectivity-check` |
| 215 | WebRTC Detection | MyIP | `frontend/components/WebRtcTest.vue` | 浏览器 | STUN | — | 直接迁移 | 已迁移 | `apps/web/src/tools/webrtc-detection/；/webrtc-detection` |
| 216 | DNS Leak Test | MyIP | `frontend/components/DnsLeaksTest.vue` | 后端 | 自定义 API | — | 直接迁移（需后端） | 待迁移 | — |
| 217 | Speed Test | MyIP | `frontend/components/SpeedTest.vue` | 浏览器 | speedtest 库 | — | 直接迁移 | 已迁移 | `apps/web/src/tools/speed-test/；/speed-test` |
| 218 | Ping Test | MyIP | `frontend/components/advanced-tools/` (Globalping) | 混合 | Globalping API | — | 直接迁移 | 待迁移 | — |
| 219 | MTR Test | MyIP | `frontend/components/advanced-tools/MtrTest.vue` | 混合 | Globalping API | — | 直接迁移 | 待迁移 | — |
| 220 | Global Latency Test | MyIP | `frontend/components/advanced-tools/GlobalLatencyTest.vue` | 混合 | Globalping API | — | 直接迁移 | 待迁移 | — |
| 221 | Rule Test | MyIP | `frontend/components/advanced-tools/RuleTest.vue` | 后端 | 自定义 API | — | 直接迁移（需后端） | 待迁移 | — |
| 222 | DNS Resolver | MyIP | `frontend/components/advanced-tools/DnsResolver.vue` | 后端 | DoH/自定义 | — | 直接迁移（需后端） | 已迁移 | `apps/web/src/tools/dns-resolver/；/dns-resolver` |
| 223 | Censorship Check | MyIP | `frontend/components/advanced-tools/CensorshipCheck.vue` | 混合 | OONI API | — | 直接迁移 | 待迁移 | — |
| 224 | Whois Lookup | MyIP | `frontend/components/advanced-tools/Whois.vue` | 后端 | whois 服务 | — | 直接迁移（需后端） | 已迁移 | `apps/web/src/tools/whois-lookup/；/whois-lookup` |
| 225 | Service Status | MyIP | `frontend/components/advanced-tools/ServiceStatus.vue` | 后端 | 自定义 API | — | 直接迁移（需后端） | 已迁移 | `apps/web/src/tools/service-status/；/service-status` |

### 16. 平台功能 (platform)

| # | 工具名称 | 来源 | 源路径 | 运行位置 | 外部依赖 | 重复关系 | 合并方案 | 迁移状态 | 验证情况 |
|---|---------|------|--------|---------|---------|---------|---------|---------|---------|
| 226 | Share Report | MyIP | `frontend/components/report/` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/components/ShareButton.vue`、`apps/web/src/pages/ReportPage.vue`；服务端 `/api/reports` |
| 227 | Preferences/Settings | MyIP | `frontend/components/User.vue` | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/pages/SettingsPage.vue`、`apps/web/src/stores/preferences.store.ts`；服务端 `/api/user` |
| 228 | Info Masking | MyIP | `frontend/components/` (全局) | 浏览器 | 无 | — | 直接迁移 | 待迁移 | — |
| 229 | Screenshot Share | MyIP | `frontend/components/` | 浏览器 | html2canvas | — | 直接迁移 | 待迁移 | — |
| 230 | Dark Mode | MyIP | `frontend/components/` (全局) | 浏览器 | 无 | — | 直接迁移 | 已迁移 | `apps/web/src/components/ThemeSwitcher.vue`、`apps/web/src/stores/preferences.store.ts`（light/dark/system） |

---

## 重复矩阵

以下为所有跨项目重复/重叠的工具及合并决策：

| 组 | 功能 | it-tools | omni-tools | MyIP | 合并决策 | 理由 |
|----|------|----------|-----------|------|---------|------|
| R01 | Base64 编解码 | base64-string-converter | string/base64 | — | **保留 it-tools** | 双方向一体，UI 更完整 |
| R02 | BCrypt | bcrypt | string/bcrypt | — | **保留 it-tools** | 含 hash 对比验证功能 |
| R03 | 大小写转换 | case-converter | string/uppercase, randomize-case | — | **保留 it-tools** | 支持更多 case 选项 |
| R04 | Unicode 转换 | text-to-unicode | string/unicode | — | **保留 it-tools** | 功能一致，it-tools UI 更好 |
| R05 | URL 编解码 | url-encoder | string/url-encode, url-decode | — | **保留 it-tools** | 双方向一体 |
| R06 | URL 解析/编辑 | url-parser | string/url-editor | — | **保留 it-tools** | 解析更完整 |
| R07 | Slug 生成 | slugify-string | string/slug-generator | — | **保留 it-tools** | 功能一致 |
| R08 | JSON 对比 | json-diff | json/json-comparison | — | **保留 it-tools** | 差异可视化更好 |
| R09 | JSON 压缩 | json-minify | json/minify | — | **保留 it-tools** | 功能一致 |
| R10 | JSON to CSV | json-to-csv | json/json-to-csv | — | **保留 it-tools** | papaparse 更成熟 |
| R11 | JSON to XML | json-to-xml | json/json-to-xml | — | **保留 it-tools** | 功能一致 |
| R12 | JSON 美化/查看 | json-viewer | json/prettify, validateJson | — | **合并至 json-prettify** | 当前实现统一文本格式化、1–8 空格或制表符；旧网址重定向（phase34） |
| R13 | XML 格式化 | xml-formatter | xml/xml-beautifier | — | **保留 it-tools** | 功能一致 |
| R14 | Crontab | crontab-generator | time/crontab-guru | — | **合并：it-tools + omni 预览** | 互补功能 |
| R15 | 随机端口 | random-port-generator | number/random-port-generator | — | **保留 it-tools** | 功能一致 |
| R16 | 文本统计 | text-statistics | string/statistic | — | **保留 it-tools** | 指标更全 |
| R17 | 文本对比 | text-diff | string/text-compare | — | **保留 it-tools** | 差异可视化更好 |
| R18 | QR 码 | qr-code-generator | image/generic/qr-code | — | **保留 it-tools** | 功能一致 |
| R19 | 密码生成 | token-generator(部分) | string/password-generator | — | **合并至 password-generator** | 密码/令牌预设、排除字符、1–512 长度、浏览器 crypto（phase34） |
| R20 | 图片压缩 | — | image/generic/compress, image/png/compress-png | — | **合并为统一 Image Compress** | PNG 压缩是子集 |
| R21 | 时间转换 | date-time-converter | time/convert-unix-to-date 等 | — | **保留 it-tools + 合并 omni 子功能** | it-tools 更完整 |
| R22 | 设备信息 | device-information | — | BrowserInfo.vue | **合并：it-tools 为主 + MyIP 补充** | 互补 |
| R23 | MAC 地址 | mac-address-lookup | — | MacChecker.vue | **保留 it-tools** | 功能一致 |
| R24 | 列表转换 | list-converter | list/* (11 个) | — | **两者都保留** | it-tools 是格式转换，omni 是列表操作 |
| R25 | 密码强度 | password-strength-analyser | — | SecurityChecklist.vue(部分) | **保留 it-tools** | zxcvbn 更专业 |

---

## 不可迁移工具

| # | 工具名称 | 来源 | 路径 | 迁移状态 | 排除理由 |
|---|---------|------|------|---------|---------|
| X01 | Invisibility Test | MyIP | `frontend/components/advanced-tools/InvisibilityTest.vue` | 排除 | 依赖 MyIP 私有 API，无法迁移 |
| X02 | Enhanced DNS Leak Test | MyIP | `frontend/components/advanced-tools/EnhancedDnsLeakTest.vue` | 排除 | 依赖 MyIP 私有 API，无法迁移 |
| X03 | Persona Check | MyIP | `frontend/components/advanced-tools/PersonaCheck.vue` | 排除 | 依赖 MyIP 私有 API，无法迁移 |

---

## 备注

1. **omni-tools 独有发现**：用户列表中未提及但确认存在的工具：
   - `string/bcrypt` — BCrypt 哈希生成（与 it-tools 重复，见 R02）
   - `audio/loop-audio` — 音频循环（用户列表中 audio 只有 4 个，实际有 5 个）

2. **MyIP 后端依赖**：MyIP 有 7 个工具需要后端支持（DNS Leak Test、Rule Test、DNS Resolver、Whois、Service Status、IP Info、Censorship Check），迁移时需评估是否保留后端或改用纯浏览器方案。

3. **omni-tools 特殊依赖**：图片编辑/裁剪依赖 react-konva，视频/音频处理依赖 FFmpeg.wasm，OCR 依赖 Tesseract.js。这些库为 React 生态，迁移到 Vue 时需寻找替代方案或使用框架无关版本。

4. **it-tools 路径注意**：`yaml-to-json-converter` 和 `json-to-yaml-converter` 的目录名与 import 名不一致（import 为 `yaml-to-json` / `json-to-yaml`），迁移时注意路径映射。

5. **计数说明**：
   - it-tools：86 个工具（已验证 `src/tools/index.ts`）
   - 1Panel-Tools：1 个独有工具
   - omni-tools：~126 个工具目录（含子分类），去重后 ~120 个独立工具
   - MyIP：~20 个工具/功能（含 3 个不可迁移）
   - 去重后净工具数：~190 个

6. **迁移批次与后续工作**：
   - 已完成批次：80baa24（crypto）、0c6271b（converter/web/math/text）、3b28f31（text/measurement）、cc01408（omni 轻量工具）、b2afb0f（image/pdf）、0ff8b3b（MyIP 网络，10 个）
   - 后续批次：YAML/TOML/XML 转换、二维码、视频/音频、网络测试（Ping/MTR/Globalping 等）

7. **附加实现（不对应原始清单条目，不计入迁移统计）**：
   - `hello-world` — 注册系统示例工具
   - `json-prettify` — JSON 美化（骨架期示例工具，本批完善）；#64 JSON Viewer 的树形查看仍未实现
   - `image-flip` — 图片翻转（媒体批次附带的补充工具）

8. **合并/交叉引用说明**：
   - 已完成的合并：#60 → browser-fingerprint（#47）、#88 → mac-lookup（#85）、#151 → image-compress（#141）
   - #78 JSON Validate 以独立工具 `/json-validate` 实现，未按原方案并入 #64 JSON Viewer
   - 合并目标尚未实现的条目保持“待迁移”并注明并入目标：#80 → #63 Crontab Generator、#110 → #46 URL Parser、#196 → #16 Date-Time Converter