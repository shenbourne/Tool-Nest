<script setup lang="ts">
import { ref, computed } from 'vue';
import { NFormItem, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import TimeToolPanel from '../date-time/TimeToolPanel.vue';
import DateTimePicker from '@/components/DateTimePicker.vue';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { formatLocalDate, parseLocalDate } from './date-weekday-calculator.service';
const { t } = useI18n();
const input = ref(formatLocalDate(new Date()));
const DAYS = computed(() => [
  t('tools.dateWeekdayCalculator.sunday'),
  t('tools.dateWeekdayCalculator.monday'),
  t('tools.dateWeekdayCalculator.tuesday'),
  t('tools.dateWeekdayCalculator.wednesday'),
  t('tools.dateWeekdayCalculator.thursday'),
  t('tools.dateWeekdayCalculator.friday'),
  t('tools.dateWeekdayCalculator.saturday'),
]);
const dateError = computed(() => (input.value.trim() && !parseLocalDate(input.value) ? t('common.invalidDate') : ''));
const output = computed(() => {
  const d = parseLocalDate(input.value);
  if (!d) return '';
  return DAYS.value[d.getDay()] + ' (' + input.value + ')';
});
const results = computed(() => output.value ? [{ label: t('tools.dateWeekdayCalculator.name'), value: output.value }] : []);
</script>
<template>
  <ToolLayout :tool="tool">
    <TimeToolPanel :results="results">
      <NFormItem :show-feedback="false" :label="t('tools.dateTime.date')"><DateTimePicker v-model:formatted-value="input" date-only /></NFormItem>
      <template #feedback><NAlert v-if="dateError" type="error">{{ dateError }}</NAlert></template>
    </TimeToolPanel>
  </ToolLayout>
</template>
