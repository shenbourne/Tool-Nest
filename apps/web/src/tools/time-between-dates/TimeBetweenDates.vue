<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const date1 = ref(new Date().toISOString().slice(0,16));
const date2 = ref(new Date(Date.now()+86400000).toISOString().slice(0,16));
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
    <NCard><NSpace vertical :size="12">
      <NSpace><NInput v-model:value="date1" :placeholder="t('tools.timeBetweenDates.startPlaceholder')" style="width:220px"  :input-props="{ id: 'timeBetweenDatesField0' }"/><NInput v-model:value="date2" :placeholder="t('tools.timeBetweenDates.endPlaceholder')" style="width:220px"  :input-props="{ id: 'timeBetweenDatesField1' }"/></NSpace>
      <NInput :value="output" type="textarea" :rows="3" readonly  :input-props="{ id: 'timeBetweenDatesField2' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
