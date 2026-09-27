<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
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
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="5" :placeholder="t('common.csvInputPlaceholder')" />
      <NSpace><NInputNumber v-model:value="colA" :min="0" :placeholder="t('tools.csvSwapColumns.columnA')" style="width:120px" /><NInputNumber v-model:value="colB" :min="0" :placeholder="t('tools.csvSwapColumns.columnB')" style="width:120px" /></NSpace>
      <NInput :value="output" type="textarea" :rows="5" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
