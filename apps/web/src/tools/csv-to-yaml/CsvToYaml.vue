<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { parseCSV } from '@/utils/csv';
import yaml from 'js-yaml';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const output = computed(() => {
  const rows = parseCSV(input.value);
  if (rows.length < 2) return '';
  const headers = rows[0];
  // Values come from js-yaml, so special characters stay valid YAML; columns
  // beyond the headers keep their data under generated names instead of being
  // silently dropped.
  const items = rows.slice(1).map(r =>
    Object.fromEntries(r.map((v, i) => [headers[i] ?? `col_${i + 1}`, v])),
  );
  return yaml.dump(items);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
