<script setup lang="ts">
import { ref, computed } from 'vue';
import { NTimePicker, NFormItem, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import TimeToolPanel from '../date-time/TimeToolPanel.vue';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('12:34:56');
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
const results = computed(() => output.value ? output.value.split('\n').map((line, i) => ({ label: t('tools.truncateClockTime.' + ['original', 'toMinute', 'toHour'][i]), value: line.split(' ')[0] })) : []);
</script>
<template>
  <ToolLayout :tool="tool">
    <TimeToolPanel :results="results">
      <NFormItem :show-feedback="false" :label="t('tools.dateTime.clockInput')"><NTimePicker v-model:formatted-value="input" format="HH:mm:ss" value-format="HH:mm:ss" :clearable="false" style="width: 100%;" /></NFormItem>
      <template #feedback><NAlert v-if="error" type="error">{{ error }}</NAlert></template>
    </TimeToolPanel>
  </ToolLayout>
</template>
