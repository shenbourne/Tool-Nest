<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'checkLeapYearsField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'checkLeapYearsField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="skipped.length" type="warning" :title="t('tools.checkLeapYears.ignored', { tokens: skipped.join(', ') })" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
