<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const output = computed(() => {
  if (!input.value.trim()) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input.value, 'application/xml');
    const err = doc.querySelector('parsererror');
    return err ? '❌ ' + t('tools.xmlValidator.invalidXml') + ': ' + err.textContent : '✅ ' + t('tools.xmlValidator.validXml');
  } catch (e: unknown) { return '❌ ' + t('common.error') + ': ' + (e instanceof Error ? e.message : String(e)); }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'xmlValidatorField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'xmlValidatorField1' }"/>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
