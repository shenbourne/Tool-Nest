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
  try { JSON.parse(input.value); return '✅ ' + t('tools.jsonValidate.valid'); }
  catch (e: any) { return '❌ ' + t('common.invalidJson') + ': ' + e.message; }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'jsonValidateField0' }"/>
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'jsonValidateField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
