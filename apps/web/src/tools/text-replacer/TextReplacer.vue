<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSwitch } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const find = ref('');
const replace = ref('');
const useRegex = ref(false);
const output = computed(() => {
  if (!find.value) return input.value;
  try {
    const re = useRegex.value ? new RegExp(find.value, 'g') : new RegExp(find.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g');
    return input.value.replace(re, replace.value);
  } catch { return 'Invalid regex'; }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="4" placeholder="Input text..." />
      <NSpace><NInput v-model:value="find" placeholder="Find..." style="width:200px" /><NInput v-model:value="replace" placeholder="Replace..." style="width:200px" /></NSpace>
      <NSwitch v-model:value="useRegex">Regex</NSwitch>
      <NInput :value="output" type="textarea" :rows="4" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
