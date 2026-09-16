<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref(new Date().toISOString().slice(0,16));
const FORMATS = [['t','Short Time'],['T','Long Time'],['d','Short Date'],['D','Long Date'],['f','Short Date/Time'],['F','Long Date/Time'],['R','Relative']];
const output = computed(() => {
  const d = new Date(input.value);
  if (isNaN(d.getTime())) return 'Invalid date';
  const unix = Math.floor(d.getTime()/1000);
  return FORMATS.map(([f,label]) => '<t:' + unix + ':' + f + '>  (' + label + ')').join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" placeholder="YYYY-MM-DDTHH:mm" />
      <NInput :value="output" type="textarea" :rows="8" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
