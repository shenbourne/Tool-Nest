<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const error = computed(() => {
  const v = input.value.trim();
  if (!v) return '';
  // Hours 0-23, minutes/seconds 0-59, one to three segments.
  return /^([01]?\d|2[0-3])(:[0-5]?\d){0,2}$/.test(v) ? '' : t('common.invalidTime');
});
const output = computed(() => {
  if (error.value || !input.value.trim()) return '';
  const parts = input.value.trim().split(':').map(Number);
  const [h=0, m=0, s=0] = parts;
  return (h + m/60 + s/3600).toFixed(4) + ' ' + t('common.hours');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'timeToDecimalField0' }"/>
      <NAlert v-if="error" type="error" :title="error" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'timeToDecimalField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
