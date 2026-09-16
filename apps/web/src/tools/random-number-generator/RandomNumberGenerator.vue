<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NInputNumber, NButton, NInput, NSwitch } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const min = ref(1); const max = ref(100); const count = ref(1);
const unique = ref(false); const result = ref('');
function gen() {
  const nums = new Set<number>();
  const range = max.value - min.value + 1;
  if (unique.value && count.value > range) { result.value = 'Range too small for unique numbers'; return; }
  while (nums.size < count.value) {
    nums.add(Math.floor(Math.random() * range) + min.value);
    if (nums.size > 10000) break;
  }
  result.value = [...nums].join(', ');
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace><NInputNumber v-model:value="min" placeholder="Min" style="width:120px" /><NInputNumber v-model:value="max" placeholder="Max" style="width:120px" /><NInputNumber v-model:value="count" :min="1" :max="10000" placeholder="Count" style="width:120px" /></NSpace>
      <NSwitch v-model:value="unique">Unique only</NSwitch>
      <NButton type="primary" @click="gen">Generate</NButton>
      <NInput :value="result" type="textarea" :rows="4" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
