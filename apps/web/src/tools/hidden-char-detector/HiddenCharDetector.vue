<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const output = computed(() => {
  if (!input.value) return '';
  return input.value.split('').map((c, i) => {
    const code = c.charCodeAt(0);
    if (code < 32 || code === 127 || (code >= 0x200B && code <= 0x200F) || code === 0xFEFF || code === 0x00A0)
      return `[pos ${i}] U+${code.toString(16).toUpperCase().padStart(4,'0')} (${JSON.stringify(c)})`;
    return '';
  }).filter(Boolean).join('\n') || 'No hidden characters detected.';
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
