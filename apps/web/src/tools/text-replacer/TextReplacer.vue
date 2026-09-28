<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSwitch, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const find = ref('');
const replace = ref('');
const useRegex = ref(false);
// Keep the failure message out of the result field so a broken pattern never
// masquerades as a replacement result.
const regexError = computed(() => {
  if (!useRegex.value || !find.value) return '';
  try { new RegExp(find.value); return ''; } catch { return t('tools.textReplacer.invalidRegex'); }
});
const output = computed(() => {
  if (regexError.value) return '';
  if (!find.value) return input.value;
  const re = useRegex.value ? new RegExp(find.value, 'g') : new RegExp(find.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g');
  return input.value.replace(re, replace.value);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="4" :placeholder="t('tools.textReplacer.inputPlaceholder')"  :input-props="{ id: 'textReplacerField0' }"/>
      <NSpace><NInput v-model:value="find" :placeholder="t('tools.textReplacer.findPlaceholder')" style="width:200px"  :input-props="{ id: 'textReplacerField1' }"/><NInput v-model:value="replace" :placeholder="t('tools.textReplacer.replacePlaceholder')" style="width:200px"  :input-props="{ id: 'textReplacerField2' }"/></NSpace>
      <NSwitch v-model:value="useRegex">{{ t('common.regex') }}</NSwitch>
      <NAlert v-if="regexError" type="error" :title="regexError" />
      <NInput :value="output" type="textarea" :rows="4" readonly  :input-props="{ id: 'textReplacerField3' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
