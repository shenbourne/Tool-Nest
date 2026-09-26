<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref(new Date().toISOString().slice(0,10));
const DAYS = computed(() => [
  t('tools.dateWeekdayCalculator.sunday'),
  t('tools.dateWeekdayCalculator.monday'),
  t('tools.dateWeekdayCalculator.tuesday'),
  t('tools.dateWeekdayCalculator.wednesday'),
  t('tools.dateWeekdayCalculator.thursday'),
  t('tools.dateWeekdayCalculator.friday'),
  t('tools.dateWeekdayCalculator.saturday'),
]);
const output = computed(() => {
  const d = new Date(input.value);
  if (isNaN(d.getTime())) return t('common.invalidDate');
  return DAYS.value[d.getDay()] + ' (' + input.value + ')';
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" placeholder="YYYY-MM-DD" />
      <NInput :value="output" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
