<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
function isLeap(y: number) { return (y%4===0 && y%100!==0) || y%400===0; }
// parseInt silently truncated junk like "2023abc"; report it instead.
const skipped = computed(() => input.value.split(/[\n,\s]+/).filter(s => s && !/^-?\d+$/.test(s)));
const years = computed(() => input.value.split(/[\n,\s]+/).filter(s => /^-?\d+$/.test(s)).map(Number));
const output = computed(() => {
  if (!years.value.length) return '';
  return years.value.map(y => y + ': ' + (isLeap(y) ? t('tools.checkLeapYears.isLeap') : t('tools.checkLeapYears.notLeap'))).join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'checkLeapYearsField0' }"/>
      <NAlert v-if="skipped.length" type="warning" :title="t('tools.checkLeapYears.ignored', { tokens: skipped.join(', ') })" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'checkLeapYearsField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
