<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref(new Date().toISOString().slice(0,10));
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const output = computed(() => {
  const d = new Date(input.value);
  if (isNaN(d.getTime())) return 'Invalid date';
  return DAYS[d.getDay()] + ' (' + input.value + ')';
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" placeholder="YYYY-MM-DD" />
      <NInput :value="output" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
