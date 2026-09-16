<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
function isLeap(y: number) { return (y%4===0 && y%100!==0) || y%400===0; }
const output = computed(() => {
  const years = input.value.split(/[\n,\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (!years.length) return 'Enter years (one per line or space-separated)';
  return years.map(y => y + ': ' + (isLeap(y) ? '✅ Leap year' : '❌ Not a leap year')).join('\n');
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
