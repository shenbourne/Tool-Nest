<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('Line 1\nLine 2\nLine 3\nLine 4');
const positions = ref(1);
const output = computed(() => {
  const lines = input.value.split('\n');
  const n = ((positions.value % lines.length) + lines.length) % lines.length;
  return [...lines.slice(n), ...lines.slice(0, n)].join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" placeholder="Input lines..." />
      <NInputNumber v-model:value="positions" placeholder="Positions" style="width:150px" />
      <NInput :value="output" type="textarea" :rows="6" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
