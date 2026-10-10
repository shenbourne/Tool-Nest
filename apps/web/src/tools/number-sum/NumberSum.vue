<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const output = computed(() => {
  // Accept both one-per-line and comma-separated lists so pasted rows like
  // "1, 2, 3" are not silently truncated to their first number.
  const nums = input.value.split(/[\n,]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  if (!nums.length) return '';
  const sorted = [...nums].sort((a,b) => a-b);
  const sum = nums.reduce((a,b) => a+b, 0);
  const avg = sum / nums.length;
  const mid = sorted.length % 2 ? sorted[Math.floor(sorted.length/2)] : (sorted[sorted.length/2-1]+sorted[sorted.length/2])/2;
  return [
    `${t('common.count')}: ${nums.length}`,
    t('common.sum', { value: sum }),
    `${t('tools.numberSum.average')}: ${avg.toFixed(4)}`,
    `${t('common.min')}: ${sorted[0]}`,
    `${t('common.max')}: ${sorted[sorted.length-1]}`,
    `${t('tools.numberSum.median')}: ${mid}`,
  ].join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" :file-actions="false">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'numberSumField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'numberSumField1' }"/>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
