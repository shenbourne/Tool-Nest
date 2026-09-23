# M1: Lightweight Browser Tools Migration Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Migrate 29 lightweight browser-only tools from it-tools/omni-tools/MyIP into ToolNest. No external dependencies required — all tools use pure browser logic.

**Architecture:** Each tool follows the established pattern: `index.ts` (defineTool registration) + Vue component (ToolLayout + Naive UI) + i18n entries (zh + en). Registry auto-discovers via glob — no manual registration needed.

**Spec:** `docs/superpowers/specs/2026-09-18-full-migration-design.md` § M1

**Upstream references:**
- it-tools: `template/it-tools/src/tools/<tool-name>/`
- omni-tools: `template/omni-tools/src/tools/<tool-name>/`

## Global Constraints

- All tools use `defineTool()` from `@toolnest/shared` with i18n keys for name/description
- Components wrap content in `<ToolLayout :tool="tool">` and use Naive UI primitives (`NCard`, `NInput`, `NButton`, `NInputNumber`, `NSelect`, `NSpace`, `NGrid`, `NDataTable`, etc.)
- Business logic extracted into `*.service.ts` files when non-trivial (pure functions, testable)
- i18n entries added to BOTH `apps/web/src/locales/en.json` AND `apps/web/src/locales/zh.json`
- `createdAt: '2026-09-18'` for all M1 tools
- `runtimeLocation: 'browser'` for all M1 tools (default, can omit)
- Tags from the `ToolTag` union in `packages/shared/src/tool-types.ts`
- Categories from `packages/shared/src/categories.ts`: converter, web, developer, network, text, image, math, measurement, platform
- No `icon` field needed (not used in ToolNest's ToolLayout)
- Copy-to-clipboard: use `navigator.clipboard.writeText()` directly (no `useCopy` composable in ToolNest)

## Tool List (29 tools)

| # | Inventory | Tool | Source | Category |
|---|-----------|------|--------|----------|
| 18 | roman-numeral-converter | Roman Numeral Converter | it-tools | converter |
| 23 | text-to-nato-alphabet | Text to NATO Alphabet | it-tools | converter |
| 24 | text-to-binary | Text to Binary | it-tools | converter |
| 48 | basic-auth-generator | Basic Auth Generator | it-tools | web |
| 49 | meta-tag-generator | Meta Tag Generator | it-tools | web |
| 51 | mime-types | MIME Types | it-tools | web |
| 53 | keycode-info | Keycode Info | it-tools | web |
| 59 | safelink-decoder | Safelink Decoder | it-tools | web |
| 61 | git-memo | Git Memo | it-tools | developer |
| 62 | random-port-generator | Random Port Generator | it-tools | developer |
| 63 | crontab-generator | Crontab Generator | it-tools + omni-tools | developer |
| 64 | json-viewer | JSON Viewer | it-tools | developer |
| 68 | chmod-calculator | Chmod Calculator | it-tools | developer |
| 69 | docker-run-to-compose | Docker Run to Compose | it-tools | developer |
| 70 | xml-formatter | XML Formatter | it-tools | developer |
| 72 | email-normalizer | Email Normalizer | it-tools | developer |
| 73 | regex-tester | Regex Tester | it-tools | developer |
| 74 | regex-memo | Regex Memo | it-tools | developer |
| 81 | docker-compose-to-1panel | Docker Compose to 1Panel | 1Panel-Tools | developer |
| 82 | ipv4-subnet-calculator | IPv4 Subnet Calculator | it-tools | network |
| 83 | ipv4-address-converter | IPv4 Address Converter | it-tools | network |
| 84 | ipv4-range-expander | IPv4 Range Expander | it-tools | network |
| 86 | mac-address-generator | MAC Address Generator | it-tools | network |
| 87 | ipv6-ula-generator | IPv6 ULA Generator | it-tools | network |
| 93 | numeronym-generator | Numeronym Generator | it-tools | text |
| 138 | camera-recorder | Camera Recorder | it-tools | image |
| 181 | eta-calculator | ETA Calculator | it-tools | math |
| 189 | benchmark-builder | Benchmark Builder | it-tools | measurement |
| 228 | info-masking | Info Masking | MyIP | platform |

---

### Task 1: Text Converters (4 tools)

**Tools:** Roman Numeral Converter, Text to NATO Alphabet, Text to Binary, Numeronym Generator

**Files per tool:**
- Create: `apps/web/src/tools/<kebab-name>/index.ts`
- Create: `apps/web/src/tools/<kebab-name>/<PascalName>.vue`
- Create: `apps/web/src/tools/<kebab-name>/<kebab-name>.service.ts` (for business logic)
- Modify: `apps/web/src/locales/en.json` (add 4 tool entries)
- Modify: `apps/web/src/locales/zh.json` (add 4 tool entries)

**Upstream references:**
- `template/it-tools/src/tools/roman-numeral-converter/` — has `.service.ts` with `arabicToRoman`, `romanToArabic`, `isValidRomanNumber`
- `template/it-tools/src/tools/text-to-nato-alphabet/` — NATO phonetic alphabet mapping
- `template/it-tools/src/tools/text-to-binary/` — has `.models.ts` with `convertTextToAsciiBinary`, `convertAsciiBinaryToText`
- `template/it-tools/src/tools/numeronym-generator/` — abbreviate words (e.g., "internationalization" → "i18n")

**Migration notes:**
- Roman Numeral: bidirectional conversion with validation (1-3999 range), two input sections
- NATO: text input → space-separated NATO words output
- Binary: bidirectional text↔binary with 8-bit alignment validation
- Numeronym: word input → abbreviated form (first letter + count + last letter)

**Testing:** Unit tests for service files (pure functions). Verify all 4 tools appear in registry.

---

### Task 2: Web Utilities (5 tools)

**Tools:** Basic Auth Generator, Meta Tag Generator, MIME Types, Keycode Info, Safelink Decoder

**Files per tool:**
- Create: `apps/web/src/tools/<kebab-name>/index.ts`
- Create: `apps/web/src/tools/<kebab-name>/<PascalName>.vue`
- Modify: `apps/web/src/locales/en.json`
- Modify: `apps/web/src/locales/zh.json`

**Upstream references:**
- `template/it-tools/src/tools/basic-auth-generator/` — base64 encode `user:password` into `Authorization: Basic` header
- `template/it-tools/src/tools/meta-tag-generator/` — generate HTML meta tags for SEO, OG, Twitter cards
- `template/it-tools/src/tools/mime-types/` — search/filter MIME types by extension or type
- `template/it-tools/src/tools/keycode-info/` — capture keyboard event and show keyCode, code, key, location
- `template/it-tools/src/tools/safelink-decoder/` — decode Outlook safelink URLs to original URLs

**Migration notes:**
- Basic Auth: two inputs (username, password) → encoded header output
- Meta Tag Generator: form with multiple fields (title, description, OG image, etc.) → HTML output
- MIME Types: searchable table/list of MIME types with filter by extension or type name
- Keycode Info: event listener on a focused area, display event properties in cards
- Safelink Decoder: input URL → decoded original URL

---

### Task 3: Developer Reference Tools (4 tools)

**Tools:** Git Memo, Regex Memo, Random Port Generator, Chmod Calculator

**Files per tool:**
- Create: `apps/web/src/tools/<kebab-name>/index.ts`
- Create: `apps/web/src/tools/<kebab-name>/<PascalName>.vue`
- Create: `apps/web/src/tools/chmod-calculator/chmod-calculator.service.ts` (permission calculation logic)
- Modify: `apps/web/src/locales/en.json`
- Modify: `apps/web/src/locales/zh.json`

**Upstream references:**
- `template/it-tools/src/tools/git-memo/` — static reference card for common git commands
- `template/it-tools/src/tools/regex-memo/` — static reference card for regex syntax
- `template/it-tools/src/tools/random-port-generator/` — generate random port in range (1024-65535), exclude well-known ports
- `template/it-tools/src/tools/chmod-calculator/` — checkbox grid for rwx permissions → numeric/octal output

**Migration notes:**
- Git Memo: read-only reference display, use NDataTable or styled list
- Regex Memo: read-only reference display with syntax categories
- Random Port: button to generate, display port number with copy button
- Chmod Calculator: 3×3 checkbox grid (owner/group/other × read/write/execute) → numeric (e.g., 755) and symbolic (e.g., rwxr-xr-x) output

---

### Task 4: Developer Interactive Tools (5 tools)

**Tools:** JSON Viewer, Docker Run to Compose, XML Formatter, Email Normalizer, Regex Tester

**Files per tool:**
- Create: `apps/web/src/tools/<kebab-name>/index.ts`
- Create: `apps/web/src/tools/<kebab-name>/<PascalName>.vue`
- Create: service files for tools with complex logic (docker-run-to-compose, xml-formatter)
- Modify: `apps/web/src/locales/en.json`
- Modify: `apps/web/src/locales/zh.json`

**Upstream references:**
- `template/it-tools/src/tools/json-viewer/` — paste JSON, display formatted with syntax highlighting
- `template/it-tools/src/tools/docker-run-to-docker-compose-converter/` — parse docker run CLI args → docker-compose YAML
- `template/it-tools/src/tools/xml-formatter/` — format/minify XML with indentation
- `template/it-tools/src/tools/email-normalizer/` — normalize email addresses (remove dots from Gmail, handle + aliases)
- `template/it-tools/src/tools/regex-tester/` — test regex against input text, show matches highlighted

**Migration notes:**
- JSON Viewer: input textarea → formatted output (use JSON.stringify with indent, NOT a tree view — tree view is future work per inventory remark #7)
- Docker Run to Compose: parse CLI-style `docker run` command → output YAML. This is complex — consider using a simple parser or the `docker-run-to-compose` npm package if available. Check upstream for their approach.
- XML Formatter: use browser DOMParser for parsing, output formatted XML string
- Email Normalizer: input email → normalized form (Gmail dot removal, plus addressing, domain lowercase)
- Regex Tester: regex input + flags + test text → match results with highlights

---

### Task 5: Network Calculation Tools (5 tools)

**Tools:** IPv4 Subnet Calculator, IPv4 Address Converter, IPv4 Range Expander, MAC Address Generator, IPv6 ULA Generator

**Files per tool:**
- Create: `apps/web/src/tools/<kebab-name>/index.ts`
- Create: `apps/web/src/tools/<kebab-name>/<PascalName>.vue`
- Create: service files for calculation logic
- Modify: `apps/web/src/locales/en.json`
- Modify: `apps/web/src/locales/zh.json`

**Upstream references:**
- `template/it-tools/src/tools/ipv4-subnet-calculator/` — CIDR notation parsing, subnet mask, broadcast, host range
- `template/it-tools/src/tools/ipv4-address-converter/` — convert between decimal, binary, hex, octal representations
- `template/it-tools/src/tools/ipv4-range-expander/` — given start/end IPs, calculate the minimal set of CIDR ranges
- `template/it-tools/src/tools/mac-address-generator/` — generate random MAC addresses with configurable prefix/separator
- `template/it-tools/src/tools/ipv6-ula-generator/` — generate IPv6 ULA (Unique Local Address) per RFC 4193

**Migration notes:**
- All IP tools need careful bit manipulation — port the service logic from upstream carefully
- IPv4 Subnet: input CIDR → display network address, broadcast, mask, host count, host range
- IPv4 Converter: input IP in any format → show all other formats
- IPv4 Range: input start + end IP → show CIDR blocks that cover the range
- MAC Address: configure prefix, separator (: or -), count → generate list
- IPv6 ULA: generate random ULA prefix (fd00::/8) with random 40-bit global ID

---

### Task 6: Remaining Tools (6 tools)

**Tools:** Crontab Generator, Docker Compose to 1Panel, Camera Recorder, ETA Calculator, Benchmark Builder, Info Masking

**Files per tool:**
- Create: `apps/web/src/tools/<kebab-name>/index.ts`
- Create: `apps/web/src/tools/<kebab-name>/<PascalName>.vue`
- Create: service files as needed
- Modify: `apps/web/src/locales/en.json`
- Modify: `apps/web/src/locales/zh.json`

**Upstream references:**
- `template/it-tools/src/tools/crontab-generator/` — form for cron fields → cron expression + human-readable description
- `template/omni-tools/src/tools/` — check for docker-compose-to-1panel (may not exist in omni-tools, check 1Panel-Tools source)
- `template/it-tools/src/tools/camera-recorder/` — use `navigator.mediaDevices.getUserMedia` for camera access, record video
- `template/it-tools/src/tools/eta-calculator/` — input task count, rate, start time → estimated completion time
- `template/it-tools/src/tools/benchmark-builder/` — run JavaScript benchmarks, display results
- MyIP Info Masking — check if source exists; if not, implement: mask sensitive info (emails, phones, IPs) in text

**Migration notes:**
- Crontab Generator: 5 field inputs (minute, hour, day, month, weekday) with presets → cron expression output. Merge #80 (Crontab Guru) functionality: show next execution times.
- Docker Compose to 1Panel: parse docker-compose YAML → 1Panel format. Check if 1Panel-Tools source exists in the project. If not, create a basic converter.
- Camera Recorder: browser MediaDevices API, record with MediaRecorder, download blob. Tag: `media`, `lazy-load`.
- ETA Calculator: input total tasks, completed tasks, time elapsed → calculate remaining time
- Benchmark Builder: code editor input, run with `new Function()`, measure execution time with `performance.now()`
- Info Masking: input text → mask patterns (email, phone, IP, credit card) with configurable mask character

---

### Task 7: Full Batch Verification

**Actions:**
1. Run `pnpm --filter @toolnest/web type-check` — must pass with 0 errors
2. Run `pnpm --filter @toolnest/web test` — all tests pass
3. Run `pnpm --filter @toolnest/server test` — all tests still pass (no server changes in M1)
4. Verify all 29 new tools are auto-discovered by registry (check tool count)
5. Verify i18n keys exist in both en.json and zh.json for all 29 tools
6. Start dev server, spot-check 3-5 tools in browser

**Acceptance criteria:**
- All 29 tools accessible via their defined paths
- No TypeScript errors
- No test failures
- i18n switching works (zh ↔ en) for all new tools
