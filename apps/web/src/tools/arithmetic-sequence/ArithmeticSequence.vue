<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NInputNumber, NInput } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const start = ref(1);
const diff = ref(3);
const count = ref(10);
const seq = computed(() => Array.from({length: count.value}, (_, i) => start.value + i * diff.value));
const nth = computed(() => start.value + (count.value - 1) * diff.value);
const sum = computed(() => count.value * (start.value + nth.value) / 2);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace><NInputNumber v-model:value="start" placeholder="First term" style="width:130px" /><NInputNumber v-model:value="diff" placeholder="Difference" style="width:130px" /><NInputNumber v-model:value="count" :min="1" :max="100" placeholder="Count" style="width:130px" /></NSpace>
      <NInput :value="'Sequence: ' + seq.join(', ')" readonly />
      <NInput :value="'n-th term: ' + nth + ' | Sum: ' + sum" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
