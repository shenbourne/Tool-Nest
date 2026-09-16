<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const start = ref(0);
const end = ref(10);
const output = computed(() => input.value.slice(start.value, end.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="4" placeholder="Input text..." />
      <NSpace><NInputNumber v-model:value="start" :min="0" placeholder="Start" style="width:120px" /><NInputNumber v-model:value="end" :min="0" placeholder="End" style="width:120px" /></NSpace>
      <NInput :value="output" type="textarea" :rows="3" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
