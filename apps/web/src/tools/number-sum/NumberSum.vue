<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const output = computed(() => {
  const nums = input.value.split('\n').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  if (!nums.length) return '';
  const sorted = [...nums].sort((a,b) => a-b);
  const sum = nums.reduce((a,b) => a+b, 0);
  const avg = sum / nums.length;
  const mid = sorted.length % 2 ? sorted[Math.floor(sorted.length/2)] : (sorted[sorted.length/2-1]+sorted[sorted.length/2])/2;
  return `Count: ${nums.length}\nSum: ${sum}\nAverage: ${avg.toFixed(4)}\nMin: ${sorted[0]}\nMax: ${sorted[sorted.length-1]}\nMedian: ${mid}`;
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
