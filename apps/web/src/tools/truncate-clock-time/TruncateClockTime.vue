<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const output = computed(() => {
  const parts = input.value.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 'Enter time as HH:MM:SS';
  const [h=0, m=0, s=0] = parts;
  return [
    String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + ' (original)',
    String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':00 (to minute)',
    String(h).padStart(2,'0') + ':00:00 (to hour)',
  ].join('\n');
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
