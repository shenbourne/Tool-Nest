<script setup lang="ts">
import { NCard, NDataTable, NSpace, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

interface RegexEntry {
  syntax: string;
  meaning: string;
  example?: string;
}

interface RegexSection {
  title: string;
  entries: RegexEntry[];
}

const sections: RegexSection[] = [
  {
    title: 'Character Classes',
    entries: [
      { syntax: '.', meaning: 'Any character except newline' },
      { syntax: '[A-Za-z]', meaning: 'Alphabet', example: 'matches a-z, A-Z' },
      { syntax: '[a-z]', meaning: 'Lowercase alphabet' },
      { syntax: '[A-Z]', meaning: 'Uppercase alphabet' },
      { syntax: '\\d or [0-9]', meaning: 'Any digit' },
      { syntax: '\\D or [^0-9]', meaning: 'Non-digit character' },
      { syntax: '\\w or [A-Za-z0-9_]', meaning: 'Word character (alphanumeric + underscore)' },
      { syntax: '\\W or [^A-Za-z0-9_]', meaning: 'Non-word character' },
      { syntax: '\\s', meaning: 'Whitespace (space, tab, newline)' },
      { syntax: '\\S', meaning: 'Non-whitespace character' },
    ],
  },
  {
    title: 'Whitespace Characters',
    entries: [
      { syntax: ' ', meaning: 'Space' },
      { syntax: '\\t', meaning: 'Tab' },
      { syntax: '\\n', meaning: 'Newline' },
      { syntax: '\\r', meaning: 'Carriage return' },
      { syntax: '\\s', meaning: 'Space, tab, newline or carriage return' },
    ],
  },
  {
    title: 'Character Sets',
    entries: [
      { syntax: '[xyz]', meaning: 'Either x, y or z', example: 'matches one of x, y, z' },
      { syntax: '[^xyz]', meaning: 'Neither x, y nor z', example: 'negated character set' },
      { syntax: '[1-3]', meaning: 'Range: 1, 2 or 3', example: 'character range' },
      { syntax: '[^1-3]', meaning: 'Not 1, 2 nor 3', example: 'negated range' },
    ],
  },
  {
    title: 'Quantifiers',
    entries: [
      { syntax: '{n}', meaning: 'Exactly n occurrences' },
      { syntax: '{n,}', meaning: 'At least n occurrences' },
      { syntax: '{n,m}', meaning: 'Between n and m occurrences' },
      { syntax: '*', meaning: '0 or more (same as {0,})' },
      { syntax: '+', meaning: '1 or more (same as {1,})' },
      { syntax: '?', meaning: '0 or 1 (same as {0,1})' },
    ],
  },
  {
    title: 'Boundaries',
    entries: [
      { syntax: '^', meaning: 'Start of string' },
      { syntax: '$', meaning: 'End of string' },
      { syntax: '\\b', meaning: 'Word boundary' },
      { syntax: '\\B', meaning: 'Non-word boundary' },
    ],
  },
  {
    title: 'Groups & Lookaround',
    entries: [
      { syntax: '(foo)', meaning: 'Capturing group' },
      { syntax: '(?:foo)', meaning: 'Non-capturing group' },
      { syntax: 'foo|bar', meaning: 'Alternation: match foo or bar' },
      { syntax: 'foo(?=bar)', meaning: 'Positive lookahead: foo followed by bar' },
      { syntax: 'foo(?!bar)', meaning: 'Negative lookahead: foo not followed by bar' },
      { syntax: '(?<=bar)foo', meaning: 'Positive lookbehind: foo preceded by bar' },
      { syntax: '(?<!bar)foo', meaning: 'Negative lookbehind: foo not preceded by bar' },
    ],
  },
  {
    title: 'Special Characters (need escaping)',
    entries: [
      { syntax: '\\.', meaning: 'Literal period' },
      { syntax: '\\^', meaning: 'Literal caret' },
      { syntax: '\\$', meaning: 'Literal dollar sign' },
      { syntax: '\\|', meaning: 'Literal pipe' },
      { syntax: '\\\\', meaning: 'Literal backslash' },
      { syntax: '\\(', meaning: 'Literal opening parenthesis' },
      { syntax: '\\)', meaning: 'Literal closing parenthesis' },
      { syntax: '\\[', meaning: 'Literal opening square bracket' },
      { syntax: '\\]', meaning: 'Literal closing square bracket' },
      { syntax: '\\{', meaning: 'Literal opening curly bracket' },
      { syntax: '\\}', meaning: 'Literal closing curly bracket' },
    ],
  },
];

const columns: DataTableColumns<RegexEntry> = [
  { title: 'Syntax', key: 'syntax', width: 180 },
  { title: 'Meaning', key: 'meaning' },
];
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard
        v-for="section in sections"
        :key="section.title"
        :title="section.title"
        size="small"
      >
        <NDataTable
          :columns="columns"
          :data="section.entries"
          :bordered="false"
          :bottom-bordered="false"
          size="small"
          :single-line="false"
          :row-key="(row: RegexEntry) => row.syntax"
        />
      </NCard>
    </NSpace>
  </ToolLayout>
</template>

<style scoped>
:deep(.n-data-table) {
  --n-font-size: 13px;
}
:deep(.n-data-table-td) {
  vertical-align: top;
}
:deep(code), :deep(.n-data-table-th) {
  font-family: monospace;
}
</style>
