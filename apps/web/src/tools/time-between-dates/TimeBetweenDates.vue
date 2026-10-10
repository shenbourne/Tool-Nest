<script setup lang="ts">
import { ref, computed } from 'vue';
import { NDatePicker, NInput, NSpace } from 'naive-ui';
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="output" :output-title="t('common.output')" export-name="time-diff.txt" hide-input>
      <template #output>
        <NInput :value="output" type="textarea" :rows="3" readonly  :input-props="{ id: 'timeBetweenDatesField2' }"/>
      </template>
      <template #params>
        <NSpace>
          <label style="display: grid; gap: 6px;">
            <span>{{ t('tools.timeBetweenDates.startPlaceholder') }}</span>
            <NDatePicker v-model:formatted-value="date1" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" format="yyyy-MM-dd HH:mm:ss" :placeholder="t('tools.timeBetweenDates.startPlaceholder')" style="width: 100%; min-width: 220px;" />
          </label>
          <label style="display: grid; gap: 6px;">
            <span>{{ t('tools.timeBetweenDates.endPlaceholder') }}</span>
            <NDatePicker v-model:formatted-value="date2" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" format="yyyy-MM-dd HH:mm:ss" :placeholder="t('tools.timeBetweenDates.endPlaceholder')" style="width: 100%; min-width: 220px;" />
          </label>
        </NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
