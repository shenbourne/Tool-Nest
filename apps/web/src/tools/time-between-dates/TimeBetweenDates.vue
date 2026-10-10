<script setup lang="ts">
import { ref, computed } from 'vue';
import { NDatePicker, NFormItem } from 'naive-ui';
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';
import TimeToolPanel from '../date-time/TimeToolPanel.vue';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const date1 = ref(format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));
const date2 = ref(format(new Date(Date.now()+86400000), "yyyy-MM-dd'T'HH:mm:ss"));
const output = computed(() => {
  const d1 = new Date(date1.value), d2 = new Date(date2.value);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return t('common.invalidDates');
  const diff = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return days + ' ' + t('common.days') + ', ' + hours + ' ' + t('common.hours') + ', ' + mins + ' ' + t('common.minutes') + ', ' + secs + ' ' + t('common.seconds') + '\n' + t('tools.timeBetweenDates.total') + ' ' + (diff/1000).toFixed(0) + ' ' + t('common.seconds');
});
const results = computed(() => output.value === t('common.invalidDates') ? [] : output.value.split('\n').map((value, i) => ({ label: i ? t('tools.timeBetweenDates.total') : t('tools.timeBetweenDates.name'), value: i ? value.slice(t('tools.timeBetweenDates.total').length).trim() : value })));
</script>
<template>
  <ToolLayout :tool="tool">
    <TimeToolPanel :results="results">
      <NFormItem :show-feedback="false" :label="t('tools.timeBetweenDates.startPlaceholder')"><NDatePicker v-model:formatted-value="date1" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" format="yyyy-MM-dd HH:mm:ss" :clearable="false" style="width: 100%;" /></NFormItem>
      <NFormItem :show-feedback="false" :label="t('tools.timeBetweenDates.endPlaceholder')"><NDatePicker v-model:formatted-value="date2" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" format="yyyy-MM-dd HH:mm:ss" :clearable="false" style="width: 100%;" /></NFormItem>
      <template #feedback><small>{{ t('tools.dateTime.localTime') }}</small></template>
    </TimeToolPanel>
  </ToolLayout>
</template>
