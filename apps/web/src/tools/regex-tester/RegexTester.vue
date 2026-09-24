<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NCheckbox, NCheckboxGroup, NButton, NAlert, NDataTable, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { testRegex } from './regex-tester.service';

const { t } = useI18n();
const tool = useCurrentTool();

const pattern = ref('\\b(\\w+)@([\\w.]+)\\b');
const text = ref('Contact us at hello@example.com or support@toolnest.dev');
const globalFlag = ref(true);
const ignoreCase = ref(false);
const multiline = ref(false);
const dotAll = ref(false);
const unicode = ref(false);

const flags = computed(() => {
  let f = '';
  if (globalFlag.value) f += 'g';
  if (ignoreCase.value) f += 'i';
  if (multiline.value) f += 'm';
  if (dotAll.value) f += 's';
  if (unicode.value) f += 'u';
  return f;
});

const result = computed(() => testRegex(pattern.value, text.value, flags.value));

const highlightedHtml = computed(() => {
  if (!text.value || result.value.matches.length === 0) {
    return escapeHtml(text.value);
  }

  let html = '';
  let lastIndex = 0;

  for (const match of result.value.matches) {
    const start = match.index;
    const end = start + match.value.length;

    if (start > lastIndex) {
      html += escapeHtml(text.value.substring(lastIndex, start));
    }

    html += `<mark style="background: #ffe0b2; padding: 1px 2px; border-radius: 2px;">${escapeHtml(match.value)}</mark>`;
    lastIndex = end;
  }

  if (lastIndex < text.value.length) {
    html += escapeHtml(text.value.substring(lastIndex));
  }

  return html;
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const matchColumns = [
  { title: 'Index', key: 'index', width: 80 },
  { title: 'Match', key: 'value' },
  { title: 'Groups', key: 'groups' },
];

const matchTableData = computed(() =>
  result.value.matches.map((m, i) => ({
    key: i,
    index: m.index,
    value: m.value,
    groups: m.groups.length > 0
      ? m.groups.map(g => `${g.name}="${g.value}"`).join(', ')
      : m.captures.length > 0
        ? m.captures.map(c => `${c.name}="${c.value}"`).join(', ')
        : '-',
  })),
);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Regular Expression">
        <NInput
          v-model:value="pattern"
          placeholder="Enter regex pattern..."
          monospace
          style="margin-bottom: 8px;"
        />
        <NSpace :size="12">
          <NCheckbox v-model:checked="globalFlag">Global (g)</NCheckbox>
          <NCheckbox v-model:checked="ignoreCase">Ignore Case (i)</NCheckbox>
          <NCheckbox v-model:checked="multiline">Multiline (m)</NCheckbox>
          <NCheckbox v-model:checked="dotAll">DotAll (s)</NCheckbox>
          <NCheckbox v-model:checked="unicode">Unicode (u)</NCheckbox>
        </NSpace>
      </NCard>

      <NCard title="Test Text">
        <NInput
          v-model:value="text"
          type="textarea"
          placeholder="Enter text to match against..."
          :autosize="{ minRows: 3, maxRows: 10 }"
        />
      </NCard>

      <NCard title="Match Results">
        <NAlert v-if="result.error" type="error" style="margin-bottom: 12px;">
          {{ result.error }}
        </NAlert>
        <template v-else>
          <NSpace style="margin-bottom: 12px;">
            <NTag type="info" size="small">{{ result.matchCount }} match{{ result.matchCount !== 1 ? 'es' : '' }}</NTag>
            <NTag type="default" size="small">Flags: {{ flags || 'none' }}</NTag>
          </NSpace>

          <div v-if="text" style="margin-bottom: 12px; padding: 8px; background: var(--color-surface-2); border-radius: 4px; font-family: monospace; white-space: pre-wrap; word-break: break-all;" v-html="highlightedHtml" />

          <NDataTable
            v-if="result.matches.length > 0"
            :columns="matchColumns"
            :data="matchTableData"
            :bordered="false"
            size="small"
          />
          <NAlert v-else-if="!result.error" type="info">
            No matches found
          </NAlert>
        </template>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
