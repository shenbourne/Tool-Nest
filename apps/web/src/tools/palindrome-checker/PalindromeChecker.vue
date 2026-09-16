<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const clean = computed(() => input.value.toLowerCase().replace(/[^a-z0-9]/g,''));
const output = computed(() => {
  const c = clean.value;
  if (!c) return '';
  const rev = c.split('').reverse().join('');
  return c === rev ? '✅ Yes! This is a palindrome.' : '❌ Not a palindrome.';
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
