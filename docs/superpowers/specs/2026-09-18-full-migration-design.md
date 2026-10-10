---
title: ToolNest Full Migration Design
date: 2026-09-18
status: approved
scope: Migrate all remaining ~103 pending inventory entries (~80 unique tools) from it-tools, omni-tools, and MyIP into ToolNest
---

# ToolNest Full Migration Design

## Context

ToolNest aggregates developer tools from four upstream projects (it-tools, 1Panel-Tools, omni-tools, MyIP) into a unified Vue 3 + TypeScript platform. As of 2026-09-17, 124 tools have been migrated with 3 merges completed. This spec covers the remaining ~103 pending entries (~80 unique tool directories) plus 3 pending merges.

Source: `docs/migration/inventory.md` (230 numbered entries, 124 migrated, 3 merged, 103 pending, 3 excluded).

## Architecture Decisions

### AD-1: FFmpeg.wasm — Shared Instance + Lazy Loading

All 17 video/audio tools share a single FFmpeg.wasm instance managed by a composable.

**Location**: `packages/shared/src/composables/useFFmpeg.ts`

**Interface**:

```typescript
interface UseFFmpegReturn {
  isLoaded: Ref<boolean>
  isLoading: Ref<boolean>
  loadProgress: Ref<number>
  load(): Promise<FFmpeg>
  exec(cmd: string[]): Promise<{ exitCode: number; stdout: string }>
  readFile(path: string): Uint8Array
  writeFile(path: string, data: Uint8Array): void
  dispose(): void
}
```

**Behavior**:
- Singleton pattern: one FFmpeg instance shared across all tools
- First `load()` triggers ~30MB WASM download with progress callback
- Tool components call `load()` in `onMounted`, clean up temp files in `onUnmounted` (do NOT dispose the shared instance)
- Tools using FFmpeg are tagged `lazy-load` for route-level code splitting
- Dependencies: `@ffmpeg/ffmpeg`, `@ffmpeg/util`

### AD-2: Image Tools — vue-konva Replacement

Image Editor (#144) and Image Crop (#143) use react-konva in omni-tools. Migration uses `vue-konva` + `konva`.

**Setup**: `app.use(VueKonva)` in `main.ts`

**Migration mapping**:
- `<Stage>` → `<v-stage>`
- `<Layer>` → `<v-layer>`
- `<Transformer>` → `<v-transformer>`
- React event handlers → Vue event handlers (`@click`, `@dragmove`, etc.)
- `useRef` → `ref` / template refs

Both tools tagged `lazy-load`.

### AD-3: Network Tests — Full Backend Migration

All 6 backend-dependent network test tools are migrated with new Express endpoints.

**Endpoints** (in `apps/server/src/routes/network.ts`):

| Endpoint | Method | Purpose | External API |
|----------|--------|---------|-------------|
| `/api/network/dns-leak` | POST | DNS leak detection | Self DNS queries |
| `/api/network/ping` | POST | Ping test | Globalping API |
| `/api/network/mtr` | POST | MTR route tracing | Globalping API |
| `/api/network/latency` | POST | Global latency | Globalping API |
| `/api/network/rule-test` | POST | Rule testing | Self DNS resolution |
| `/api/network/censorship` | POST | Censorship check | OONI API |

**Globalping service**: `apps/server/src/services/globalping.ts` — wraps Globalping API calls with timeout, retry, and response normalization.

**Security**: Reuse existing SSRF protection from `middleware/security.ts`. Rate limit: 10 req/15min for network endpoints. Timeouts: Ping 30s, MTR 60s, Latency 30s.

## Infrastructure Modules (M0)

### M0.1: FFmpeg Composable

- File: `packages/shared/src/composables/useFFmpeg.ts`
- Test: `packages/shared/src/__tests__/useFFmpeg.test.ts`
- Export from `packages/shared/src/index.ts`

### M0.2: vue-konva Setup

- Install: `vue-konva`, `konva` in `apps/web`
- Register: `app.use(VueKonva)` in `apps/web/src/main.ts`
- No shared composable needed — tools use vue-konva components directly

### M0.3: Backend Network Endpoints

- Route file: `apps/server/src/routes/network.ts`
- Globalping service: `apps/server/src/services/globalping.ts`
- OONI service: `apps/server/src/services/ooni.ts`
- Input validation: reuse `@toolnest/shared` validators
- Tests: `apps/server/src/__tests__/network-routes.test.ts`

### M0.4: New Dependencies

| Package | Location | Purpose | Loading |
|---------|----------|---------|---------|
| `@ffmpeg/ffmpeg` + `@ffmpeg/util` | apps/web | Video/audio processing | Lazy |
| `vue-konva` + `konva` | apps/web | Image editing/cropping | Lazy |
| `qrcode` | apps/web | QR code generation | Normal |
| `figlet` | apps/web | ASCII art text | Normal |
| `js-yaml` | apps/web | YAML parsing | Normal |
| `@iarna/toml` | apps/web | TOML parsing | Normal |
| `xml-js` | apps/web | XML/JSON conversion | Normal |
| `markdown-it` | apps/web | Markdown to HTML | Normal |
| `sql-formatter` | apps/web | SQL formatting | Normal |
| `libphonenumber-js` | apps/web | Phone number parsing | Normal |
| `iban` | apps/web | IBAN validation | Normal |
| `pdfjs-dist` | apps/web | PDF rendering | Lazy |
| `html2canvas` | apps/web | Screenshot sharing | Lazy |
| `otplib` | apps/web | OTP generation/validation | Normal |
| `ua-parser-js` | apps/web | User-agent parsing | Normal |
| `node-whois` | apps/server | Whois (already present) | — |

## Migration Batches

### M1: Batch A — Lightweight Browser Tools (~29 tools)

No external dependencies. Direct migration from it-tools/omni-tools source.

| # | Tool | Source | Category |
|---|------|--------|----------|
| 18 | Roman Numeral Converter | it-tools | converter |
| 23 | Text to NATO Alphabet | it-tools | converter |
| 24 | Text to Binary | it-tools | converter |
| 48 | Basic Auth Generator | it-tools | web |
| 49 | Meta Tag Generator | it-tools | web |
| 51 | MIME Types | it-tools | web |
| 53 | Keycode Info | it-tools | web |
| 59 | Safelink Decoder | it-tools | web |
| 61 | Git Memo | it-tools | developer |
| 62 | Random Port Generator | it-tools | developer |
| 63 | Crontab Generator (+ merge #80 Crontab Guru) | it-tools + omni-tools | developer |
| 64 | JSON Viewer | it-tools | developer |
| 68 | Chmod Calculator | it-tools | developer |
| 69 | Docker Run to Compose | it-tools | developer |
| 70 | XML Formatter | it-tools | developer |
| 72 | Email Normalizer | it-tools | developer |
| 73 | Regex Tester | it-tools | developer |
| 74 | Regex Memo | it-tools | developer |
| 81 | Docker Compose to 1Panel | 1Panel-Tools | developer |
| 82 | IPv4 Subnet Calculator | it-tools | network |
| 83 | IPv4 Address Converter | it-tools | network |
| 84 | IPv4 Range Expander | it-tools | network |
| 86 | MAC Address Generator | it-tools | network |
| 87 | IPv6 ULA Generator | it-tools | network |
| 93 | Numeronym Generator | it-tools | text |
| 138 | Camera Recorder | it-tools | image |
| 181 | ETA Calculator | it-tools | math |
| 189 | Benchmark Builder | it-tools | measurement |
| 228 | Info Masking | MyIP | platform |

### M2: Batch B — Format Conversion Tools (~17 tools)

Require format parsing libraries (js-yaml, @iarna/toml, xml-js, markdown-it, sql-formatter, etc.).

| # | Tool | Source | Category | Key Dependency |
|---|------|--------|----------|---------------|
| 16 | Date-Time Converter (+ merge #196 Unix↔Date) | it-tools | converter | dayjs |
| 20 | Base64 File Converter | it-tools | converter | — |
| 25 | Text to Unicode | it-tools | converter | — |
| 26 | YAML to JSON | it-tools | converter | js-yaml |
| 27 | YAML to TOML | it-tools | converter | @iarna/toml |
| 28 | JSON to YAML | it-tools | converter | js-yaml |
| 29 | JSON to TOML | it-tools | converter | @iarna/toml |
| 30 | List Converter | it-tools | converter | — |
| 31 | TOML to JSON | it-tools | converter | @iarna/toml |
| 32 | TOML to YAML | it-tools | converter | @iarna/toml |
| 33 | XML to JSON | it-tools | converter | xml-js |
| 34 | JSON to XML | it-tools | converter | xml-js |
| 35 | Markdown to HTML | it-tools | converter | markdown-it |
| 65 | JSON Minify | it-tools | developer | — |
| 66 | JSON to CSV | it-tools | developer | papaparse |
| 67 | SQL Prettify | it-tools | developer | sql-formatter |
| 71 | YAML Viewer | it-tools | developer | js-yaml |

### M3: Batch C — QR Code / Special Generators (~4 tools)

| # | Tool | Source | Category | Key Dependency |
|---|------|--------|----------|---------------|
| 135/201 | QR Code Generator | it-tools | generator | qrcode |
| 136/202 | WiFi QR Code Generator | it-tools | generator | qrcode |
| 137/203 | SVG Placeholder Generator | it-tools | generator | — |
| 50 | OTP Generator & Validator | it-tools | web | otplib |

### M4: Batch D — Image Tools (~10 tools)

Require vue-konva (M0.2), Tesseract.js, and Canvas API.

| # | Tool | Source | Category | Key Dependency |
|---|------|--------|----------|---------------|
| 139 | Image Change Colors | omni-tools | image | — |
| 142 | Image Create Transparent | omni-tools | image | — |
| 143 | Image Crop | omni-tools | image | vue-konva |
| 144 | Image Editor | omni-tools | image | vue-konva |
| 145 | Image to Text (OCR) | omni-tools | image | Tesseract.js |
| 146 | Image Remove Background | omni-tools | image | — |
| 149 | Image Split | omni-tools | image | — |
| 152 | Convert JPG to PNG | omni-tools | image | — |
| 55 | HTML WYSIWYG Editor | it-tools | web | — |
| 56 | User-Agent Parser | it-tools | web | ua-parser-js |

### M5: Batch E — Video/Audio Tools (~19 tools)

All require FFmpeg.wasm (M0.1 ready).

| # | Tool | Source | Category |
|---|------|--------|----------|
| 40 | Audio Converter | omni-tools | converter |
| 43 | Video to GIF | omni-tools | converter |
| 153 | Video Add Audio | omni-tools | video |
| 154 | Video Change Speed | omni-tools | video |
| 155 | Video Compress | omni-tools | video |
| 156 | Video Crop | omni-tools | video |
| 157 | Video Flip | omni-tools | video |
| 158 | Video Loop | omni-tools | video |
| 159 | Video Merge | omni-tools | video |
| 160 | Video Resize | omni-tools | video |
| 161 | Video Rotate | omni-tools | video |
| 162 | Video Trim | omni-tools | video |
| 163 | GIF Change Speed | omni-tools | video |
| 164 | Images to GIF | omni-tools | video |
| 165 | Audio Change Speed | omni-tools | audio |
| 166 | Audio Extract | omni-tools | audio |
| 167 | Audio Loop | omni-tools | audio |
| 168 | Audio Merge | omni-tools | audio |
| 169 | Audio Trim | omni-tools | audio |

### M6: Batch F — PDF Extensions (~5 tools)

| # | Tool | Source | Category | Key Dependency |
|---|------|--------|----------|---------------|
| 11 | PDF Signature Checker | it-tools | pdf | pdf-lib |
| 172 | PDF Editor | omni-tools | pdf | pdf-lib |
| 173 | PDF Extract Images | omni-tools | pdf | pdfjs-dist |
| 175 | PDF to EPUB | omni-tools | pdf | — |
| 176 | PDF to PNG | omni-tools | pdf | pdfjs-dist |

### M7: Batch G — Network Test Tools (~6 tools)

Require backend endpoints (M0.3 ready).

| # | Tool | Source | Category | Runtime |
|---|------|--------|----------|---------|
| 216 | DNS Leak Test | MyIP | network-test | hybrid |
| 218 | Ping Test | MyIP | network-test | hybrid |
| 219 | MTR Test | MyIP | network-test | hybrid |
| 220 | Global Latency Test | MyIP | network-test | hybrid |
| 221 | Rule Test | MyIP | network-test | backend |
| 223 | Censorship Check | MyIP | network-test | hybrid |

### M8: Batch H — Platform Features (~2 tools)

| # | Tool | Source | Category | Key Dependency |
|---|------|--------|----------|---------------|
| 229 | Screenshot Share | MyIP | platform | html2canvas |
| 58 | JSON Diff | it-tools | developer | — |

## Pending Merges

| Merge | Target | Action |
|-------|--------|--------|
| #80 Crontab Guru → #63 Crontab Generator | Migrated in M2 (Batch B) or standalone | Add omni-tools cron preview feature to the it-tools crontab UI |
| #110 URL Editor → #46 URL Parser | Already migrated; enhance existing | Add editing capability (modify query params, path segments) to url-parser |
| #196 Unix↔Date → #16 Date-Time Converter | Migrated in M2 (Batch B) | Include Unix timestamp bidirectional conversion in date-time-converter |

Note: #63 Crontab Generator and #64 JSON Viewer/Regex Tester/Regex Memo are in M1 or M2. #64 JSON Viewer's tree view remains unimplemented (noted in inventory remark #7).

## Tool Migration Pattern

Each tool follows this structure:

```
apps/web/src/tools/<tool-name>/
  index.ts          # defineTool() registration
  <ToolName>.vue    # Vue component wrapped in ToolLayout
  *.service.ts      # Pure business logic (optional, for complex tools)
```

### index.ts Template

```typescript
import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.<camelCaseName>.name',
  path: '/<kebab-case-path>',
  description: 'tools.<camelCaseName>.description',
  category: '<category>',
  tags: ['<tag1>', '<tag2>'],
  keywords: ['<keyword1>', '<keyword2>'],
  component: () => import('./<ToolName>.vue'),
  createdAt: '2026-09-18',
  runtimeLocation: 'browser', // or 'backend' | 'hybrid'
});
```

### Component Template

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
</script>

<template>
  <ToolLayout :tool="tool">
    <!-- Tool UI using Naive UI primitives -->
  </ToolLayout>
</template>
```

### i18n Entries

Add to both `apps/web/src/locales/zh.json` and `en.json`:

```json
{
  "tools": {
    "<camelCaseName>": {
      "name": "...",
      "description": "..."
    }
  }
}
```

## Testing Strategy

### Test Layers

| Layer | Scope | Tool | Timing |
|-------|-------|------|--------|
| Registry test | All tools | `registry.test.ts` extension | After each migration |
| Unit tests | Business logic | `*.service.test.ts` | Per tool with service |
| Type check | Full project | `vue-tsc --noEmit` | Per batch |
| Manual verification | Tool functionality | Browser | Per tool |

### Registry Test Extensions

- Verify i18n keys exist in both `zh.json` and `en.json`
- Verify `runtimeLocation: 'backend' | 'hybrid'` tools have corresponding server endpoints
- Verify `externalDeps` packages exist in `package.json`

### FFmpeg Tool Testing

- Unit: pure function logic (parameter calculation, command generation)
- Integration: FFmpeg composable load/exec/readFile (mock WASM)
- Manual: actual file upload and processing (at least one case per tool)

### Backend Network Test Verification

- Unit: input validation, SSRF protection, timeout handling
- Integration: mock Globalping/OONI API responses
- Manual: real API calls

### Per-Batch Acceptance Criteria

1. `pnpm --filter @toolnest/web test` — all pass
2. `pnpm --filter @toolnest/web type-check` — no errors
3. `pnpm --filter @toolnest/server test` — all pass (if backend changes)
4. Each new tool loads correctly in browser, input/output works
5. i18n zh/en switching — no missing keys
6. `inventory.md` updated with migration status

## Execution Flow

Each batch follows the superpowers workflow:

1. **brainstorming** — Confirm tool list, merge handling, edge cases
2. **writing-plans** — Break each tool into 2-5 min tasks (index.ts → component → i18n → test)
3. **subagent-driven-development** — Subagent per tool, two-stage review
4. **verification** — `pnpm test` + `pnpm type-check` + browser manual check
5. **commit** — One commit per batch (matching existing migration batch style)

## Scope Boundaries

### In Scope

- All 103 pending inventory entries
- 3 pending merges (Crontab Guru, URL Editor, Unix↔Date)
- Shared infrastructure (FFmpeg composable, vue-konva, backend network endpoints)
- i18n for all new tools (zh + en)
- Registry test extensions

### Out of Scope

- JSON Viewer tree view (#64) — noted as future work in inventory remark #7
- MyIP private API tools (X01-X03) — excluded per inventory
- Visual regression testing baseline — separate module (M7 in design foundation spec)
- Performance optimization beyond lazy loading — future work
