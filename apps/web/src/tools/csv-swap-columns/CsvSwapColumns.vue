<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const colA = ref(0);
const colB = ref(1);
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
const output = computed(() => parseCSV(input.value).map(r => {
  const a = colA.value, b = colB.value;
  if (a >= r.length || b >= r.length) return r.join(',');
  const s = [...r]; [s[a], s[b]] = [s[b], s[a]]; return s.join(',');
}).join('\n'));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="5" placeholder="CSV input..." />
      <NSpace><NInputNumber v-model:value="colA" :min="0" placeholder="Column A" style="width:120px" /><NInputNumber v-model:value="colB" :min="0" placeholder="Column B" style="width:120px" /></NSpace>
      <NInput :value="output" type="textarea" :rows="5" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
