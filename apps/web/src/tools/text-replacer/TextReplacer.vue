<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const find = ref('');
const replace = ref('');
const useRegex = ref(false);
const output = computed(() => {
  if (!find.value) return input.value;
  try {
    const re = useRegex.value ? new RegExp(find.value, 'g') : new RegExp(find.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g');
    return input.value.replace(re, replace.value);
  } catch { return t('tools.textReplacer.invalidRegex'); }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="4" :placeholder="t('tools.textReplacer.inputPlaceholder')" />
      <NSpace><NInput v-model:value="find" :placeholder="t('tools.textReplacer.findPlaceholder')" style="width:200px" /><NInput v-model:value="replace" :placeholder="t('tools.textReplacer.replacePlaceholder')" style="width:200px" /></NSpace>
      <NSwitch v-model:value="useRegex">{{ t('common.regex') }}</NSwitch>
      <NInput :value="output" type="textarea" :rows="4" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
