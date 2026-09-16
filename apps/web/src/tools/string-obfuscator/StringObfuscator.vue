<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSlider, NSelect, NSpace, NFormItem } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const input = ref('my-secret-password-123');
const method = ref<'mask' | 'redact' | 'partial'>('mask');
const keepChars = ref(3);
const maskChar = ref('*');
const output = computed(() => {
  const s = input.value;
  if (!s) return '';
  if (method.value === 'mask') return s.replace(/./g, maskChar.value);
  if (method.value === 'redact') return '[REDACTED]';
  const keep = Math.min(keepChars.value, Math.floor(s.length / 2));
  return s.slice(0, keep) + maskChar.value.repeat(s.length - keep * 2) + s.slice(-keep);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" placeholder="String to obfuscate..." />
      <NSelect v-model:value="method" :options="[{label:'Mask all',value:'mask'},{label:'Redact',value:'redact'},{label:'Partial (keep edges)',value:'partial'}]" />
      <NFormItem v-if="method==='partial'" label="Keep characters" label-placement="left">
        <NSlider v-model:value="keepChars" :min="1" :max="10" style="flex:1;" />
      </NFormItem>
      <NInput :value="output" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
