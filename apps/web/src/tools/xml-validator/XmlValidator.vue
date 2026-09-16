<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const output = computed(() => {
  if (!input.value.trim()) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input.value, 'application/xml');
    const err = doc.querySelector('parsererror');
    return err ? '❌ Invalid XML: ' + err.textContent : '✅ Valid XML';
  } catch (e: any) { return '❌ Error: ' + e.message; }
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
