<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { parseCSV, serializeCSV } from '@/utils/csv';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const colA = ref(0);
const colB = ref(1);
const output = computed(() => {
  const rows = parseCSV(input.value);
  const out = rows.map(r => {
    const a = colA.value, b = colB.value;
    if (a >= r.length || b >= r.length) return r;
    const s = [...r]; [s[a], s[b]] = [s[b], s[a]]; return s;
  });
  return serializeCSV(out);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.csv">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="5" :placeholder="t('common.csvInputPlaceholder')"  :input-props="{ id: 'csvSwapColumnsField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="5" readonly  :input-props="{ id: 'csvSwapColumnsField3' }"/>
      </template>
      <template #params>
        <NSpace><NInputNumber v-model:value="colA" :min="0" :placeholder="t('tools.csvSwapColumns.columnA')" style="width:120px"  :input-props="{ id: 'csvSwapColumnsField1' }"/><NInputNumber v-model:value="colB" :min="0" :placeholder="t('tools.csvSwapColumns.columnB')" style="width:120px"  :input-props="{ id: 'csvSwapColumnsField2' }"/></NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
