<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.csv">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.csvInputPlaceholder')"  :input-props="{ id: 'csvChangeSeparatorField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly  :input-props="{ id: 'csvChangeSeparatorField1' }"/>
      </template>
      <template #params>
        <NSelect v-model:value="newSep" :options="sepOptions" style="width:180px" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
