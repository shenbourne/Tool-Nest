<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { parseCSV, serializeCSV } from '@/utils/csv';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const newSep = ref(';');
const sepOptions = computed(() => [
  { label: t('tools.csvChangeSeparator.semicolon'), value: ';' },
  { label: t('tools.csvChangeSeparator.pipe'), value: '|' },
  { label: t('tools.csvChangeSeparator.tab'), value: '\t' },
  { label: t('tools.csvChangeSeparator.comma'), value: ',' },
]);
const output = computed(() => serializeCSV(parseCSV(input.value), newSep.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.csvInputPlaceholder')" />
      <NSelect v-model:value="newSep" :options="sepOptions" style="width:180px" />
      <NInput :value="output" type="textarea" :rows="6" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
