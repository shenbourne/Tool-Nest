# Phase 11 Plan

## Branch / base

- Branch `feature/phase-11-text-tool-actions`, worktree `.worktrees/phase-11-text-tool-actions`
- Base: local `master` `b44a61a` (origin/master + 47 local merged-phase commits; fetch
  compared clean — ahead 47 / behind 0)
- 84 tools in scope (88 with 2+ textareas minus 4 exclusions, see CONTEXT.md)

## Per-tool migration pattern

Before (uniform shape, e.g. days-to-hours):

```
<ToolLayout :tool="tool">
  <NCard><NSpace vertical :size="12">
    <NInput v-model:value="input" type="textarea" …/>
    <NAlert v-if="inputError" …/>
    <NInput :value="output" type="textarea" readonly …/>
  </NSpace></NCard>
</ToolLayout>
```

After:

```
<ToolLayout :tool="tool">
  <ToolTextPanel v-model:input-text="input" :output-text="output"
                 :input-title="t('common.input')" :output-title="t('common.output')"
                 export-name="output.txt">
    <template #input><NInput v-model:value="input" type="textarea" …/></template>
    <template #output><NInput :value="output" type="textarea" readonly …/></template>
    <template #params><NAlert v-if="inputError" …/></template>
  </ToolTextPanel>
</ToolLayout>
```

- Top param rows (selects/buttons) move into `#params`; per-tool copy buttons are
  removed; action buttons (转换/生成/替换) are kept in `#params`.
- Script blocks: import `ToolTextPanel`, drop dead copy helpers/imports.

## Batches (one commit each)

### Batch A — foundation
- `apps/web/src/components/ToolTextPanel.vue` (new)
- `apps/web/src/utils/clipboard.ts`: add `readClipboardText()`
- `apps/web/src/locales/zh.json`, `en.json`: add `tool.importFailed`, `tool.pasteFailed`
- `apps/web/src/tools/tool-text-panels.test.ts` (new guard test, batch-B list only)

### Batch B — csv/tsv (11)
csv-change-separator, csv-find-incomplete, csv-insert-columns, csv-rows-to-columns,
csv-swap-columns, csv-to-json, csv-to-tsv, csv-to-xml, csv-to-yaml, csv-transpose,
tsv-to-json

### Batch C — json (12)
json-diff, json-escape, json-minify, json-prettify, json-sort, json-stringify,
json-to-csv, json-to-toml, json-to-xml, json-to-yaml, json-validate, json-viewer

### Batch D — xml/yaml/toml/sql (9)
xml-formatter, xml-to-json, xml-validator, yaml-to-json, yaml-to-toml, yaml-viewer,
toml-to-json, toml-to-yaml, sql-prettify

### Batch E — data/dev converters (9)
base64-encoder, docker-compose-to-1panel, docker-run-to-compose, email-extractor,
email-normalizer, hash-text, hmac-generator, html-entities (stacked outputs),
jwt-parser (stacked outputs, export payload)

### Batch F — list (12)
list-converter, list-duplicate, list-find-popular, list-find-unique, list-group,
list-reverse, list-rotate, list-shuffle, list-sort, list-truncate, list-unwrap, list-wrap

### Batch G — text (18)
text-censor, text-diff, text-join, text-replacer, text-reverse, text-rotate, text-split,
text-to-binary (two panels), text-to-nato-alphabet, text-to-unicode (two panels),
text-truncate, remove-duplicate-lines, morse-code, rot13, extract-substring,
hidden-char-detector, info-masking, markdown-to-html

### Batch H — math/time/encryption (13)
check-leap-years, create-palindrome, days-to-hours, hours-to-days, number-generator,
number-sum, number-to-words, palindrome-checker, seconds-to-time, time-to-decimal,
time-to-seconds, truncate-clock-time, encryption (two panels: encrypt / decrypt)

## Checks

- After each batch: `pnpm --filter web test` (guard test stays green), `type-check`
- End: full `scripts/verify` equivalent (test/type-check/build), differential lint vs
  base per file, browser evidence (Chrome DevTools MCP) for import/paste/copy/export on
  representative tools per layout type (uniform, top-params, two-section, stacked-output)

## Risks

- 84 files × template variance → codemod only for the strict uniform shape; hand-edit the
  rest; guard test catches missed tools at every batch boundary.
- `components.d.ts` regenerates with CRLF noise — never stage it.
- The other session edits `ToolFilePanel.vue` / `tool-file-import-controls.test.ts` —
  phase 11 avoids both files entirely.
