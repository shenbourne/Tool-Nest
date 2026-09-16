<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSwitch } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const mode = ref<'escape'|'unescape'>('escape');
const output = computed(() => {
  try {
    if (mode.value === 'escape') return JSON.stringify(input.value);
    return JSON.parse(input.value);
  } catch { return 'Invalid input'; }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSwitch :value="mode === 'escape'" @update:value="mode = $event ? 'escape' : 'unescape'">Escape / Unescape</NSwitch>
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="mode === 'escape' ? 'Text to escape...' : 'JSON string to unescape...'" />
      <NInput :value="output" type="textarea" :rows="6" readonly placeholder="Output..." />
    </NSpace></NCard>
  </ToolLayout>
</template>
