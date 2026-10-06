<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NDataTable, NSpace } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

interface RegexEntry {
  syntax: string;
  meaning: string;
  // Rendered by no column; kept in place, so it stays untranslated.
  example?: string;
}

interface RegexSection {
  title: string;
  entries: RegexEntry[];
}

const sections = computed<RegexSection[]>(() => [
  {
    title: t('tools.regexMemo.sections.characterClasses'),
    entries: [
      { syntax: '.', meaning: t('tools.regexMemo.anyChar') },
      { syntax: '[A-Za-z]', meaning: t('tools.regexMemo.alphabet'), example: 'matches a-z, A-Z' },
      { syntax: '[a-z]', meaning: t('tools.regexMemo.lowercaseAlphabet') },
      { syntax: '[A-Z]', meaning: t('tools.regexMemo.uppercaseAlphabet') },
      { syntax: '\\d or [0-9]', meaning: t('tools.regexMemo.anyDigit') },
      { syntax: '\\D or [^0-9]', meaning: t('tools.regexMemo.nonDigit') },
      { syntax: '\\w or [A-Za-z0-9_]', meaning: t('tools.regexMemo.wordChar') },
      { syntax: '\\W or [^A-Za-z0-9_]', meaning: t('tools.regexMemo.nonWordChar') },
      { syntax: '\\s', meaning: t('tools.regexMemo.whitespace') },
      { syntax: '\\S', meaning: t('tools.regexMemo.nonWhitespace') },
    ],
  },
  {
    title: t('tools.regexMemo.sections.whitespaceCharacters'),
    entries: [
      { syntax: ' ', meaning: t('tools.regexMemo.space') },
      { syntax: '\\t', meaning: t('tools.regexMemo.tab') },
      { syntax: '\\n', meaning: t('tools.regexMemo.newline') },
      { syntax: '\\r', meaning: t('tools.regexMemo.carriageReturn') },
      { syntax: '\\s', meaning: t('tools.regexMemo.anyWhitespace') },
    ],
  },
  {
    title: t('tools.regexMemo.sections.characterSets'),
    entries: [
      { syntax: '[xyz]', meaning: t('tools.regexMemo.either'), example: 'matches one of x, y, z' },
      { syntax: '[^xyz]', meaning: t('tools.regexMemo.neither'), example: 'negated character set' },
      { syntax: '[1-3]', meaning: t('tools.regexMemo.range'), example: 'character range' },
      { syntax: '[^1-3]', meaning: t('tools.regexMemo.negatedRange'), example: 'negated range' },
    ],
  },
  {
    title: t('tools.regexMemo.sections.quantifiers'),
    entries: [
      { syntax: '{n}', meaning: t('tools.regexMemo.exactlyN') },
      { syntax: '{n,}', meaning: t('tools.regexMemo.atLeastN') },
      { syntax: '{n,m}', meaning: t('tools.regexMemo.betweenNandM') },
      { syntax: '*', meaning: t('tools.regexMemo.zeroOrMore') },
      { syntax: '+', meaning: t('tools.regexMemo.oneOrMore') },
      { syntax: '?', meaning: t('tools.regexMemo.zeroOrOne') },
    ],
  },
  {
    title: t('tools.regexMemo.sections.boundaries'),
    entries: [
      { syntax: '^', meaning: t('tools.regexMemo.startOfString') },
      { syntax: '$', meaning: t('tools.regexMemo.endOfString') },
      { syntax: '\\b', meaning: t('tools.regexMemo.wordBoundary') },
      { syntax: '\\B', meaning: t('tools.regexMemo.nonWordBoundary') },
    ],
  },
  {
    title: t('tools.regexMemo.sections.groupsLookaround'),
    entries: [
      { syntax: '(foo)', meaning: t('tools.regexMemo.capturingGroup') },
      { syntax: '(?:foo)', meaning: t('tools.regexMemo.nonCapturingGroup') },
      { syntax: 'foo|bar', meaning: t('tools.regexMemo.alternation') },
      { syntax: 'foo(?=bar)', meaning: t('tools.regexMemo.positiveLookahead') },
      { syntax: 'foo(?!bar)', meaning: t('tools.regexMemo.negativeLookahead') },
      { syntax: '(?<=bar)foo', meaning: t('tools.regexMemo.positiveLookbehind') },
      { syntax: '(?<!bar)foo', meaning: t('tools.regexMemo.negativeLookbehind') },
    ],
  },
  {
    title: t('tools.regexMemo.sections.specialCharacters'),
    entries: [
      { syntax: '\\.', meaning: t('tools.regexMemo.literalPeriod') },
      { syntax: '\\^', meaning: t('tools.regexMemo.literalCaret') },
      { syntax: '\\$', meaning: t('tools.regexMemo.literalDollar') },
      { syntax: '\\|', meaning: t('tools.regexMemo.literalPipe') },
      { syntax: '\\\\', meaning: t('tools.regexMemo.literalBackslash') },
      { syntax: '\\(', meaning: t('tools.regexMemo.literalOpenParen') },
      { syntax: '\\)', meaning: t('tools.regexMemo.literalCloseParen') },
      { syntax: '\\[', meaning: t('tools.regexMemo.literalOpenBracket') },
      { syntax: '\\]', meaning: t('tools.regexMemo.literalCloseBracket') },
      { syntax: '\\{', meaning: t('tools.regexMemo.literalOpenBrace') },
      { syntax: '\\}', meaning: t('tools.regexMemo.literalCloseBrace') },
    ],
  },
]);

const columns = computed<DataTableColumns<RegexEntry>>(() => [
  { title: t('tools.regexMemo.syntaxColumn'), key: 'syntax', width: 180 },
  { title: t('tools.regexMemo.meaningColumn'), key: 'meaning' },
]);
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
