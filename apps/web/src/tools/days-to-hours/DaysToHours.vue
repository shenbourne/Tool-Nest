<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const NUMERIC = /^-?\d+(\.\d+)?$/;
// parseFloat silently truncates junk like "3abc" or "1,5" to a wrong number;
// only accept a fully numeric value.
const inputError = computed(() => {
  const v = input.value.trim();
  return v && !NUMERIC.test(v) ? t('tools.daysToHours.invalidInput') : '';
});
const output = computed(() => {
  const v = input.value.trim();
  if (!NUMERIC.test(v)) return '';
  const d = parseFloat(v);
  const h = d * 24; const m = h * 60; const s = m * 60;
  return d + ' ' + t('common.days') + ' =\n' + h + ' ' + t('common.hours') + '\n' + m + ' ' + t('common.minutes') + '\n' + s + ' ' + t('common.seconds');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'daysToHoursField0' }"/>
      <NAlert v-if="inputError" type="error" :title="inputError" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'daysToHoursField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
