<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
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
      <NInput v-model:value="input" type="textarea" :rows="5" placeholder="CSV input..." />
      <NSpace><NInputNumber v-model:value="pos" :min="0" placeholder="Position" style="width:120px" /><NInput v-model:value="header" placeholder="Header name" style="width:150px" /><NInput v-model:value="defVal" placeholder="Default value" style="width:150px" /></NSpace>
      <NInput :value="output" type="textarea" :rows="5" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
