<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { parseCSV, serializeCSV } from '@/utils/csv';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const pos = ref(1);
const header = ref('new_col');
const defVal = ref('');
const output = computed(() => {
  const rows = parseCSV(input.value);
  if (!rows.length) return '';
  const out = rows.map((r, i) => {
    const p = Math.min(pos.value, r.length);
    return [...r.slice(0, p), i === 0 ? header.value : defVal.value, ...r.slice(p)];
  });
  return serializeCSV(out);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="5" :placeholder="t('common.csvInputPlaceholder')"  :input-props="{ id: 'csvInsertColumnsField0' }"/>
      <NSpace><NInputNumber v-model:value="pos" :min="0" :placeholder="t('tools.csvInsertColumns.position')" style="width:120px"  :input-props="{ id: 'csvInsertColumnsField1' }"/><NInput v-model:value="header" :placeholder="t('tools.csvInsertColumns.headerName')" style="width:150px"  :input-props="{ id: 'csvInsertColumnsField2' }"/><NInput v-model:value="defVal" :placeholder="t('tools.csvInsertColumns.defaultValue')" style="width:150px"  :input-props="{ id: 'csvInsertColumnsField3' }"/></NSpace>
      <NInput :value="output" type="textarea" :rows="5" readonly  :input-props="{ id: 'csvInsertColumnsField4' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
