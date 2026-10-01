<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const error = computed(() => {
  const v = input.value.trim();
  return v && !/^\d+(\.\d+)?$/.test(v) ? t('common.invalidNumber') : '';
});
const output = computed(() => {
  if (error.value) return '';
  const h = parseFloat(input.value);
  if (isNaN(h)) return '';
  const d = Math.floor(h / 24); const rem = h % 24;
  return h + ' ' + t('common.hours') + ' = ' + d + ' ' + t('common.days') + ' ' + rem + ' ' + t('common.hours');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'hoursToDaysField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'hoursToDaysField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="error" type="error" :title="error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
