<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { parseCSV, serializeCSV } from '@/utils/csv';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const output = computed(() => {
  const rows = parseCSV(input.value);
  if (!rows.length) return '';
  const maxCols = Math.max(...rows.map(r => r.length));
  const out = Array.from({ length: maxCols }, (_, c) => rows.map(r => r[c] ?? ''));
  return serializeCSV(out);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'csvRowsToColumnsField0' }"/>
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'csvRowsToColumnsField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
