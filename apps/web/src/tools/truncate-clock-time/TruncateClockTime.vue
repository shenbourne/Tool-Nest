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
  return [
    String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + ' ' + t('tools.truncateClockTime.original'),
    String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':00 ' + t('tools.truncateClockTime.toMinute'),
    String(h).padStart(2,'0') + ':00:00 ' + t('tools.truncateClockTime.toHour'),
  ].join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'truncateClockTimeField0' }"/>
      <NAlert v-if="error" type="error" :title="error" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'truncateClockTimeField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
