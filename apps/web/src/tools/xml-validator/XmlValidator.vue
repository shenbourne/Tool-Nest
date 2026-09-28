<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
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
  } catch (e: any) { return '❌ ' + t('common.error') + ': ' + e.message; }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'xmlValidatorField0' }"/>
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'xmlValidatorField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
