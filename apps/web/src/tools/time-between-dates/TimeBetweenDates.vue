<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const date1 = ref(new Date().toISOString().slice(0,16));
const date2 = ref(new Date(Date.now()+86400000).toISOString().slice(0,16));
const output = computed(() => {
  const d1 = new Date(date1.value), d2 = new Date(date2.value);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 'Invalid dates';
  const diff = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return days + ' days, ' + hours + ' hours, ' + mins + ' minutes, ' + secs + ' seconds\nTotal: ' + (diff/1000).toFixed(0) + ' seconds';
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace><NInput v-model:value="date1" placeholder="Start date/time" style="width:220px" /><NInput v-model:value="date2" placeholder="End date/time" style="width:220px" /></NSpace>
      <NInput :value="output" type="textarea" :rows="3" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
