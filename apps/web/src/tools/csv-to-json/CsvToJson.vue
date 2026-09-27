<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { parseCSV } from '@/utils/csv';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const warning = computed(() => {
  const rows = parseCSV(input.value);
  if (rows.length < 2) return '';
  const headers = rows[0];
  const duplicate = headers.length !== new Set(headers).size;
  const extra = rows.slice(1).some(r => r.length > headers.length);
  if (duplicate && extra) return t('tools.csvToJson.duplicateAndExtraColumns');
  if (duplicate) return t('tools.csvToJson.duplicateHeaders');
  if (extra) return t('tools.csvToJson.extraColumns');
  return '';
});
const output = computed(() => {
  const rows = parseCSV(input.value);
  if (rows.length < 2) return '';
  const headers = rows[0];
  // Keep duplicate headers from silently overwriting each other.
  const uniqueHeaders = headers.map((h, i) => (headers.indexOf(h) === i ? h : `${h}_${i + 1}`));
  return JSON.stringify(
    rows.slice(1).map(r => Object.fromEntries(uniqueHeaders.map((h, i) => [h, r[i] ?? '']))),
    null,
    2,
  );
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')" />
      <NAlert v-if="warning" type="warning" :title="warning" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
