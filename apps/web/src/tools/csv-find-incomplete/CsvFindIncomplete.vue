<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
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
  if (rows.length < 2) return '';
  const expected = rows[0].length;
  const incomplete = rows.slice(1).map((r,i) => ({line: i+2, cols: r.length})).filter(r => r.cols < expected);
  return incomplete.length ? incomplete.map(r => 'Line ' + r.line + ': ' + r.cols + ' columns (expected ' + expected + ')').join('\n') : 'All rows have ' + expected + ' columns.';
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" placeholder="Input..." />
      <NInput :value="output" type="textarea" :rows="6" readonly placeholder="Output..." />
    </NSpace></NCard>
  </ToolLayout>
</template>
