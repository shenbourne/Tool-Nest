<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { sortKeys } from './json-sort.service';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const error = computed(() => {
  if (!input.value.trim()) return '';
  try { JSON.parse(input.value); return ''; } catch { return t('common.invalidJson'); }
});
const output = computed(() => {
  if (error.value) return '';
  try { return JSON.stringify(sortKeys(JSON.parse(input.value)), null, 2); } catch { return ''; }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.json">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'jsonSortField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'jsonSortField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="error" type="error" :title="error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
