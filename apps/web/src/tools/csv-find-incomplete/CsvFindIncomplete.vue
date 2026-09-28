<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { parseCSV } from '@/utils/csv';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const output = computed(() => {
  const rows = parseCSV(input.value);
  if (rows.length < 2) return '';
  const expected = rows[0].length;
  const incomplete = rows.slice(1).map((r,i) => ({line: i+2, cols: r.length})).filter(r => r.cols < expected);
  return incomplete.length ? incomplete.map(r => t('tools.csvFindIncomplete.incompleteRow', { line: r.line, cols: r.cols, expected })).join('\n') : t('tools.csvFindIncomplete.allRowsValid', { expected });
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'csvFindIncompleteField0' }"/>
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'csvFindIncompleteField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
