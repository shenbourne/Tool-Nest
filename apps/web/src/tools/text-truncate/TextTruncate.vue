<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber, NSelect } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('');
const limit = ref(100);
const mode = ref('chars');
const output = computed(() => {
  if (mode.value === 'chars') return input.value.slice(0, limit.value);
  if (mode.value === 'words') return input.value.split(/\s+/).slice(0, limit.value).join(' ');
  return input.value.split('\n').slice(0, limit.value).join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="5" placeholder="Input text..." />
      <NSpace>
        <NSelect v-model:value="mode" :options="[{label:'Characters',value:'chars'},{label:'Words',value:'words'},{label:'Lines',value:'lines'}]" style="width:140px" />
        <NInputNumber v-model:value="limit" :min="1" style="width:120px" />
      </NSpace>
      <NInput :value="output" type="textarea" :rows="5" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
