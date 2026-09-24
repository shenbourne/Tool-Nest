<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const pos = ref(1);
const header = ref('new_col');
const defVal = ref('');
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
const output = computed(() => {
  const rows = parseCSV(input.value);
  if (!rows.length) return '';
  return rows.map((r, i) => {
    const p = Math.min(pos.value, r.length);
    const newRow = [...r.slice(0, p), i === 0 ? header.value : defVal.value, ...r.slice(p)];
    return newRow.join(',');
  }).join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="5" :placeholder="t('common.csvInputPlaceholder')" />
      <NSpace><NInputNumber v-model:value="pos" :min="0" :placeholder="t('tools.csvInsertColumns.position')" style="width:120px" /><NInput v-model:value="header" :placeholder="t('tools.csvInsertColumns.headerName')" style="width:150px" /><NInput v-model:value="defVal" :placeholder="t('tools.csvInsertColumns.defaultValue')" style="width:150px" /></NSpace>
      <NInput :value="output" type="textarea" :rows="5" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
