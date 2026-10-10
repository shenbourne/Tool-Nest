<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NDatePicker, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
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
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NDatePicker v-model:formatted-value="input" type="date" value-format="yyyy-MM-dd" format="yyyy-MM-dd" style="width: 100%;" />
      <NAlert v-if="dateError" type="error" :title="dateError" />
      <NInput :value="output" readonly  :input-props="{ id: 'dateWeekdayCalculatorField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
