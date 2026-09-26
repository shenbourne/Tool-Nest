<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const newSep = ref(';');
const sepOptions = computed(() => [
  { label: t('tools.csvChangeSeparator.semicolon'), value: ';' },
  { label: t('tools.csvChangeSeparator.pipe'), value: '|' },
  { label: t('tools.csvChangeSeparator.tab'), value: '\t' },
  { label: t('tools.csvChangeSeparator.comma'), value: ',' },
]);
function parseCSV(text: string, sep = ','): string[][] {
  return text.trim().split('\n').map(line => {
    const row: string[] = []; let cur = ''; let inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === sep && !inQ) { row.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    row.push(cur.trim()); return row;
  }).filter(r => r.some(c => c));
}
const output = computed(() => parseCSV(input.value).map(r => r.map(c => c.includes(newSep.value) ? '"' + c + '"' : c).join(newSep.value)).join('\n'));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.csvInputPlaceholder')" />
      <NSelect v-model:value="newSep" :options="sepOptions" style="width:180px" />
      <NInput :value="output" type="textarea" :rows="6" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
